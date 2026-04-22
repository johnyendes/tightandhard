import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

import prisma from '@/lib/prisma';

import { CharacterDetailClient } from './detail-client';

export default async function CharacterDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const character = await prisma.character.findUnique({
    where: { id: params.id },
  });
  if (!character || character.userId !== userId) notFound();

  const images = await prisma.generatedImage.findMany({
    where: { characterId: character.id },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });

  return (
    <main className='min-h-screen px-6 py-12'>
      <div className='max-w-5xl mx-auto space-y-8'>
        <div>
          <a href='/character-gen' className='text-sm text-muted-foreground hover:underline'>
            ← Back to your models
          </a>
          <div className='flex items-end justify-between mt-4'>
            <div>
              <h1 className='text-3xl font-bold'>{character.displayName ?? character.name}</h1>
              <p className='text-muted-foreground'>
                {character.archetype ? `${character.archetype} · ` : ''}
                {character.totalImages} image{character.totalImages === 1 ? '' : 's'} generated
              </p>
            </div>
            <span className='text-xs uppercase tracking-wider px-2 py-1 rounded bg-secondary'>
              {character.status}
            </span>
          </div>
        </div>

        <CharacterDetailClient
          characterId={character.id}
          characterName={character.displayName ?? character.name}
          initialImages={images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl ?? '',
            status: img.status,
            prompt: img.prompt,
            createdAt: img.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
