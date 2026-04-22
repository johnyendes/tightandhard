/**
 * Emotion engine.
 * Ported from legacy TightandHard build (emotion_engine.js).
 *
 * Stateless: caller passes in the companion's current state vector plus
 * an event, and receives the new state vector back. The dominant emotion
 * from the vector feeds both the voice synthesizer (modulation) and the
 * LLM system prompt (flavor).
 */

export const EMOTIONS = [
  'happy',
  'relaxed',
  'flirty',
  'shy',
  'curious',
  'upset',
  'excited',
  'jealous',
  'sleepy',
  'romantic',
] as const;

export type EmotionState = (typeof EMOTIONS)[number];

export type EmotionVector = Record<EmotionState, number>;

export type EmotionEvent =
  | 'compliment'
  | 'touch'
  | 'outfit_change'
  | 'scene_change'
  | 'gift_received'
  | 'ignored'
  | 'praised'
  | 'criticized'
  | 'played_with'
  | 'time_passed';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type OutfitCategory =
  | 'casual'
  | 'formal'
  | 'cute'
  | 'sexy'
  | 'sporty'
  | 'sleepwear'
  | 'intimate'
  | 'fantasy';

// ---------------------------------------------------------------------
// Baselines — what each state looks like when nothing is happening.
// ---------------------------------------------------------------------

const BASE_STATE: EmotionVector = {
  happy: 0.6,
  relaxed: 0.8,
  flirty: 0.2,
  shy: 0.4,
  curious: 0.5,
  upset: 0.1,
  excited: 0.3,
  jealous: 0.0,
  sleepy: 0.2,
  romantic: 0.3,
};

// ---------------------------------------------------------------------
// Event reactions — how a single event shifts emotions.
// ---------------------------------------------------------------------

const EVENT_EFFECTS: Record<EmotionEvent, Partial<EmotionVector>> = {
  compliment: { happy: 0.3, flirty: 0.2, shy: 0.1, romantic: 0.15 },
  touch: { flirty: 0.25, romantic: 0.2, excited: 0.15 },
  outfit_change: { excited: 0.1, happy: 0.1 },
  scene_change: { curious: 0.15, relaxed: 0.05 },
  gift_received: { happy: 0.4, excited: 0.3, romantic: 0.2 },
  ignored: { upset: 0.4, jealous: 0.3, happy: -0.2 },
  praised: { happy: 0.4, shy: 0.15, flirty: 0.1 },
  criticized: { upset: 0.5, happy: -0.3, shy: 0.2 },
  played_with: { happy: 0.3, excited: 0.25, flirty: 0.15 },
  time_passed: {
    // Gentle drift back toward baseline — handled in decay()
  },
};

// ---------------------------------------------------------------------
// Outfit influences (legacy emotion_engine.js outfitInfluences).
// ---------------------------------------------------------------------

const OUTFIT_INFLUENCE: Record<OutfitCategory, Partial<EmotionVector>> = {
  casual: { relaxed: 0.3, happy: 0.2 },
  formal: { shy: 0.2, curious: 0.1 },
  cute: { happy: 0.4, excited: 0.3, shy: 0.2 },
  sexy: { flirty: 0.5, romantic: 0.3, shy: -0.2 },
  sporty: { excited: 0.4, happy: 0.3, sleepy: -0.2 },
  sleepwear: { sleepy: 0.6, relaxed: 0.4, romantic: 0.2 },
  intimate: { flirty: 0.4, romantic: 0.5, shy: 0.15 },
  fantasy: { excited: 0.3, curious: 0.25, flirty: 0.2 },
};

// ---------------------------------------------------------------------
// Time of day modifiers.
// ---------------------------------------------------------------------

const TIME_MODIFIER: Record<TimeOfDay, Partial<EmotionVector>> = {
  morning: { excited: 0.2, curious: 0.3, sleepy: -0.4 },
  afternoon: { happy: 0.2, relaxed: 0.1 },
  evening: { romantic: 0.3, flirty: 0.2, relaxed: 0.3 },
  night: { sleepy: 0.5, romantic: 0.2, excited: -0.3 },
};

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

export function baseline(): EmotionVector {
  return { ...BASE_STATE };
}

export function timeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

/**
 * Build the vector from: baseline + personality influence + outfit + time-of-day.
 */
export function initialState(options: {
  personality?: Record<string, number>;
  outfit?: OutfitCategory;
  now?: Date;
}): EmotionVector {
  const state = baseline();

  // Personality influence — certain traits push certain baselines
  if (options.personality) {
    const p = options.personality;
    if (p.affection || p.warmth) state.romantic += 0.1;
    if (p.playfulness) state.flirty += 0.15;
    if (p.confidence) state.shy = Math.max(0, state.shy - 0.2);
    if (p.energy) state.excited += 0.15;
    if (p.wisdom || p.calmness) state.relaxed += 0.15;
  }

  if (options.outfit) {
    applyPartial(state, OUTFIT_INFLUENCE[options.outfit]);
  }

  applyPartial(state, TIME_MODIFIER[timeOfDay(options.now)]);

  return clampAll(state);
}

/**
 * Apply an event and return the new state.
 */
export function applyEvent(state: EmotionVector, event: EmotionEvent): EmotionVector {
  const next = { ...state };
  applyPartial(next, EVENT_EFFECTS[event]);
  return clampAll(next);
}

/**
 * Decay over time — all emotions drift back toward baseline.
 * `decayRate` is per unit of elapsed time (e.g. 0.95 per hour).
 */
export function decay(state: EmotionVector, decayRate = 0.95): EmotionVector {
  const base = BASE_STATE;
  const next: EmotionVector = { ...state };
  for (const emotion of EMOTIONS) {
    const delta = next[emotion] - base[emotion];
    next[emotion] = base[emotion] + delta * decayRate;
  }
  return clampAll(next);
}

/**
 * The dominant emotion — highest value in the vector.
 */
export function dominant(state: EmotionVector): EmotionState {
  let best: EmotionState = 'relaxed';
  let bestVal = -Infinity;
  for (const emotion of EMOTIONS) {
    if (state[emotion] > bestVal) {
      bestVal = state[emotion];
      best = emotion;
    }
  }
  return best;
}

// ---------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------

function applyPartial(target: EmotionVector, partial: Partial<EmotionVector>) {
  for (const k of Object.keys(partial) as EmotionState[]) {
    const v = partial[k];
    if (typeof v === 'number') {
      target[k] = (target[k] ?? 0) + v;
    }
  }
}

function clampAll(state: EmotionVector): EmotionVector {
  const next: EmotionVector = { ...state };
  for (const k of EMOTIONS) {
    next[k] = Math.max(0, Math.min(1, next[k]));
  }
  return next;
}
