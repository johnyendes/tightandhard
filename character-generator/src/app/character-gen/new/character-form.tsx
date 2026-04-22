'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

import { ImageUpload } from '@/components/image-upload';
import { Button, FieldRow, Input, Label, Select, Textarea } from '@/components/ui/field';

type FormState = {
  name: string;
  displayName: string;
  archetype: string;
  age: string;
  ethnicity: string;
  build: string;
  hairColor: string;
  hairLength: string;
  hairStyle: string;
  eyeColor: string;
  features: string;
  aesthetic: string;
  lighting: string;
  mood: string;
  colorPalette: string;
  camera: string;
  lens: string;
  aperture: string;
  iso: string;
  basePrompt: string;
  masterFaceUrl: string;
};

const INITIAL: FormState = {
  name: '',
  displayName: '',
  archetype: '',
  age: '22',
  ethnicity: '',
  build: 'slim',
  hairColor: 'brunette',
  hairLength: 'long',
  hairStyle: 'loose waves',
  eyeColor: 'brown',
  features: '',
  aesthetic: 'cinematic',
  lighting: 'golden hour',
  mood: 'warm and inviting',
  colorPalette: '',
  camera: '35mm',
  lens: '85mm',
  aperture: 'f/1.8',
  iso: '100',
  basePrompt: '',
  masterFaceUrl: '',
};

