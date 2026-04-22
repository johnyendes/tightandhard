'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const AGE_GATE_KEY = 'tightandhard_age_confirmed';

export const AgeGate = () => {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AGE_GATE_KEY);
    setConfirmed(stored === 'true');
  }, []);

  const handleConfirm = () => {
    const hash = btoa(`${new Date().toISOString()}|${navigator.userAgent}`);
    localStorage.setItem(AGE_GATE_KEY, 'true');
    localStorage.setItem(`${AGE_GATE_KEY}_hash`, hash);
    setConfirmed(true);
  };

  const handleDeny = () => {
    window.location.href = 'https://www.google.com';
  };

  if (confirmed === null) return null;
  if (confirmed) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4'>
      <div className='max-w-md w-full bg-background border border-primary/20 rounded-lg p-8 text-center space-y-6'>
        <h1 className='text-3xl font-bold text-primary'>TightandHard</h1>
        <div className='space-y-2'>
          <p className='text-lg font-semibold'>Adults Only — 18+</p>
          <p className='text-sm text-muted-foreground'>
            This site contains content intended for adults aged 18 years or older.
            By entering, you confirm you are of legal age in your jurisdiction and
            consent to viewing adult-oriented AI companion content.
          </p>
        </div>
        <div className='flex flex-col gap-3'>
          <Button onClick={handleConfirm} size='lg' variant='premium'>
            I am 18 or older — Enter
          </Button>
          <Button onClick={handleDeny} size='lg' variant='outline'>
            I am under 18 — Exit
          </Button>
        </div>
        <p className='text-xs text-muted-foreground'>
          By entering you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};
