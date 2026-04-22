/**
 * Replicate API wrapper.
 * Handles image generation via SDXL, FLUX, and LoRA-tuned variants.
 * Seed locking is the heart of character consistency.
 */

import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// Model IDs — pinned to specific versions for reproducibility.
// Update deliberately when versions change.
export const MODELS = {
  sdxl: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
  fluxSchnell: 'black-forest-labs/flux-schnell',
  fluxDev: 'black-forest-labs/flux-dev',
  realVisV6: 'lucataco/realistic-vision-v6.0:cc6fabc53cb8d6eb7b1ab3f5b8af8dc0e3a6f51ce2ea3f9b57f1a07f59a79c8a',
  faceSwap: 'lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d',
  // Upscale
  realEsrgan: 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
} as const;

export type ModelKey = keyof typeof MODELS;

export interface GenerateOptions {
  model?: ModelKey;
  prompt: string;
  negativePrompt?: string;
  seed?: number;                    // required for consistency
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  loraUrl?: string;                 // URL of a .safetensors LoRA
  loraScale?: number;               // 0..1
  referenceImage?: string;          // for img2img or ControlNet
  referenceStrength?: number;       // 0..1
}

export interface GenerateResult {
  imageUrl: string;
  seed: number;
  predictionId: string;
  model: string;
  elapsedMs: number;
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

/**
 * Generate a single image. Returns the Replicate-hosted image URL.
 * Caller is responsible for downloading + re-uploading to Cloudinary.
 */
export async function generateImage(opts: GenerateOptions): Promise<GenerateResult> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not set');
  }

  const modelKey = opts.model ?? 'sdxl';
  const model = MODELS[modelKey];
  const seed = opts.seed ?? randomSeed();
  const start = Date.now();

  const input: Record<string, unknown> = {
    prompt: opts.prompt,
    negative_prompt: opts.negativePrompt ?? defaultNegativePrompt(),
    width: opts.width ?? 1024,
    height: opts.height ?? 1024,
    num_inference_steps: opts.steps ?? (modelKey === 'fluxSchnell' ? 4 : 30),
    guidance_scale: opts.guidanceScale ?? 7.5,
    seed,
    scheduler: 'K_EULER',
    num_outputs: 1,
  };

  if (opts.loraUrl) {
    input.lora_url = opts.loraUrl;
    input.lora_scale = opts.loraScale ?? 0.8;
  }
  if (opts.referenceImage) {
    input.image = opts.referenceImage;
    input.prompt_strength = opts.referenceStrength ?? 0.7;
  }

  const output = await replicate.run(model as `${string}/${string}:${string}`, { input });

  // Replicate returns string[] for most image models
  const urls = Array.isArray(output) ? output : [output];
  const firstUrl = urls[0];
  if (typeof firstUrl !== 'string') {
    throw new Error(`Replicate returned unexpected output: ${JSON.stringify(output)}`);
  }

  return {
    imageUrl: firstUrl,
    seed,
    predictionId: `rep_${Date.now()}_${seed}`,
    model: modelKey,
    elapsedMs: Date.now() - start,
  };
}

/**
 * Apply a face swap — uses a master reference face to enforce consistency.
 * Pass the already-generated image + the master face URL.
 */
export async function faceSwap(args: {
  targetImageUrl: string;
  sourceFaceUrl: string;
}): Promise<string> {
  const output = await replicate.run(MODELS.faceSwap as `${string}/${string}:${string}`, {
    input: {
      target_image: args.targetImageUrl,
      swap_image: args.sourceFaceUrl,
    },
  });
  const url = Array.isArray(output) ? output[0] : output;
  if (typeof url !== 'string') throw new Error('Face swap returned no URL');
  return url;
}

/**
 * Upscale a generated image 4x with Real-ESRGAN.
 */
export async function upscale(imageUrl: string, scale = 4): Promise<string> {
  const output = await replicate.run(MODELS.realEsrgan as `${string}/${string}:${string}`, {
    input: { image: imageUrl, scale, face_enhance: true },
  });
  const url = Array.isArray(output) ? output[0] : output;
  if (typeof url !== 'string') throw new Error('Upscale returned no URL');
  return url;
}

// ---------------------------------------------------------------------

function defaultNegativePrompt(): string {
  return [
    'cartoon, illustration, anime, 3d render, painting',
    'distorted hands, extra fingers, missing fingers, bad anatomy',
    'low quality, blurry, pixelated, compression artifacts',
    'oversaturated, overexposed, washed out',
    'plastic skin, doll-like, uncanny valley',
    'watermark, text, signature, logo',
    'deformed face, asymmetric eyes, wall-eyed',
  ].join(', ');
}
