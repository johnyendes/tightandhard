/**
 * Mirror learning — adaptive response patterns.
 * Ported from legacy TightandHard build (MirrorLearning.js).
 *
 * Each pattern is a (userTrigger → adaptedResponse) pair with confidence.
 * When the user sends a new message:
 *   1. Score all active patterns by applicability (text similarity + emotion match × confidence)
 *   2. If a high-confidence pattern scores > threshold, bias the LLM toward that response style
 *
 * Reinforcement updates confidence via exponential moving average when the
 * user gives positive/negative feedback (thumbs up/down on the reply UI).
 */

export interface MirrorPatternLike {
  id: string;
  userTrigger: string;
  adaptedResponse: string;
  confidence: number;
  successRate: number;
  usageCount: number;
  successCount: number;
  failureCount: number;
  emotionalContext?: {
    mood?: string;
    happiness?: number;
    trust?: number;
    affection?: number;
  } | null;
  isActive: boolean;
}

export interface EmotionalContext {
  mood?: string;
  happiness?: number;
  trust?: number;
  affection?: number;
}

// ---------------------------------------------------------------------
// Similarity (Jaccard word overlap)
// ---------------------------------------------------------------------

export function textSimilarity(a: string, b: string): number {
  const aWords = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const bWords = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (aWords.size === 0 && bWords.size === 0) return 0;
  const intersection = new Set([...aWords].filter((w) => bWords.has(w)));
  const union = new Set([...aWords, ...bWords]);
  return intersection.size / union.size;
}

// ---------------------------------------------------------------------
// Emotional similarity
// ---------------------------------------------------------------------

function emotionalSimilarity(
  a: EmotionalContext | null | undefined,
  b: EmotionalContext | null | undefined,
): number {
  if (!a || !b || Object.keys(a).length === 0 || Object.keys(b).length === 0) {
    return 0.5;
  }
  const moodMatch = a.mood && b.mood ? (a.mood === b.mood ? 1.0 : 0.5) : 0.5;
  const happinessDiff = Math.abs((a.happiness ?? 0.5) - (b.happiness ?? 0.5));
  const trustDiff = Math.abs((a.trust ?? 0.5) - (b.trust ?? 0.5));
  const affectionDiff = Math.abs((a.affection ?? 0.5) - (b.affection ?? 0.5));
  return (moodMatch + (1 - happinessDiff) + (1 - trustDiff) + (1 - affectionDiff)) / 4;
}

// ---------------------------------------------------------------------
// Applicability score
// ---------------------------------------------------------------------

export function applicabilityScore(
  pattern: MirrorPatternLike,
  input: string,
  emotionalContext?: EmotionalContext,
): number {
  const text = textSimilarity(pattern.userTrigger, input);
  const emo = emotionalSimilarity(pattern.emotionalContext, emotionalContext);
  const combined = text * 0.7 + emo * 0.3;
  return combined * pattern.confidence;
}

/**
 * Filter + rank active patterns by applicability.
 */
export function findBestMatches(
  patterns: MirrorPatternLike[],
  input: string,
  emotionalContext?: EmotionalContext,
  options: { limit?: number; minScore?: number } = {},
): Array<{ pattern: MirrorPatternLike; score: number }> {
  const limit = options.limit ?? 5;
  const minScore = options.minScore ?? 0.3;

  return patterns
    .filter((p) => p.isActive)
    .map((pattern) => ({ pattern, score: applicabilityScore(pattern, input, emotionalContext) }))
    .filter((x) => x.score > minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------
// Reinforcement math
// ---------------------------------------------------------------------

export interface ReinforceResult {
  newConfidence: number;
  newSuccessRate: number;
  isActive: boolean;
}

const LEARNING_RATE = 0.3;
const CONFIDENCE_FLOOR = 0.1;
const CONFIDENCE_CEIL = 0.95;
const DEACTIVATE_THRESHOLD = 0.2;
const DEACTIVATE_MIN_USAGE = 10;

/**
 * Update a pattern's confidence & success rate given a 0..1 rating.
 * Returns the new values (caller persists them).
 */
export function reinforcePattern(
  pattern: MirrorPatternLike,
  rating: number,
): ReinforceResult {
  const normalized = Math.max(0, Math.min(1, rating));
  const usageCount = pattern.usageCount + 1;
  const successDelta = normalized >= 0.5 ? 1 : 0;
  const failureDelta = normalized < 0.5 ? 1 : 0;

  // Exponential moving average on success rate
  const newSuccessRate =
    LEARNING_RATE * normalized + (1 - LEARNING_RATE) * pattern.successRate;

  // Confidence adjustment + usage boost
  const confidenceAdjustment = (normalized - 0.5) * 0.1;
  const usageBoost = Math.min(0.1, usageCount * 0.01);
  let newConfidence = pattern.confidence + confidenceAdjustment + usageBoost;
  newConfidence = Math.max(CONFIDENCE_FLOOR, Math.min(CONFIDENCE_CEIL, newConfidence));

  // Deactivate if confidence has collapsed after enough tries
  const isActive = !(newConfidence < DEACTIVATE_THRESHOLD && usageCount > DEACTIVATE_MIN_USAGE);

  return {
    newConfidence,
    newSuccessRate,
    isActive,
  };
}
