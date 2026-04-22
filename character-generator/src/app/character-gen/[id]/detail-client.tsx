'use client';

import { useState } from 'react';

import { Button, Input, Label, Select, Textarea } from '@/components/ui/field';
import { optimizeCloudinary } from '@/lib/utils';

import { TrainPanel } from './train-panel';

interface GeneratedImageSummary {
  id: string;
  imageUrl: string;
  status: string;
  prompt: string;
  createdAt: string;
}

export function CharacterDetailClient(props: {
  characterId: string;
  characterName: string;
  initialImages: GeneratedImageSummary[];
}) {
  const [images, setImages] = useState(props.initialImages);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shot, setShot] = useState<'portrait' | 'half-body' | 'full-body' | 'close-up' | 'wide'>('portrait');
  const [outfit, setOutfit] = useState('');
  const [pose, setPose] = useState('');
  const [setting, setSetting] = useState('');

  const onGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: props.characterId,
          shot,
          outfit: outfit || undefined,
          pose: pose || undefined,
          setting: setting || undefined,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Generation failed');
      }
      const newImage = await res.json();
      setImages((prev) => [
        {
          id: newImage.id,
          imageUrl: newImage.imageUrl ?? '',
          status: newImage.status,
          prompt: newImage.prompt,
          createdAt: newImage.createdAt ?? new Date().toISOString(),
        },
        ...prev,
      ]);
      // Clear scene-specific inputs, keep shot default
      setOutfit('');
      setPose('');
      setSetting('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='space-y-10'>
      {/* LoRA training panel */}
      <TrainPanel characterId={props.characterId} />

      {/* Generate panel */}
      <section className='border rounded-lg p-6 space-y-4 bg-secondary/30'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Generate new image</h2>
          <span className='text-xs text-muted-foreground'>
            Persona, seed, and LoRA are locked to this character
          </span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='shot'>Shot type</Label>
            <Select id='shot' value={shot} onChange={(e) => setShot(e.target.value as typeof shot)}>
              <option value='portrait'>Portrait (head/shoulders)</option>
              <option value='half-body'>Half-body</option>
              <option value='full-body'>Full-body</option>
              <option value='close-up'>Close-up</option>
              <option value='wide'>Wide / environmental</option>
            </Select>
          </div>
          <div>
            <Label htmlFor='outfit'>Outfit</Label>
            <Input
              id='outfit'
              placeholder='white summer sundress, denim jacket over black tee...'
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor='pose'>Pose / action</Label>
          <Input
            id='pose'
            placeholder='leaning against a doorway, one hand in her hair'
            value={pose}
            onChange={(e) => setPose(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor='setting'>Setting</Label>
          <Textarea
            id='setting'
            rows={2}
            placeholder='sunlit kitchen in the morning / rooftop at sunset, city lights / beach at golden hour'
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
          />
        </div>

        {error && <div className='p-3 border border-red-500 rounded-md text-sm text-red-600'>{error}</div>}

        <div className='flex items-center gap-3'>
          <Button onClick={onGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate image'}
          </Button>
          <span className='text-xs text-muted-foreground'>
            Takes 15-30 seconds. Image consumes 1 from your monthly quota.
          </span>
        </div>
      </section>

      {/* Image grid */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>Gallery</h2>
          <span className='text-sm text-muted-foreground'>{images.length} image{images.length === 1 ? '' : 's'}</span>
        </div>

        {images.length === 0 ? (
          <div className='border border-dashed rounded-lg p-12 text-center text-sm text-muted-foreground'>
            No images yet. Generate your first one above.
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {images.map((img) => (
              <figure key={img.id} className='border rounded-lg overflow-hidden bg-secondary/20'>
                {img.status === 'complete' && img.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimizeCloudinary(img.imageUrl)}
                    alt={img.prompt.slice(0, 80)}
                    className='w-full aspect-square object-cover'
                  />
                ) : (
                  <div className='w-full aspect-square flex items-center justify-center text-xs text-muted-foreground'>
                    {img.status === 'failed' ? 'Generation failed' : 'Generating…'}
                  </div>
                )}
                <figcaption className='p-3 text-xs text-muted-foreground line-clamp-2'>
                  {img.prompt}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