export function CharacterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildAutoPrompt = () => {
    const parts = [
      `photorealistic portrait of a ${form.age}-year-old woman`,
      form.ethnicity,
      `${form.build} build`,
      form.hairColor && form.hairLength ? `${form.hairLength} ${form.hairColor} hair (${form.hairStyle || 'natural style'})` : '',
      form.eyeColor ? `${form.eyeColor} eyes` : '',
      form.features,
      `${form.aesthetic} style`,
      form.lighting ? `${form.lighting} lighting` : '',
      form.mood,
    ].filter(Boolean);
    set('basePrompt', parts.join(', '));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        displayName: form.displayName || form.name,
        archetype: form.archetype || undefined,
        bio: {
          age: form.age,
          ethnicity: form.ethnicity || undefined,
          build: form.build || undefined,
          hair: { color: form.hairColor, length: form.hairLength, style: form.hairStyle || undefined },
          eyes: form.eyeColor ? { color: form.eyeColor } : undefined,
          features: form.features ? form.features.split(',').map((s) => s.trim()).filter(Boolean) : [],
        },
        visualStyle: {
          aesthetic: form.aesthetic,
          lighting: form.lighting || undefined,
          mood: form.mood || undefined,
          colorPalette: form.colorPalette ? form.colorPalette.split(',').map((s) => s.trim()).filter(Boolean) : [],
        },
        photographySettings: {
          camera: form.camera || undefined,
          lens: form.lens || undefined,
          aperture: form.aperture || undefined,
          iso: form.iso ? Number(form.iso) : undefined,
          depthOfField: true,
        },
        basePrompt: form.basePrompt,
        masterFaceUrl: form.masterFaceUrl || undefined,
      };

      const res = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create character');
      }

      const created = await res.json();
      router.push(`/character-gen/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className='space-y-10'>
      {/* Identity */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Identity</h2>
        <FieldRow>
          <div>
            <Label htmlFor='name'>Internal name</Label>
            <Input
              id='name'
              required
              placeholder='e.g. Summer Campaign Model #1'
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='displayName'>Display name</Label>
            <Input
              id='displayName'
              placeholder='Ava'
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
            />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor='archetype'>Archetype</Label>
          <Input
            id='archetype'
            placeholder='Girl Next Door / Sultry Mature / Athletic / Elegant'
            value={form.archetype}
            onChange={(e) => set('archetype', e.target.value)}
          />
        </div>
      </section>

      {/* Bio */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Bio</h2>
        <FieldRow columns={3}>
          <div>
            <Label htmlFor='age'>Age</Label>
            <Input id='age' value={form.age} onChange={(e) => set('age', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='ethnicity'>Ethnicity</Label>
            <Input
              id='ethnicity'
              placeholder='Latina, Caucasian, Asian, mixed...'
              value={form.ethnicity}
              onChange={(e) => set('ethnicity', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor='build'>Build</Label>
            <Select id='build' value={form.build} onChange={(e) => set('build', e.target.value)}>
              <option value='slim'>Slim</option>
              <option value='athletic'>Athletic</option>
              <option value='curvy'>Curvy</option>
              <option value='fit'>Fit</option>
              <option value='petite'>Petite</option>
              <option value='tall'>Tall</option>
            </Select>
          </div>
        </FieldRow>
        <FieldRow columns={3}>
          <div>
            <Label htmlFor='hairColor'>Hair color</Label>
            <Input id='hairColor' value={form.hairColor} onChange={(e) => set('hairColor', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='hairLength'>Hair length</Label>
            <Select id='hairLength' value={form.hairLength} onChange={(e) => set('hairLength', e.target.value)}>
              <option value='short'>Short</option>
              <option value='medium'>Medium</option>
              <option value='long'>Long</option>
              <option value='very long'>Very long</option>
            </Select>
          </div>
          <div>
            <Label htmlFor='hairStyle'>Hair style</Label>
            <Input
              id='hairStyle'
              placeholder='loose waves, straight, ponytail...'
              value={form.hairStyle}
              onChange={(e) => set('hairStyle', e.target.value)}
            />
          </div>
        </FieldRow>
        <FieldRow>
          <div>
            <Label htmlFor='eyeColor'>Eye color</Label>
            <Input id='eyeColor' value={form.eyeColor} onChange={(e) => set('eyeColor', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='features'>Features (comma-separated)</Label>
            <Input
              id='features'
              placeholder='freckles, dimples, high cheekbones'
              value={form.features}
              onChange={(e) => set('features', e.target.value)}
            />
          </div>
        </FieldRow>
      </section>

      {/* Visual style */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Visual style</h2>
        <FieldRow>
          <div>
            <Label htmlFor='aesthetic'>Aesthetic</Label>
            <Select id='aesthetic' value={form.aesthetic} onChange={(e) => set('aesthetic', e.target.value)}>
              <option value='cinematic'>Cinematic</option>
              <option value='studio'>Studio</option>
              <option value='candid'>Candid</option>
              <option value='minimal'>Minimal</option>
              <option value='editorial'>Editorial</option>
              <option value='lifestyle'>Lifestyle</option>
            </Select>
          </div>
          <div>
            <Label htmlFor='lighting'>Lighting</Label>
            <Input
              id='lighting'
              placeholder='golden hour, soft studio, dramatic rim'
              value={form.lighting}
              onChange={(e) => set('lighting', e.target.value)}
            />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor='mood'>Mood</Label>
          <Input
            id='mood'
            placeholder='warm and inviting / editorial / carefree summer'
            value={form.mood}
            onChange={(e) => set('mood', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor='colorPalette'>Color palette (comma-separated)</Label>
          <Input
            id='colorPalette'
            placeholder='warm terracotta, cream, soft gold'
            value={form.colorPalette}
            onChange={(e) => set('colorPalette', e.target.value)}
          />
        </div>
      </section>

      {/* Photography */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Photography settings</h2>
        <FieldRow columns={2}>
          <div>
            <Label htmlFor='camera'>Camera</Label>
            <Input id='camera' value={form.camera} onChange={(e) => set('camera', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='lens'>Lens</Label>
            <Input id='lens' value={form.lens} onChange={(e) => set('lens', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='aperture'>Aperture</Label>
            <Input id='aperture' value={form.aperture} onChange={(e) => set('aperture', e.target.value)} />
          </div>
          <div>
            <Label htmlFor='iso'>ISO</Label>
            <Input id='iso' type='number' value={form.iso} onChange={(e) => set('iso', e.target.value)} />
          </div>
        </FieldRow>
      </section>

      {/* Base prompt */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Base prompt</h2>
        <p className='text-sm text-muted-foreground'>
          The core description passed to the image model for every generation. You can edit freely.
        </p>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='secondary' size='sm' onClick={buildAutoPrompt}>
            Auto-build from bio
          </Button>
          <span className='text-xs text-muted-foreground'>Fills the box below using your bio + visual style.</span>
        </div>
        <Textarea
          required
          rows={5}
          value={form.basePrompt}
          placeholder='photorealistic portrait of a 22-year-old woman, slim build, long brunette hair (loose waves), brown eyes, cinematic style, golden hour lighting, warm and inviting'
          onChange={(e) => set('basePrompt', e.target.value)}
        />
      </section>

      {/* Master face */}
      <section className='space-y-4'>
        <h2 className='text-xl font-semibold'>Master face (optional)</h2>
        <p className='text-sm text-muted-foreground'>
          Upload a reference face photo. Every future generation will face-swap onto this face for consistency.
          Skip now and add later if you want — the character still works without one.
        </p>
        <ImageUpload
          value={form.masterFaceUrl}
          onChange={(url) => set('masterFaceUrl', url)}
          label='Master face'
          hint='JPG / PNG / WebP, under 10MB. Close-up, clear face, good lighting.'
        />
      </section>

      {error && <div className='p-3 border border-red-500 rounded-md text-sm text-red-600'>{error}</div>}

      <div className='flex gap-3'>
        <Button type='submit' disabled={submitting}>
          {submitting ? 'Creating…' : 'Create character'}
        </Button>
        <Button type='button' variant='ghost' onClick={() => router.push('/character-gen')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
