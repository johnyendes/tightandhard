'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/field';

export function PricingButtons({ tierId }: { tierId: string }) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (tierId === 'free') {
    return (
      <Button
        variant='secondary'
        onClick={() => (isSignedIn ? router.push('/character-gen') : router.push('/sign-up'))}
      >
        {isSignedIn ? 'Start creating' : 'Start free'}
      </Button>
    );
  }

  if (tierId === 'enterprise') {
    return (
      <Button variant='secondary' onClick={() => (window.location.href = 'mailto:sales@tightandhard.com')}>
        Contact sales
      </Button>
    );
  }

  const onSubscribe = async () => {
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onSubscribe} disabled={loading}>
      {loading ? 'Loading…' : 'Subscribe'}
    </Button>
  );
}
