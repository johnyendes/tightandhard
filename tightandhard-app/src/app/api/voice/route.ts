/**
 * POST /api/voice
 * Body: { text: string, style: VoiceStyle, emotion?: Emotion }
 * Returns: streaming MP3 audio (Content-Type: audio/mpeg)
 *
 * Authentication required via Clerk. Rate-limited via Upstash.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';
import { synthesizeSpeech, type VoiceStyle, type Emotion } from '@/lib/voice';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const identifier = `voice_${userId}`;
    const { success } = await rateLimit(identifier);
    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const { text, style, emotion } = (await req.json()) as {
      text: string;
      style: VoiceStyle;
      emotion?: Emotion;
    };

    if (!text || typeof text !== 'string' || text.length === 0) {
      return new NextResponse('Missing or empty text', { status: 400 });
    }

    if (text.length > 2000) {
      return new NextResponse('Text too long (max 2000 chars)', { status: 400 });
    }

    const stream = await synthesizeSpeech({ text, style, emotion });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[VOICE_API]', message);
    return new NextResponse(message, { status: 500 });
  }
}
