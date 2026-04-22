/**
 * Voice module — wraps ElevenLabs TTS with emotional modulation.
 * Ported from legacy TightandHard build (voice_selector.js + VoiceController.js).
 *
 * Flow:
 *   1. Caller sends text + persona voice style + current emotion
 *   2. Resolve base voice params (pitch/speed) from style
 *   3. Apply emotional modulation (happy → higher pitch, sad → slower, etc.)
 *   4. Call ElevenLabs streaming endpoint with clamped params
 *   5. Return audio blob
 */

export type VoiceStyle =
  | 'warm_melodic'
  | 'sultry'
  | 'cheerful'
  | 'professional'
  | 'energetic'
  | 'articulate'
  | 'soft_comforting'
  | 'playful'
  | 'commanding'
  | 'dreamy'
  | 'energetic_motivating'
  | 'serene';

export type Emotion =
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'confident'
  | 'shy'
  | 'flirty'
  | 'romantic'
  | 'playful';

interface VoiceParams {
  pitch: number;
  speed: number;
  tone: string;
  breathiness: number;
  elevenLabsVoiceId: string;
  stability: number;
  similarityBoost: number;
}

const VOICE_STYLES: Record<VoiceStyle, Omit<VoiceParams, 'pitch' | 'speed' | 'breathiness'> & { basePitch: number; baseSpeed: number; baseBreathiness: number }> = {
  warm_melodic: {
    basePitch: 1.0, baseSpeed: 0.9, baseBreathiness: 0.3, tone: 'warm',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    stability: 0.65, similarityBoost: 0.75,
  },
  sultry: {
    basePitch: 0.9, baseSpeed: 0.85, baseBreathiness: 0.45, tone: 'seductive',
    elevenLabsVoiceId: 'oWAxZDx7w5VEj9dCyTzz', // Grace
    stability: 0.55, similarityBoost: 0.85,
  },
  cheerful: {
    basePitch: 1.1, baseSpeed: 1.0, baseBreathiness: 0.2, tone: 'happy',
    elevenLabsVoiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy
    stability: 0.5, similarityBoost: 0.75,
  },
  professional: {
    basePitch: 1.0, baseSpeed: 0.95, baseBreathiness: 0.2, tone: 'confident',
    elevenLabsVoiceId: 'jBpfuIE2acCO8z3wKNLl', // Gigi
    stability: 0.7, similarityBoost: 0.75,
  },
  energetic: {
    basePitch: 1.15, baseSpeed: 1.1, baseBreathiness: 0.15, tone: 'excited',
    elevenLabsVoiceId: 'jsCqWAovK2LkecY7zXl4', // Freya
    stability: 0.45, similarityBoost: 0.8,
  },
  articulate: {
    basePitch: 1.0, baseSpeed: 0.9, baseBreathiness: 0.2, tone: 'intelligent',
    elevenLabsVoiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda
    stability: 0.7, similarityBoost: 0.75,
  },
  soft_comforting: {
    basePitch: 0.95, baseSpeed: 0.85, baseBreathiness: 0.4, tone: 'gentle',
    elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    stability: 0.75, similarityBoost: 0.75,
  },
  playful: {
    basePitch: 1.1, baseSpeed: 1.05, baseBreathiness: 0.25, tone: 'fun',
    elevenLabsVoiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily
    stability: 0.5, similarityBoost: 0.8,
  },
  commanding: {
    basePitch: 0.9, baseSpeed: 0.95, baseBreathiness: 0.15, tone: 'strong',
    elevenLabsVoiceId: 'piTKgcLEGmPE4e6mEKli', // Nicole
    stability: 0.7, similarityBoost: 0.8,
  },
  dreamy: {
    basePitch: 0.95, baseSpeed: 0.85, baseBreathiness: 0.45, tone: 'ethereal',
    elevenLabsVoiceId: 'LcfcDJNUP1GQjkzn1xUU', // Emily
    stability: 0.65, similarityBoost: 0.75,
  },
  energetic_motivating: {
    basePitch: 1.1, baseSpeed: 1.1, baseBreathiness: 0.2, tone: 'motivating',
    elevenLabsVoiceId: 'jsCqWAovK2LkecY7zXl4', // Freya
    stability: 0.5, similarityBoost: 0.8,
  },
  serene: {
    basePitch: 0.9, baseSpeed: 0.8, baseBreathiness: 0.4, tone: 'peaceful',
    elevenLabsVoiceId: 'XB0fDUnXU5powFXDhCwa', // Charlotte
    stability: 0.8, similarityBoost: 0.7,
  },
};

const EMOTION_MODIFIERS: Record<Emotion, { pitchMul: number; speedMul: number; tone?: string; breathinessMul?: number }> = {
  happy: { pitchMul: 1.1, speedMul: 1.05, tone: 'warm' },
  sad: { pitchMul: 0.9, speedMul: 0.95, tone: 'soft', breathinessMul: 1.2 },
  excited: { pitchMul: 1.15, speedMul: 1.2, tone: 'bold' },
  calm: { pitchMul: 0.95, speedMul: 0.95, tone: 'neutral' },
  confident: { pitchMul: 1.05, speedMul: 1.0, tone: 'bold', breathinessMul: 0.8 },
  shy: { pitchMul: 0.9, speedMul: 0.9, tone: 'soft', breathinessMul: 1.3 },
  flirty: { pitchMul: 1.02, speedMul: 0.95, tone: 'playful', breathinessMul: 1.2 },
  romantic: { pitchMul: 0.98, speedMul: 0.9, tone: 'warm', breathinessMul: 1.15 },
  playful: { pitchMul: 1.08, speedMul: 1.1, tone: 'fun' },
};

export function resolveVoiceParams(style: VoiceStyle, emotion?: Emotion): VoiceParams {
  const base = VOICE_STYLES[style];
  let pitch = base.basePitch;
  let speed = base.baseSpeed;
  let breathiness = base.baseBreathiness;
  let tone = base.tone;

  if (emotion && EMOTION_MODIFIERS[emotion]) {
    const mod = EMOTION_MODIFIERS[emotion];
    pitch *= mod.pitchMul;
    speed *= mod.speedMul;
    if (mod.breathinessMul) breathiness *= mod.breathinessMul;
    if (mod.tone) tone = mod.tone;
  }

  return {
    pitch: Math.max(0.5, Math.min(2.0, pitch)),
    speed: Math.max(0.5, Math.min(2.0, speed)),
    breathiness: Math.max(0, Math.min(1.0, breathiness)),
    tone,
    elevenLabsVoiceId: base.elevenLabsVoiceId,
    stability: base.stability,
    similarityBoost: base.similarityBoost,
  };
}

export interface SynthesizeOptions {
  text: string;
  style: VoiceStyle;
  emotion?: Emotion;
}

/**
 * Calls ElevenLabs and returns a ReadableStream of MP3 audio.
 * Intended to be piped directly to the client response.
 */
export async function synthesizeSpeech({ text, style, emotion }: SynthesizeOptions): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not set in environment');
  }

  const params = resolveVoiceParams(style, emotion);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${params.elevenLabsVoiceId}/stream`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: params.stability,
          similarity_boost: params.similarityBoost,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok || !response.body) {
    const errText = await response.text().catch(() => '');
    throw new Error(`ElevenLabs error ${response.status}: ${errText}`);
  }

  return response.body;
}
