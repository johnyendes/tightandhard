/**
 * Prompt builder — converts a character + scene config into an
 * optimized Stable Diffusion / FLUX prompt.
 *
 * Strategy: structured prompt with weighted sections:
 *   (subject: age / ethnicity / build), (clothing), (pose / action),
 *   (location / setting), (lighting / mood), (camera + lens + aperture),
 *   (quality keywords).
 */

export type Aesthetic = 'cinematic' | 'studio' | 'candid' | 'minimal' | 'editorial' | 'lifestyle';

export type ShotType = 'profile' | 'portrait' | 'half-body' | 'full-body' | 'close-up' | 'wide';

export interface CharacterBio {
  age: string;              // e.g. "25" or "mid-twenties"
  ethnicity?: string;
  build?: string;           // e.g. "slim", "athletic", "curvy"
  hair?: { color: string; length: string; style?: string };
  eyes?: { color: string };
  features?: string[];      // freckles, dimples, etc.
}

export interface VisualStyle {
  aesthetic: Aesthetic;
  lighting?: string;        // "golden hour", "soft studio", "dramatic rim"
  mood?: string;            // "warm and inviting", "editorial"
  colorPalette?: string[];
}

export interface PhotographySettings {
  camera?: string;          // "35mm film", "medium format"
  lens?: string;            // "85mm", "50mm"
  aperture?: string;        // "f/1.8"
  iso?: number;
  depthOfField?: boolean;
}

export interface PromptContext {
  bio: CharacterBio;
  style: VisualStyle;
  photo?: PhotographySettings;
  shot: ShotType;
  outfit?: string;          // e.g. "white summer sundress"
  pose?: string;            // e.g. "leaning against a doorway, one hand in her hair"
  setting?: string;         // e.g. "sunlit kitchen, morning light"
  extraPositive?: string[];
  extraNegative?: string[];
}

export function buildPositivePrompt(ctx: PromptContext): string {
  const parts: string[] = [];

  // Subject
  const subject = [
    ctx.shot === 'portrait' ? 'professional portrait of a woman' : 'full-length photograph of a woman',
    ctx.bio.age && `${ctx.bio.age} years old`,
    ctx.bio.ethnicity,
    ctx.bio.build && `${ctx.bio.build} build`,
  ]
    .filter(Boolean)
    .join(', ');
  parts.push(subject);

  // Hair + eyes + features
  const appearance: string[] = [];
  if (ctx.bio.hair) {
    const h = ctx.bio.hair;
    appearance.push(`${h.length} ${h.color} hair${h.style ? ` (${h.style})` : ''}`);
  }
  if (ctx.bio.eyes?.color) appearance.push(`${ctx.bio.eyes.color} eyes`);
  if (ctx.bio.features?.length) appearance.push(...ctx.bio.features);
  if (appearance.length) parts.push(appearance.join(', '));

  // Outfit + pose
  if (ctx.outfit) parts.push(`wearing ${ctx.outfit}`);
  if (ctx.pose) parts.push(ctx.pose);

  // Setting
  if (ctx.setting) parts.push(ctx.setting);

  // Aesthetic + lighting + mood
  const atmosphere: string[] = [`${ctx.style.aesthetic} style`];
  if (ctx.style.lighting) atmosphere.push(`${ctx.style.lighting} lighting`);
  if (ctx.style.mood) atmosphere.push(ctx.style.mood);
  parts.push(atmosphere.join(', '));

  // Photography settings
  if (ctx.photo) {
    const p: string[] = [];
    if (ctx.photo.camera) p.push(`shot on ${ctx.photo.camera}`);
    if (ctx.photo.lens) p.push(`${ctx.photo.lens} lens`);
    if (ctx.photo.aperture) p.push(`${ctx.photo.aperture} aperture`);
    if (ctx.photo.depthOfField) p.push('shallow depth of field');
    if (p.length) parts.push(p.join(', '));
  }

  // Quality keywords
  parts.push('photorealistic, detailed skin texture, natural skin pores, 8k, sharp focus, professional color grading');

  // Extra
  if (ctx.extraPositive?.length) parts.push(...ctx.extraPositive);

  return parts.join(', ');
}

export function buildNegativePrompt(ctx: PromptContext): string {
  const base = [
    'cartoon, illustration, anime, 3d render, painting, drawing',
    'distorted hands, extra fingers, missing fingers, bad anatomy, deformed',
    'low quality, blurry, pixelated, compression artifacts, jpeg artifacts',
    'oversaturated, overexposed, washed out, grainy',
    'plastic skin, doll-like, uncanny valley, airbrushed',
    'watermark, text, signature, logo, frame',
    'asymmetric eyes, cross-eyed, wall-eyed, mismatched eyes',
  ];
  if (ctx.extraNegative?.length) base.push(...ctx.extraNegative);
  return base.join(', ');
}
