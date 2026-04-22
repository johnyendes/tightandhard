import { Check } from 'lucide-react';

import { TIERS } from '@/lib/stripe';

import { PricingButtons } from './pricing-buttons';

export default function PricingPage() {
  return (
    <main className='min-h-screen px-6 py-16'>
      <div className='max-w-6xl mx-auto space-y-12'>
        <div className='text-center space-y-3'>
          <p className='text-sm uppercase tracking-widest text-muted-foreground'>Pricing</p>
          <h1 className='text-4xl md:text-5xl font-bold'>Pick your tier</h1>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Start free. Upgrade when your campaigns demand more.
            Every paid tier includes commercial rights and no watermarks.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className='border rounded-lg p-6 flex flex-col space-y-4 bg-secondary/10'
            >
              <div>
                <h3 className='text-lg font-semibold'>{tier.name}</h3>
                <p className='text-sm text-muted-foreground mt-1 min-h-[2.5rem]'>
                  {tier.description}
                </p>
              </div>

              <div>
                {tier.id === 'enterprise' ? (
                  <p className='text-2xl font-bold'>Contact us</p>
                ) : (
                  <p className='text-3xl font-bold'>
                    ${tier.price / 100}
                    <span className='text-sm font-normal text-muted-foreground'>/mo</span>
                  </p>
                )}
              </div>

              <ul className='space-y-2 flex-1'>
                {tier.features.map((f) => (
                  <li key={f} className='flex items-start gap-2 text-sm'>
                    <Check className='w-4 h-4 mt-0.5 text-pink-500 flex-shrink-0' />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <PricingButtons tierId={tier.id} />
            </div>
          ))}
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          All plans billed monthly. Cancel any time. No image rollover.
        </div>
      </div>
    </main>
  );
}
