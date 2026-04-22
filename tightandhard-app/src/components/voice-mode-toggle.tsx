'use client';

import { Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceModeToggleProps {
  enabled: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}

export const VoiceModeToggle = ({ enabled, isPlaying, onToggle }: VoiceModeToggleProps) => {
  return (
    <Button
      onClick={onToggle}
      size='sm'
      variant={enabled ? 'premium' : 'ghost'}
      className={cn('gap-1.5', isPlaying && 'animate-pulse')}
      title={enabled ? 'Voice mode on — messages will speak' : 'Voice mode off — tap to hear her'}
    >
      {enabled ? <Volume2 className='h-4 w-4' /> : <VolumeX className='h-4 w-4' />}
      <span className='hidden sm:inline text-xs'>{enabled ? 'Voice on' : 'Voice off'}</span>
    </Button>
  );
};
