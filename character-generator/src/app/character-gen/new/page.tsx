import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { CharacterForm } from './character-form';

export default async function NewCharacterPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className='min-h-screen px-6 py-12'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-8'>
          <a href='/character-gen' className='text-sm text-muted-foreground hover:underline'>
            ← Back to your models
          </a>
          <h1 className='text-3xl font-bold mt-4'>Create a new character</h1>
          <p className='text-muted-foreground mt-1'>
            Define who she is — look, style, and the story behind the face.
          </p>
        </div>
        <CharacterForm />
      </div>
    </main>
  );
}
