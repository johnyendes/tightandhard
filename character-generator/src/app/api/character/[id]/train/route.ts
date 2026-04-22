/**
 * POST /api/character/:id/train — start a LoRA training run
 * GET  /api/character/:id/train — latest training status for this character
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  getTrainingStatus,
  makeTriggerWord,
  startLoraTraining,
} from '@/lib/lora-trainer';

export const runtime = 'nodejs';

async function ownedCharacter(id: string, userId: string) {
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return null;
  if (c.userId !== userId) return null;
  return c;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const character = await ownedCharacter(params.id, userId);
    if (!character) return new NextResponse('Not found', { status: 404 });

    const { inputImageUrls, inputImagesZipUrl, steps, learningRate } =
      (await req.json()) as {
        inputImageUrls?: string[];
        inputImagesZipUrl?: string;
        steps?: number;
        learningRate?: number;
      };

    if (!inputImagesZipUrl) {
      return new NextResponse(
        'inputImagesZipUrl required — upload a zip of 15-30 training images to Cloudinary first',
        { status: 400 },
      );
    }

    if (!inputImageUrls || inputImageUrls.length < 10) {
      return new NextResponse('Include at least 10 training image URLs', { status: 400 });
    }

    // One active training at a time per character
    const inFlight = await prisma.loraTraining.findFirst({
      where: {
        characterId: character.id,
        status: { in: ['pending', 'training'] },
      },
    });
    if (inFlight) {
      return new NextResponse('A training is already in progress for this character', {
        status: 409,
      });
    }

    const triggerWord = makeTriggerWord(character.name, character.id);
    const destOwner = process.env.REPLICATE_USERNAME;
    if (!destOwner) {
      return new NextResponse(
        'REPLICATE_USERNAME not set — required for destination model',
        { status: 500 },
      );
    }

    const record = await prisma.loraTraining.create({
      data: {
        userId,
        characterId: character.id,
        triggerWord,
        inputImageUrls,
        steps: steps ?? 1000,
        learningRate: learningRate ?? 0.0004,
        status: 'pending',
      },
    });

    try {
      const training = await startLoraTraining({
        inputImagesZipUrl,
        triggerWord,
        steps,
        learningRate,
        destinationModelOwner: destOwner,
        destinationModelName: `lora-${character.id.slice(-8)}-${Date.now()}`,
      });

      const updated = await prisma.loraTraining.update({
        where: { id: record.id },
        data: {
          replicateTrainingId: training.trainingId,
          status: 'training',
          startedAt: new Date(),
        },
      });

      return NextResponse.json(updated);
    } catch (err) {
      await prisma.loraTraining.update({
        where: { id: record.id },
        data: {
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown training error',
        },
      });
      throw err;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[TRAIN_POST]', message);
    return new NextResponse(message, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const character = await ownedCharacter(params.id, userId);
    if (!character) return new NextResponse('Not found', { status: 404 });

    const training = await prisma.loraTraining.findFirst({
      where: { characterId: character.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!training) return NextResponse.json(null);

    // If still running, poll Replicate for fresh status
    if (
      training.replicateTrainingId &&
      (training.status === 'pending' || training.status === 'training')
    ) {
      const live = await getTrainingStatus(training.replicateTrainingId);
      const updates: Record<string, unknown> = {
        status: mapReplicateStatus(live.status),
        progress: live.progress,
      };
      if (live.errorMessage) updates.errorMessage = live.errorMessage;
      if (live.status === 'succeeded' && live.loraUrl) {
        updates.outputLoraUrl = live.loraUrl;
        updates.completedAt = new Date();
        // Attach LoRA URL to the character so future generations use it
        await prisma.character.update({
          where: { id: character.id },
          data: { loraModelUrl: live.loraUrl, status: 'ready' },
        });
      }
      const updated = await prisma.loraTraining.update({
        where: { id: training.id },
        data: updates,
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(training);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    console.error('[TRAIN_GET]', message);
    return new NextResponse(message, { status: 500 });
  }
}

function mapReplicateStatus(s: string): string {
  if (s === 'succeeded') return 'succeeded';
  if (s === 'failed' || s === 'canceled') return 'failed';
  if (s === 'starting' || s === 'processing') return 'training';
  return 'pending';
}
