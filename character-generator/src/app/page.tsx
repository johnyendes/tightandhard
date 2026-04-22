import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center px-6 py-24'>
      <div className='max-w-3xl text-center space-y-8'>
        <p className='text-sm uppercase tracking-widest text-muted-foreground'>TightandHard Models</p>
        <h1 className='text-5xl md:text-6xl font-bold tracking-tight'>
          Your own AI model. <br />
          <span className='text-pink-500'>Every shot. Every outfit. Every campaign.</span>
        </h1>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
          Generate consistent photorealistic models for your brand. One face, infinite
          variations — swimwear, beachwear, lifestyle, summer fashion, and more.
          Built for marketers, agencies, and indie brands.
        </p>
        <div className='flex flex-col md:flex-row gap-4 justify-center pt-4'>
          <Link
            href='/character-gen'
            className='inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition'
          >
            Build your model
          </Link>
          <Link
            href='/pricing'
            className='inline-flex items-center justify-center h-12 px-8 border border-border rounded-md font-medium hover:bg-secondary transition'
          >
            See pricing
          </Link>
        </div>
        <div className='pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left'>
          <Feature title='Same face, every time' body='Seed locking + LoRA training keeps your model consistent across thousands of generations.' />
          <Feature title='Commercial ready' body='Licensing tiers built in. Starter to Enterprise. Clear rights, no surprises.' />
          <Feature title='Works with your brand' body='Dial in aesthetic, lighting, color palette, and photography settings per campaign.' />
        </div>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className='space-y-2'>
      <h3 className='font-semibold'>{title}</h3>
      <p className='text-sm text-muted-foreground'>{body}</p>
    </div>
  );
}
