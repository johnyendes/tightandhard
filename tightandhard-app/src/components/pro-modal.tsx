'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useProModal } from '@/hooks/use-pro-modal';

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stripe');

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className='space-y-4'>
          <DialogTitle className='text-center'>Go Premium</DialogTitle>
          <DialogDescription className='text-center space-y-2'>
            Unlimited chat, voice calls, and
            <span className='text-pink-500 mx-1 font-medium'>custom AI girlfriends</span>
            designed your way.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className='flex justify-between items-center'>
          <p className='text-2xl font-medium'>
            $24<span className='text-sm font-normal'>.99 / mo</span>
          </p>
          <Button onClick={onSubscribe} disabled={loading} variant='premium'>
            Subscribe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
