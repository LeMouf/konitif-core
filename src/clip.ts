import type { KonitifDuration } from './timeFrame.js';
import type { KonitifTrack } from './track.js';
import type { KonitifTrackTarget } from './targetValue.js';

export type KonitifClipId = string;

export type KonitifClipKind =
  | 'motion'
  | 'audio'
  | 'control'
  | 'logic'
  | 'fx'
  | 'media'
  | string;

export interface KonitifClip {
  id: KonitifClipId;
  title: string;
  kind: KonitifClipKind;
  durationSeconds: KonitifDuration | null;
  tracks: KonitifTrack[];
}

export interface NormalizeKonitifClipInput {
  id: KonitifClipId;
  title?: string | null;
  kind?: KonitifClipKind | null;
  durationSeconds?: KonitifDuration | null;
  tracks?: KonitifTrack[] | null;
}

export function normalizeClip(input: NormalizeKonitifClipInput): KonitifClip {
  const id = normalizeText(input.id, 'clip');

  return {
    id,
    title: normalizeText(input.title, id),
    kind: normalizeText(input.kind, 'media'),
    durationSeconds: normalizeDuration(input.durationSeconds),
    tracks: Array.isArray(input.tracks) ? [...input.tracks] : []
  };
}

export function resolveClipDuration(clip: Pick<KonitifClip, 'durationSeconds' | 'tracks'>): KonitifDuration | null {
  const explicitDuration = normalizeDuration(clip.durationSeconds);

  if (explicitDuration !== null) {
    return explicitDuration;
  }

  const trackDuration = clip.tracks.reduce((maxDuration, track) => {
    const maxKeyTime = track.keys.reduce((maxTime, key) => {
      return typeof key.time === 'number' && Number.isFinite(key.time)
        ? Math.max(maxTime, Math.max(0, key.time))
        : maxTime;
    }, 0);

    return Math.max(maxDuration, maxKeyTime);
  }, 0);

  return trackDuration > 0 ? trackDuration : null;
}

export function countClipTracks(clip: Pick<KonitifClip, 'tracks'>): number {
  return clip.tracks.length;
}

export function containsClipTrack(
  clip: Pick<KonitifClip, 'tracks'>,
  target: KonitifTrackTarget | null
): boolean {
  return clip.tracks.some((track) => track.target === target);
}

function normalizeDuration(duration: KonitifDuration | null | undefined): KonitifDuration | null {
  return typeof duration === 'number' && Number.isFinite(duration) ? Math.max(0, duration) : null;
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const text = typeof value === 'string' ? value.trim() : '';

  return text.length > 0 ? text : fallback;
}
