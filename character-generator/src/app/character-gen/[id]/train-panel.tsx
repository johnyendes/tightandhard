'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useEffect, useRef, useState } from 'react';

import { Button, Input, Label } from '@/components/ui/field';

interface TrainPanelProps {
  characterId: string;
  onTrainingComplete?: () => void;
}

type TrainingStatus = {
  id: string;
  status: 'pending' | 'training' | 'succeeded' | 'failed' | 'cancelled';
  progress: number;
  errorMessage: string | null;
  outputLoraUrl: string | null;
} | null;

export function TrainPanel({ characterId, onTrainingComplete }: TrainPanelProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [zipUrl, setZipUrl] = useState('');
  const [steps, setSteps] = useState(1000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [training, setTraining] = useState<TrainingStatus>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'tightandhard_models';

  // Load current training status on mount
  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while active
  useEffect(() => {
    if (training?.status === 'pending' || training?.status === 'training') {
      pollRef.current = setInterval(fetchStatus, 15_000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [training?.status]);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/character/${characterId}/train`);
      if (!res.ok) return;
      const data = await res.json();
      setTraining(data);
      if (data?.status === 'succeeded') onTrainingComplete?.();
    } catch {
      // silent — next poll will retry
    }
  };

  const onAddImage = (url: string) => {
    if (imageUrls.includes(url)) return;
    setImageUrls((prev) => [...prev, url]);
  };

  const onRemoveImage = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const onStart = async () => {
    setError(null);
    if (imageUrls.length < 10) {
      setError('Upload at least 10 training images (15-30 recommended)');
      return;
    }
    if (!zipUrl) {
      setError('Paste the zip URL containing all training images');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/character/${characterId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputImageUrls: imageUrls, inputImagesZipUrl: zipUrl, steps }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to start training');
      }
      const data = await res.json();
      setTraining(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  };

  // Active training state
  if (training && (training.status === 'pending' || training.status === 'training')) {
    return (
      <section className='border rounded-lg p-6 space-y-4 bg-secondary/30'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Training in progress</h2>
          <span className='text-xs px-2 py-1 rounded bg-secondary'>{training.status}</span>
        </div>
        <div className='space-y-2'>
          <div className='h-2 bg-secondary rounded-full overflow-hidden'>
            <div
              className='h-full bg-primary transition-all'
              style={{ width: `${Math.round(training.progress * 100)}%` }}
            />
          </div>
          <p className='text-sm text-muted-foreground'>
            {Math.round(training.progress * 100)}% — typically 15-30 minutes.
            You can leave this page and come back.
          </p>
        </div>
      </section>
    );
  }

  // Completed state
  if (training?.status === 'succeeded' && training.outputLoraUrl) {
    return (
      <section className='border rounded-lg p-6 space-y-2 bg-green-500/5 border-green-500/30'>
        <h2 className='text-xl font-semibold'>LoRA trained and attached</h2>
        <p className='text-sm text-muted-foreground'>
          All future generations for this character will use the trained LoRA for face consistency.
        </p>
      </section>
    );
  }

  // Failed state
  if (training?.status === 'failed') {
    return (
      <section className='border rounded-lg p-6 space-y-2 bg-red-500/5 border-red-500/30'>
        <h2 className='text-xl font-semibold'>Training failed</h2>
        {training.errorMessage && (
          <p className='text-sm text-red-600'>{training.errorMessage}</p>
        )}
        <Button onClick={() => setTraining(null)} variant='secondary' size='sm'>
          Try again
        </Button>
      </section>
    );
  }

  // Default: setup form
  return (
    <section className='border rounded-lg p-6 space-y-4 bg-secondary/30'>
      <div>
        <h2 className='text-xl font-semibold'>Train a LoRA for true consistency</h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Upload 15-30 reference photos of this character. Training takes ~15-30 min and costs ~$2-5 on Replicate.
          Once done, every generation will match her face exactly.
        </p>
      </div>

      {/* Multi-upload grid */}
      <div className='space-y-2'>
        <Label>Training images ({imageUrls.length} of 15-30)</Label>
        <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2'>
          {imageUrls.map((url) => (
            <button
              key={url}
              type='button'
              onClick={() => onRemoveImage(url)}
              className='relative aspect-square rounded overflow-hidden border hover:opacity-75 transition'
              title='Click to remove'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt='training sample' className='w-full h-full object-cover' />
            </button>
          ))}
          <CldUploadWidget
            uploadPreset={uploadPreset}
            onUpload={(result: any) => {
              const url = result?.info?.secure_url;
              if (typeof url === 'string') onAddImage(url);
            }}
            options={{
              sources: ['local', 'url'],
              multiple: true,
              maxFiles: 30,
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              maxFileSize: 10_000_000,
              tags: [`training_${characterId}`],
            }}
          >
            {({ open }) => (
              <button
                type='button'
                onClick={() => open?.()}
                className='aspect-square rounded border-2 border-dashed flex items-center justify-center text-2xl text-muted-foreground hover:border-primary transition'
              >
                +
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      <div>
        <Label htmlFor='zip-url'>Zip URL</Label>
        <Input
          id='zip-url'
          placeholder='https://res.cloudinary.com/.../training_images.zip'
          value={zipUrl}
          onChange={(e) => setZipUrl(e.target.value)}
        />
        <p className='text-xs text-muted-foreground mt-1'>
          Replicate's trainer needs a zip URL. Easiest: upload your images to Cloudinary with tag{' '}
          <code className='px-1 bg-secondary rounded'>training_{characterId.slice(-6)}</code>,
          then download as zip from the Cloudinary console and re-upload the zip to any public URL.
        </p>
      </div>

      <div>
        <Label htmlFor='steps'>Training steps</Label>
        <Input
          id='steps'
          type='number'
          min={500}
          max={4000}
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
        />
        <p className='text-xs text-muted-foreground mt-1'>
          1000 is the sweet spot. Under-train and face drifts; over-train and poses become stiff.
        </p>
      </div>

      {error && <div className='p-3 border border-red-500 rounded-md text-sm text-red-600'>{error}</div>}

      <Button onClick={onStart} disabled={submitting || imageUrls.length < 10 || !zipUrl}>
        {submitting ? 'Starting…' : 'Start LoRA training'}
      </Button>
    </section>
  );
}
