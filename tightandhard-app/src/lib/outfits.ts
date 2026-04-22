/**
 * Outfit / wardrobe logic.
 * Ported from legacy TightandHard build (outfit_dresser.js + OutfitController.js).
 */

import type { EmotionState } from './emotion';

export type OutfitCategory =
  | 'casual'
  | 'formal'
  | 'cute'
  | 'sexy'
  | 'sporty'
  | 'sleepwear'
  | 'intimate'
  | 'fantasy'
  | 'party'
  | 'athletic'
  | 'cozy'
  | 'elegant'
  | 'swimwear'
  | 'beach';

export interface OutfitSummary {
  id: string;
  name: string;
  category: OutfitCategory;
  unlockTokens: number;
  unlockBondTier: number;
  moodEffects?: Partial<Record<EmotionState, number>>;
}

/**
 * Which outfit category matches a given mood best.
 * Used to suggest outfits when she's in a particular emotion.
 */
const MOOD_TO_CATEGORY: Record<EmotionState, OutfitCategory[]> = {
  happy: ['cute', 'casual', 'party'],
  relaxed: ['cozy', 'casual', 'sleepwear'],
  flirty: ['sexy', 'intimate', 'elegant'],
  shy: ['cute', 'cozy', 'casual'],
  curious: ['casual', 'fantasy', 'sporty'],
  upset: ['cozy', 'sleepwear'],
  excited: ['party', 'athletic', 'sporty'],
  jealous: ['sexy', 'elegant'],
  sleepy: ['sleepwear', 'cozy'],
  romantic: ['elegant', 'intimate', 'sexy'],
};

export function outfitsForMood(
  available: OutfitSummary[],
  mood: EmotionState,
): OutfitSummary[] {
  const preferred = MOOD_TO_CATEGORY[mood] ?? ['casual'];
  return available
    .filter((o) => preferred.includes(o.category))
    .sort((a, b) => preferred.indexOf(a.category) - preferred.indexOf(b.category));
}

/**
 * Filter the catalog to only what this user has unlocked for this companion.
 */
export function filterUnlocked(
  catalog: OutfitSummary[],
  bondTier: number,
  unlockedIds: string[],
): OutfitSummary[] {
  return catalog.filter(
    (o) =>
      o.unlockBondTier <= bondTier &&
      (o.unlockTokens === 0 || unlockedIds.includes(o.id)),
  );
}

/**
 * True if the user can unlock this outfit now (either free at current tier,
 * or token-gated but user has enough tokens).
 */
export function canUnlock(
  outfit: OutfitSummary,
  bondTier: number,
  userTokens: number,
): boolean {
  if (outfit.unlockBondTier > bondTier) return false;
  if (outfit.unlockTokens === 0) return true;
  return userTokens >= outfit.unlockTokens;
}
