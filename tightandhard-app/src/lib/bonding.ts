/**
 * Bonding tier system.
 * Ported from legacy TightandHard build (BondingTier.js).
 *
 * 10 tiers of relationship progression. Each tier unlocks new content
 * (outfits, scenes, conversational depth). XP accumulates from interactions;
 * trust score tracks consistency.
 */

export const TIER_NAMES: Record<number, string> = {
  1: 'Acquaintance',
  2: 'Getting to Know',
  3: 'Friendly',
  4: 'Close Friend',
  5: 'Trusted',
  6: 'Romantic Interest',
  7: 'Dating',
  8: 'Committed',
  9: 'Deep Connection',
  10: 'Beyond Words',
};

/**
 * XP required to reach each tier (cumulative).
 * Tuned so a casual user reaches tier 5 in ~2 weeks, tier 10 in ~3 months.
 */
export const TIER_XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 50,
  3: 150,
  4: 400,
  5: 900,
  6: 1800,
  7: 3200,
  8: 5500,
  9: 8500,
  10: 13000,
};

export type InteractionType =
  | 'message'              // +1 XP
  | 'thoughtful_message'   // +3 XP — substantive (>80 chars)
  | 'voice_call'           // +5 XP per 30s
  | 'gift'                 // +10 XP
  | 'daily_login'          // +5 XP
  | 'milestone'            // +25 XP — bond milestone reached
  | 'anniversary';         // +50 XP — monthly celebration

const XP_REWARDS: Record<InteractionType, number> = {
  message: 1,
  thoughtful_message: 3,
  voice_call: 5,
  gift: 10,
  daily_login: 5,
  milestone: 25,
  anniversary: 50,
};

export function xpForInteraction(type: InteractionType): number {
  return XP_REWARDS[type] ?? 0;
}

/**
 * Given total XP, return the current tier (1-10).
 */
export function tierForXP(xp: number): number {
  let currentTier = 1;
  for (let tier = 10; tier >= 1; tier--) {
    if (xp >= TIER_XP_THRESHOLDS[tier]) {
      currentTier = tier;
      break;
    }
  }
  return currentTier;
}

/**
 * XP needed to reach the next tier from current XP.
 * Returns 0 if already at tier 10.
 */
export function xpToNextTier(xp: number): number {
  const current = tierForXP(xp);
  if (current >= 10) return 0;
  return TIER_XP_THRESHOLDS[current + 1] - xp;
}

/**
 * Progress to next tier as a 0..1 fraction.
 */
export function progressToNextTier(xp: number): number {
  const current = tierForXP(xp);
  if (current >= 10) return 1;
  const floor = TIER_XP_THRESHOLDS[current];
  const ceil = TIER_XP_THRESHOLDS[current + 1];
  return (xp - floor) / (ceil - floor);
}

/**
 * Trust score decays slightly with inactivity and grows with consistency.
 * Caller provides: days since last interaction, total interactions, current score.
 */
export function updateTrustScore(
  currentScore: number,
  daysSinceLast: number,
  totalInteractions: number,
): number {
  // Decay for inactivity (0.02/day after 7 days away)
  let score = currentScore;
  if (daysSinceLast > 7) {
    score -= Math.min(0.3, (daysSinceLast - 7) * 0.02);
  }

  // Consistency bonus — compounds slowly
  const consistencyBonus = Math.log10(totalInteractions + 1) * 0.02;
  score += consistencyBonus;

  return Math.max(0, Math.min(1, score));
}

/**
 * After applying XP, return both the new tier and whether a tier-up happened.
 */
export interface XPApplyResult {
  newXp: number;
  newTier: number;
  tieredUp: boolean;
  previousTier: number;
}

export function applyXp(currentXp: number, xpDelta: number): XPApplyResult {
  const previousTier = tierForXP(currentXp);
  const newXp = Math.max(0, currentXp + xpDelta);
  const newTier = tierForXP(newXp);
  return {
    newXp,
    newTier,
    tieredUp: newTier > previousTier,
    previousTier,
  };
}

/**
 * Check whether a message qualifies as "thoughtful" (higher XP reward).
 * Simple heuristic — can be replaced with LLM-scored depth later.
 */
export function isThoughtfulMessage(content: string): boolean {
  return content.trim().length >= 80;
}
