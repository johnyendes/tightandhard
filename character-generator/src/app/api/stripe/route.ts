/**
 * POST /api/stripe — start a checkout session for a given tier.
 * Body: { tier: 'starter' | 'pro' | 'studio' }
 * Returns: { url }
 *
 * If the user already has an active subscription, returns the billing portal URL instead.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { stripe, tierById } from '@/lib/stripe';

const absoluteUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'}${path}`;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return new NextResponse('Unauthorized', { status: 401 });

    const { tier: tierId } = (await req.json()) as { tier: string };
    const tier = tierById(tierId);
    if (!tier || tier.id === 'free' || tier.id === 'enterprise') {
      return new NextResponse('Invalid tier for checkout', { status: 400 });
    }

    const existing = await prisma.userSubscription.findUnique({ where: { userId } });
    const returnUrl = absoluteUrl('/character-gen');

    if (existing?.stripeCustomerId) {
      // Already a Stripe customer — send them to the billing portal to change tier / cancel
      const portal = await stripe.billingPortal.sessions.create({
        customer: existing.stripeCustomerId,
        return_url: returnUrl,
      });
      return NextResponse.json({ url: portal.url });
    }

    // New subscription checkout
    const priceIdEnvKey =
      tier.id === 'starter' ? 'STRIPE_PRICE_STARTER' :
      tier.id === 'pro' ? 'STRIPE_PRICE_PRO' :
      'STRIPE_PRICE_STUDIO';
    const priceId = process.env[priceIdEnvKey];

    const session = await stripe.checkout.sessions.create({
      success_url: returnUrl,
      cancel_url: absoluteUrl('/pricing'),
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.emailAddresses[0]?.emailAddress,
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'USD',
                product_data: {
                  name: `TightandHard Models — ${tier.name}`,
                  description: tier.description,
                },
                unit_amount: tier.price,
                recurring: { interval: 'month' },
              },
              quantity: 1,
            },
          ],
      metadata: { userId, tier: tier.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[STRIPE_POST]', message);
    return new NextResponse(message, { status: 500 });
  }
}
