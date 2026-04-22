/**
 * Memory extraction — turns casual user messages into structured memories.
 *
 * Strategy: a cheap secondary LLM pass scans the user's message for things
 * worth remembering (preferences, events, names, goals, emotional moments)
 * and emits 0-3 structured memories. Only runs when the message is long
 * enough to likely contain a "fact" — short messages like "hi" are skipped.
 *
 * Called AFTER the user's message is saved, BEFORE the AI reply is generated,
 * so core memories can be surfaced in the same turn if relevant.
 */

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type MemoryType =
  | 'conversation'
  | 'preference'
  | 'event'
  | 'fact'
  | 'milestone'
  | 'shared_secret'
  | 'recurring_topic'
  | 'emotional'
  | 'goal'
  | 'relationship';

export interface ExtractedMemory {
  content: string;
  type: MemoryType;
  importance: number; // 1-10
  tags: string[];
}

const EXTRACTION_PROMPT = `You read a single user message and extract 0-3 facts worth remembering long-term.

Return ONLY a JSON array. Each item: { "content": string (one sentence), "type": one of [preference, event, fact, milestone, shared_secret, recurring_topic, emotional, goal, relationship], "importance": 1-10, "tags": string[] }.

Rules:
- Importance 8-10 = life events, strong emotions, identity facts, deep secrets, major goals
- Importance 5-7 = preferences, recurring interests, relationships, work context
- Importance 1-4 = passing mentions, small preferences, one-off facts
- Return [] if nothing is worth remembering.
- Be concise. Don't interpret — quote facts as directly stated.
- Never include: account credentials, payment info, precise addresses, PII beyond first names.

User message:`;

/**
 * Quick pre-filter: skip extraction for tiny or trivial messages.
 */
function shouldExtract(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 30) return false;
  const greetingOnly = /^(hi|hey|hello|yo|sup|what'?s up|good (morning|evening|night))[.!?\s]*$/i;
  if (greetingOnly.test(trimmed)) return false;
  return true;
}

export async function extractMemories(userMessage: string): Promise<ExtractedMemory[]> {
  if (!shouldExtract(userMessage)) return [];
  if (!process.env.OPENAI_API_KEY) return [];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : parsed.memories ?? [];

    return arr
      .filter(
        (m: unknown): m is ExtractedMemory =>
          typeof m === 'object' &&
          m !== null &&
          typeof (m as ExtractedMemory).content === 'string' &&
          typeof (m as ExtractedMemory).importance === 'number',
      )
      .slice(0, 3)
      .map((m: ExtractedMemory) => ({
        ...m,
        importance: Math.max(1, Math.min(10, Math.round(m.importance))),
        tags: Array.isArray(m.tags) ? m.tags.slice(0, 5) : [],
      }));
  } catch (err) {
    console.warn('[memory-extraction] skipped due to error:', err);
    return [];
  }
}
