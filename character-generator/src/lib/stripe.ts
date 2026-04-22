import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

export interface PricingTier {
  id: 'free' | 'starter' | 'pro' | 'studio' | 'enterprise';
  name: string;
  price: number; // cents
  monthlyImageQuota: number; // 0 = unlimited
  maxCharacters: number;
  allowCommercial: boolean;
  allowRedistribution: boolean;
  description: string;
  features: string[];
}

export const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    monthlyImageQuota: 10,
    maxCharacters: 1,
    allowCommercial: false,
    allowRedistribution: false,
    description: 'Try the generator with one character. Watermarked.',
    features: ['10 images/month', '1 character', 'Watermarked output', 'Personal use only'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 1900,
    monthlyImageQuota: 100,
    maxCharacters: 3,
    allowCommercial: true,
    allowRedistribution: false,
    description: 'For indie brands and freelancers running their own ads.',
    features: ['100 images/month', '3 characters', 'Commercial license', 'No watermark'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4900,
    monthlyImageQuota: 500,
    maxCharacters: 10,
    allowCommercial: true,
    allowRedistribution: false,
    description: 'For agencies and active marketers running multiple campaigns.',
    features: ['500 images/month', '10 characters', 'Commercial license', 'LoRA training included'],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 14900,
    monthlyImageQuota: 2000,
    maxCharacters: 25,
    allowCommercial: true,
    allowRedistribution: true,
    description: 'For studios producing for multiple clients.',
    features: ['2,000 images/month', '25 characters', 'Redistribution rights', 'Priority training queue'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0,
    monthlyImageQuota: 0,
    maxCharacters: 0,
    allowCommercial: true,
    allowRedistribution: true,
    description: 'Custom terms. API access. Dedicated support.',
    features: ['Unlimited images', 'Unlimited characters', 'Full rights', 'API + SLA'],
  },
];

export function tierById(id: string): PricingTier | undefined {
  return TIERS.find((t) => t.id === id);
}

export function tierByStripePriceId(priceId: string | undefined): PricingTier | undefined {
  if (!priceId) return undefined;
  // Map Stripe price IDs to tiers via env vars.
  const map: Record<string, PricingTier['id']> = {
    [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
    [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
    [process.env.STRIPE_PRICE_STUDIO ?? '']: 'studio',
  };
  const tierId = map[priceId];
  return tierId ? tierById(tierId) : undefined;
}
