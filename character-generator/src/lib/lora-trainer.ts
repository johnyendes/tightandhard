/**
 * LoRA training wrapper.
 *
 * We use Replicate's Flux LoRA trainer (ostris/flux-dev-lora-trainer) by default.
 * The trainer accepts a zip URL of training images + config; returns a .safetensors LoRA
 * that can be applied to future SDXL/Flux generations via the `lora_url` parameter.
 *
 * Training: ~15-30 min, ~$2-5 per run at standard settings. 15-30 images recommended.
 */

import Replicate from 'replicate';

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export interface TrainLoraInput {
  inputImagesZipUrl: string;              // a zip of 15-30 training images
  triggerWord: string;                    // unique word the LoRA responds to
  steps?: number;                         // default 1000
  learningRate?: number;                  // default 0.0004
  destinationModelOwner: string;          // your Replicate username
  destinationModelName: string;           // unique model name for this character
  webhookUrl?: string;                    // optional callback when complete
}

export interface TrainLoraResult {
  trainingId: string;
  status: string;
  createdAt: string;
}

export async function startLoraTraining(input: TrainLoraInput): Promise<TrainLoraResult> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not set');
  }

  const training = await replicate.trainings.create(
    'ostris',
    'flux-dev-lora-trainer',
    'e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497',
    {
      destination: `${input.destinationModelOwner}/${input.destinationModelName}`,
      input: {
        input_images: input.inputImagesZipUrl,
        trigger_word: input.triggerWord,
        steps: input.steps ?? 1000,
        learning_rate: input.learningRate ?? 0.0004,
        batch_size: 1,
        resolution: '512,768,1024',
        autocaption: true,
        optimizer: 'adamw8bit',
      },
      webhook: input.webhookUrl,
      webhook_events_filter: input.webhookUrl ? ['start', 'output', 'logs', 'completed'] : undefined,
    } as any,
  );

  return {
    trainingId: training.id,
    status: training.status,
    createdAt: training.created_at,
  };
}

export async function getTrainingStatus(trainingId: string): Promise<{
  status: string;
  progress: number;
  loraUrl: string | null;
  logUrl: string | null;
  errorMessage: string | null;
}> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not set');
  }

  const training = await replicate.trainings.get(trainingId);

  let progress = 0;
  if (training.status === 'succeeded') progress = 1;
  else if (training.status === 'processing' || training.status === 'starting') {
    // Rough heuristic: parse logs for step count if available
    const logs = typeof training.logs === 'string' ? training.logs : '';
    const match = logs.match(/step\s*[=:]\s*(\d+)\s*[/\\]\s*(\d+)/i);
    if (match) {
      const cur = Number(match[1]);
      const total = Number(match[2]);
      if (total > 0) progress = Math.min(0.99, cur / total);
    }
  }

  let loraUrl: string | null = null;
  const output = training.output as unknown;
  if (output && typeof output === 'object' && 'weights' in output) {
    loraUrl = (output as { weights: string }).weights;
  } else if (typeof output === 'string') {
    loraUrl = output;
  }

  return {
    status: training.status,
    progress,
    loraUrl,
    logUrl: typeof training.logs === 'string' ? null : null,
    errorMessage: training.error ? String(training.error) : null,
  };
}

/**
 * Generate a stable trigger word from a character name.
 * LoRA trainers expect a unique token that's unlikely to appear elsewhere.
 */
export function makeTriggerWord(characterName: string, characterId: string): string {
  const clean = characterName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
  const suffix = characterId.slice(-6).toUpperCase();
  return `${clean || 'CHAR'}_${suffix}`;
}
