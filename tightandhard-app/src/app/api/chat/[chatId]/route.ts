/**
 * POST /api/chat/[chatId]
 *
 * Enhanced chat endpoint for TightandHard.
 *   - OpenAI gpt-4o-mini with streaming
 *   - Bonding XP awarded per message, tier-up detection
 *   - Emotion state computed and persisted
 *   - Memory extraction on user messages, structured memories saved
 *   - Core memories injected into system prompt
 *   - Companion persona fields (voiceStyle, personality) feed the flavor
 */

import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { applyXp, isThoughtfulMessage, xpForInteraction } from '@/lib/bonding';
import { buildSystemPrompt, type CoreMemory } from '@/lib/chat-context';
import {
  type EmotionState,
  type EmotionVector,
  applyEvent,
  decay,
  dominant,
  initialState,
} from '@/lib/emotion';
import { MemoryManager } from '@/lib/memory';
import { extractMemories } from '@/lib/memory-extraction';
import prismadb from '@/lib/prismadb';
import { rateLimit } from '@/lib/rate-limit';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getOrCreateBond(userId: string, companionId: string) {
  const existing = await prismadb.bond.findUnique({
    where: { userId_companionId: { userId, companionId } },
  });
  if (existing) return existing;
  return prismadb.bond.create({
    data: { userId, companionId, tier: 1, xp: 0 },
  });
}

async function loadCoreMemories(companionId: string, limit = 8): Promise<CoreMemory[]> {
  const memories = await prismadb.memory.findMany({
    where: { companionId, isCore: true },
    orderBy: [{ importance: 'desc' }, { lastAccessedAt: 'desc' }],
    take: limit,
  });
  return memories.map((m) => ({
    content: m.content,
    importance: m.importance,
    type: m.type,
  }));
}

async function saveExtractedMemories(
  userId: string,
  companionId: string,
  userMessage: string,
) {
  const extracted = await extractMemories(userMessage);
  if (extracted.length === 0) return;

  await Promise.all(
    extracted.map((m) =>
      prismadb.memory.create({
        data: {
          userId,
          companionId,
          content: m.content,
          type: m.type as any,
          importance: m.importance,
          isCore: m.importance >= 8,
          tags: m.tags,
        },
      }),
    ),
  );
}

function currentEmotionState(
  personality: Record<string, number> | null | undefined,
  lastEmotion: EmotionState | null,
): EmotionVector {
  const state = initialState({ personality: personality ?? undefined });
  if (lastEmotion && state[lastEmotion] !== undefined) {
    const biased = { ...state };
    biased[lastEmotion] = Math.min(1, biased[lastEmotion] + 0.2);
    return decay(biased, 0.9);
  }
  return state;
}

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const identifier = `chat_${user.id}_${params.chatId}`;
    const { success } = await rateLimit(identifier);
    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    const companion = await prismadb.companion.findUnique({
      where: { id: params.chatId },
    });
    if (!companion) {
      return new NextResponse('Companion not found', { status: 404 });
    }

    const bond = await getOrCreateBond(user.id, companion.id);

    const personality = (companion.personality as Record<string, number>) ?? null;
    const lastMsg = await prismadb.message.findFirst({
      where: { companionId: companion.id, userId: user.id, role: 'system' },
      orderBy: { createdAt: 'desc' },
    });
    const lastEmotion = (lastMsg?.emotion as EmotionState | null) ?? null;
    let emotionVec = currentEmotionState(personality, lastEmotion);

    if (isThoughtfulMessage(prompt)) {
      emotionVec = applyEvent(emotionVec, 'played_with');
    }
    const currentEmotion = dominant(emotionVec);

    await prismadb.message.create({
      data: {
        companionId: companion.id,
        userId: user.id,
        content: prompt,
        role: 'user',
        emotion: currentEmotion,
      },
    });

    // Fire-and-forget memory extraction
    saveExtractedMemories(user.id, companion.id, prompt).catch((e) =>
      console.warn('[memory-extraction]', e),
    );

    const companionKey = {
      companionName: companion.id,
      userId: user.id,
      modelName: 'gpt-4o-mini',
    };
    const memoryManager = await MemoryManager.getInstance();

    const existingHistory = await memoryManager.readLatestHistory(companionKey);
    if (!existingHistory) {
      await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey);
    }
    await memoryManager.writeToHistory(`User: ${prompt}\n`, companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(companionKey);
    const similarDocs = await memoryManager
      .vectorSearch(recentChatHistory, `${companion.id}.txt`)
      .catch(() => [] as { pageContent: string }[]);
    const relevantHistory =
      similarDocs && similarDocs.length > 0
        ? similarDocs.map((doc) => doc.pageContent).join('\n')
        : '';

    const coreMemories = await loadCoreMemories(companion.id);

    const systemPrompt = buildSystemPrompt({
      companionName: companion.name,
      baseInstructions: companion.instructions,
      bondTier: bond.tier,
      dominantEmotion: currentEmotion,
      coreMemories,
      recentHistory: `${relevantHistory}\n${recentChatHistory}`.trim(),
      userFirstName: user.firstName,
    });

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse('OPENAI_API_KEY not configured', { status: 500 });
    }

    const openaiStream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 400,
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullText = '';

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of openaiStream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              fullText += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();

          // Finalize after stream ends
          await finalizeResponse({
            companion,
            userId: user.id,
            bond,
            responseText: fullText.trim(),
            emotion: currentEmotion,
            thoughtful: isThoughtfulMessage(prompt),
            memoryManager,
            companionKey,
          });
        } catch (err) {
          console.error('[chat-stream]', err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[CHAT_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

async function finalizeResponse(opts: {
  companion: any;
  userId: string;
  bond: any;
  responseText: string;
  emotion: EmotionState;
  thoughtful: boolean;
  memoryManager: MemoryManager;
  companionKey: { companionName: string; userId: string; modelName: string };
}) {
  const { companion, userId, bond, responseText, emotion, thoughtful, memoryManager, companionKey } = opts;
  if (!responseText || responseText.length < 2) return;

  await memoryManager.writeToHistory(responseText, companionKey);

  await prismadb.message.create({
    data: {
      companionId: companion.id,
      userId,
      content: responseText,
      role: 'system',
      emotion,
    },
  });

  const xpDelta = thoughtful
    ? xpForInteraction('thoughtful_message')
    : xpForInteraction('message');
  const { newXp, newTier, tieredUp } = applyXp(bond.xp, xpDelta);

  await prismadb.bond.update({
    where: { id: bond.id },
    data: {
      xp: newXp,
      tier: newTier,
      totalInteractions: { increment: 1 },
      lastInteractionAt: new Date(),
    },
  });

  if (tieredUp) {
    await prismadb.memory.create({
      data: {
        userId,
        companionId: companion.id,
        content: `We grew closer — moved to bond tier ${newTier}.`,
        type: 'milestone',
        importance: 8,
        isCore: true,
        tags: ['bonding', 'milestone'],
      },
    });
  }
}
