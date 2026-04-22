/**
 * Stripe webhook handler.
 * Listens for checkout completion + subscription lifecycle events to keep the
 * UserSubscription row in sync with Stripe's source of truth.
 */

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import prisma from '@/lib/prisma';
import { stripe, tierById } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    return new NextResponse(
      `Webhook signature verification failed: ${err instanceof Error ? err.message : 'unknown'}`,
      { status: 400 },
    );
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
      if (!session.subscription) return new NextResponse(null, { status: 200 });
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      const userId = session.metadata?.userId;
      const tierId = session.metadata?.tier;
      if (!userId || !tierId) {
        return new NextResponse('Missing userId or tier in session metadata', { status: 400 });
      }

      const tier = tierById(tierId);
      if (!tier) return new NextResponse('Unknown tier', { status: 400 });

      await prisma.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: tier.id,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          monthlyImageQuota: tier.monthlyImageQuota,
          maxCharacters: tier.maxCharacters,
        },
        update: {
          plan: tier.id,
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          monthlyImageQuota: tier.monthlyImageQuota,
          maxCharacters: tier.maxCharacters,
        },
      });
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) return new NextResponse(null, { status: 200 });
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          // Reset monthly image counter on each successful renewal
          imagesUsedThisMonth: 0,
        },
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { plan: 'free', monthlyImageQuota: 10, maxCharacters: 1 },
      });
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error('[STRIPE_WEBHOOK]', err);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }
}
