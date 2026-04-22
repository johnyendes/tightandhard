/**
 * GET    /api/character/:id — fetch one character (owner only)
 * PATCH  /api/character/:id — update
 * DELETE /api/character/:id — archive / delete
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

async function ownedCharacter(id: string, userId: string) {
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return null;
  if (c.userId !== userId) return null;
  return c;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    const character = await ownedCharacter(params.id, userId);
    if (!character) return new NextResponse('Not found', { status: 404 });
    const images = await prisma.generatedImage.findMany({
      where: { characterId: character.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ character, images });
  } catch (error) {
    console.error('[CHARACTER_GET_BY_ID]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    const character = await ownedCharacter(params.id, userId);
    if (!character) return new NextResponse('Not found', { status: 404 });
    const body = await req.json();

    // Whitelist updatable fields
    const data: Record<string, unknown> = {};
    for (const key of [
      'name',
      'displayName',
      'archetype',
      'bio',
      'visualStyle',
      'photographySettings',
      'basePrompt',
      'negativePrompt',
      'masterFaceUrl',
      'useFaceSwap',
      'useControlNet',
      'loraModelUrl',
      'status',
      'isPublic',
      'campaignId',
    ]) {
      if (key in body) data[key] = body[key];
    }

    const updated = await prisma.character.update({
      where: { id: character.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[CHARACTER_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });
    const character = await ownedCharacter(params.id, userId);
    if (!character) return new NextResponse('Not found', { status: 404 });
    await prisma.character.update({
      where: { id: character.id },
      data: { status: 'archived' },
    });
    return NextResponse.json({ archived: true });
  } catch (error) {
    console.error('[CHARACTER_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
