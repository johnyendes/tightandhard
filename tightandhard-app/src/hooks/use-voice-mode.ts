'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'tightandhard_voice_mode';

/**
 * Voice mode hook.
 * When enabled, every new system message auto-plays via ElevenLabs.
 *
 * Usage:
 *   const voice = useVoiceMode();
 *   voice.enabled                  // boolean
 *   voice.toggle()                 // flips on/off
 *   voice.playMessage(text, style, emotion)  // stream + auto-play
 *   voice.stopPlayback()           // stop current audio (e.g. when user starts typing)
 */
export function useVoiceMode() {
  const [enabled, setEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setEnabled(stored === 'true');
  }, []);

  const stopPlayback = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      const src = audioRef.current.src;
      audioRef.current = null;
      if (src.startsWith('blob:')) URL.revokeObjectURL(src);
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
    }
    if (!next) stopPlayback();
  }, [enabled, stopPlayback]);

  const playMessage = useCallback(
    async (text: string, style: string, emotion?: string) => {
      if (!enabled) return;
      if (!text || !style) return;

      stopPlayback();
      const abort = new AbortController();
      abortRef.current = abort;

      try {
        const res = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, style, emotion }),
          signal: abort.signal,
        });

        if (!res.ok || !res.body) {
          console.warn('[voice-mode] fetch failed:', res.status);
          return;
        }

        const blob = await res.blob();
        if (abort.signal.aborted) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          if (audioRef.current === audio) audioRef.current = null;
        });
        audio.addEventListener('error', () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        });

        setIsPlaying(true);
        try {
          await audio.play();
        } catch (err) {
          // Browser autoplay policy — caller must have triggered via user gesture
          console.warn('[voice-mode] autoplay blocked:', err);
          setIsPlaying(false);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('[voice-mode] error:', err);
        }
      }
    },
    [enabled, stopPlayback],
  );

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  return { enabled, isPlaying, toggle, playMessage, stopPlayback };
}
