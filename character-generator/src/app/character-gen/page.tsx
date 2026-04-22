import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import prisma from '@/lib/prisma';

export default async function CharacterGenPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const characters = await prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { images: true } } },
  });

  return (
    <main className='min-h-screen px-6 py-12'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Your Models</h1>
            <p className='text-muted-foreground'>{characters.length} character{characters.length === 1 ? '' : 's'}</p>
          </div>
          <a
            href='/character-gen/new'
            className='inline-flex items-center h-10 px-5 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition'
          >
            + New character
          </a>
        </div>

        {characters.length === 0 ? (
          <div className='border border-dashed rounded-lg p-12 text-center space-y-3'>
            <p className='text-lg font-medium'>No characters yet</p>
            <p className='text-sm text-muted-foreground'>
              Start by defining your first AI model — name, look, style, and target audience.
            </p>
            <a href='/character-gen/new' className='inline-block mt-4 underline'>
              Create your first character →
            </a>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {characters.map((c) => (
              <a
                key={c.id}
                href={`/character-gen/${c.id}`}
                className='border rounded-lg p-5 hover:border-primary transition space-y-2'
              >
                <div className='flex items-center justify-between'>
                  <h3 className='font-semibold'>{c.displayName ?? c.name}</h3>
                  <span className='text-xs px-2 py-0.5 rounded bg-secondary'>{c.status}</span>
                </div>
                {c.archetype && (
                  <p className='text-sm text-muted-foreground'>{c.archetype}</p>
                )}
                <p className='text-xs text-muted-foreground pt-2'>
                  {c._count.images} image{c._count.images === 1 ? '' : 's'} generated
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
