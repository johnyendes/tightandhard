/**
 * POST /api/generate
 * Body: { characterId: string, shot?: ShotType, outfit?: string, pose?: string, setting?: string }
 *
 * Generates a new image for an existing character using their locked seed + LoRA + base prompt.
 * Persists the result to GeneratedImage and returns the URL.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { generateImage, faceSwap, randomSeed } from '@/lib/replicate';
import {
  buildPositivePrompt,
  buildNegativePrompt,
  type ShotType,
} from '@/lib/prompt-builder';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { characterId, shot, outfit, pose, setting } = body as {
      characterId: string;
      shot?: ShotType;
      outfit?: string;
      pose?: string;
      setting?: string;
    };

    if (!characterId) {
      return new NextResponse('Missing characterId', { status: 400 });
    }

    const character = await prisma.character.findUnique({ where: { id: characterId } });
    if (!character || character.userId !== userId) {
      return new NextResponse('Character not found', { status: 404 });
    }

    // Enforce plan quota
    const sub = await prisma.userSubscription.findUnique({ where: { userId } });
    if (sub && sub.monthlyImageQuota > 0 && sub.imagesUsedThisMonth >= sub.monthlyImageQuota) {
      return new NextResponse('Monthly image quota exceeded', { status: 402 });
    }

    // Build prompt from character config
    const bio = (character.bio as Record<string, unknown>) ?? {};
    const style = (character.visualStyle as Record<string, unknown>) ?? { aesthetic: 'cinematic' };
    const photo = (character.photographySettings as Record<string, unknown>) ?? undefined;

    const prompt = buildPositivePrompt({
      bio: bio as any,
      style: style as any,
      photo: photo as any,
      shot: shot ?? 'portrait',
      outfit,
      pose,
      setting,
      extraPositive: [character.basePrompt],
    });

    const negativePrompt = buildNegativePrompt({
      bio: bio as any,
      style: style as any,
      shot: shot ?? 'portrait',
      extraNegative: character.negativePrompt ? [character.negativePrompt] : undefined,
    });

    // Seed strategy: base seed ± small variation for slight pose diversity
    // while keeping face close to master.
    const seed = character.baseSeed + Math.floor(Math.random() * 100);

    // Persist pending row
    const image = await prisma.generatedImage.create({
      data: {
        characterId: character.id,
        userId,
        prompt,
        negativePrompt,
        seed,
        steps: 30,
        guidanceScale: 7.5,
        width: 1024,
        height: 1024,
        modelUsed: 'sdxl',
        status: 'generating',
      },
    });

    try {
      // Generate
      const genStart = Date.now();
      const result = await generateImage({
        model: 'sdxl',
        prompt,
        negativePrompt,
        seed,
        width: 1024,
        height: 1024,
        loraUrl: character.loraModelUrl ?? undefined,
      });

      let finalUrl = result.imageUrl;
      let faceSwapped = false;

      // Optional face swap
      if (character.useFaceSwap && character.masterFaceUrl) {
        try {
          finalUrl = await faceSwap({
            targetImageUrl: result.imageUrl,
            sourceFaceUrl: character.masterFaceUrl,
          });
          faceSwapped = true;
        } catch (err) {
          console.warn('[face-swap] failed, using original:', err);
        }
      }

      const updated = await prisma.generatedImage.update({
        where: { id: image.id },
        data: {
          imageUrl: finalUrl,
          replicateJobId: result.predictionId,
          faceSwapped,
          status: 'complete',
          generationTimeMs: Date.now() - genStart,
        },
      });

      // Update character stats + user quota
      await Promise.all([
        prisma.character.update({
          where: { id: character.id },
          data: {
            totalImages: { increment: 1 },
            successfulGens: { increment: 1 },
          },
        }),
        sub
          ? prisma.userSubscription.update({
              where: { userId },
              data: { imagesUsedThisMonth: { increment: 1 } },
            })
          : Promise.resolve(),
      ]);

      return NextResponse.json(updated);
    } catch (err) {
      await prisma.generatedImage.update({
        where: { id: image.id },
        data: {
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown generation error',
        },
      });
      await prisma.character.update({
        where: { id: character.id },
        data: { failedGens: { increment: 1 } },
      });
      throw err;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[GENERATE_POST]', message);
    return new NextResponse(message, { status: 500 });
  }
}
