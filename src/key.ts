import { timeFromFrame, type KonitifFps, type KonitifFrame, type KonitifTime } from './timeFrame.js';
import { normalizeKonitifValue, type KonitifNullableValue } from './targetValue.js';

export interface KonitifKey {
  frame: KonitifFrame;
  time: KonitifTime | null;
  value: KonitifNullableValue;
}

export interface CreateKonitifKeyInput {
  frame: KonitifFrame;
  value: KonitifNullableValue;
  time?: KonitifTime | null;
  fps?: KonitifFps | null;
}

export function createKonitifKey(input: CreateKonitifKeyInput): KonitifKey {
  const frame = normalizeKonitifKeyFrame(input.frame);
  const time =
    input.time === undefined
      ? typeof input.fps === 'number'
        ? timeFromFrame(frame, input.fps)
        : null
      : normalizeKonitifKeyTime(input.time);

  return {
    frame,
    time,
    value: normalizeKonitifKeyValue(input.value)
  };
}

export function isKonitifKeyTimeConsistent(
  key: KonitifKey,
  fps: KonitifFps,
  tolerance: KonitifTime = 0.001
): boolean {
  if (key.time === null) {
    return true;
  }

  return Math.abs(key.time - timeFromFrame(key.frame, fps)) <= Math.max(0, tolerance);
}

function normalizeKonitifKeyFrame(frame: KonitifFrame): KonitifFrame {
  return Math.max(0, Math.round(normalizeKonitifValue(frame)));
}

function normalizeKonitifKeyTime(time: KonitifTime | null): KonitifTime | null {
  return typeof time === 'number' && Number.isFinite(time) ? Math.max(0, time) : null;
}

function normalizeKonitifKeyValue(value: KonitifNullableValue): KonitifNullableValue {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
