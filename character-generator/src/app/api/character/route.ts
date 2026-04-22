/**
 * POST /api/character — create a new character
 * GET  /api/character — list current user's characters
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { randomSeed } from '@/lib/replicate';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();

    const {
      name,
      displayName,
      archetype,
      bio,
      visualStyle,
      photographySettings,
      basePrompt,
      negativePrompt,
      masterFaceUrl,
      useFaceSwap = true,
      useControlNet = true,
      campaignId,
    } = body as Record<string, any>;

    if (!name || !basePrompt) {
      return new NextResponse('Missing required fields: name, basePrompt', { status: 400 });
    }

    // Plan-based character limit check
    const sub = await prisma.userSubscription.findUnique({ where: { userId } });
    const charCount = await prisma.character.count({ where: { userId } });
    const maxChars = sub?.maxCharacters ?? 1;
    if (charCount >= maxChars) {
      return new NextResponse(
        `Character limit reached for your plan (${maxChars}). Upgrade to create more.`,
        { status: 402 },
      );
    }

    const character = await prisma.character.create({
      data: {
        userId,
        name,
        displayName: displayName ?? name,
        archetype,
        bio: bio ?? {},
        visualStyle: visualStyle ?? { aesthetic: 'cinematic' },
        photographySettings: photographySettings ?? undefined,
        baseSeed: randomSeed(),
        masterFaceUrl,
        basePrompt,
        negativePrompt:
          negativePrompt ??
          'cartoon, illustration, anime, 3d render, distorted hands, bad anatomy, low quality, blurry, watermark, text',
        useFaceSwap,
        useControlNet,
        status: 'draft',
        campaignId: campaignId ?? undefined,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[CHARACTER_POST]', message);
    return new NextResponse(message, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const characters = await prisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { images: true } } },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error('[CHARACTER_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
