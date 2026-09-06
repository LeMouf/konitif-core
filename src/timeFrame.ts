export type KonitifTime = number;
export type KonitifDuration = number;
export type KonitifFrame = number;
export type KonitifFps = number;

export interface KonitifFrameRange {
  startFrame: KonitifFrame;
  endFrame: KonitifFrame;
}

export interface KonitifTimeRange {
  start: KonitifTime;
  end: KonitifTime;
}

export interface NormalizeKonitifFrameRangeInput extends KonitifFrameRange {
  minFrame?: KonitifFrame;
  maxFrame: KonitifFrame;
}

export interface KonitifFrameRangeTimeRangeInput extends KonitifFrameRange {
  fps: KonitifFps;
  duration: KonitifDuration;
  minFrame?: KonitifFrame;
  maxFrame: KonitifFrame;
}

export function frameFromTime(time: KonitifTime, fps: KonitifFps): KonitifFrame {
  return Math.max(0, Math.round(normalizeNonNegativeNumber(time) * normalizeFps(fps) + 0.000001));
}

export function timeFromFrame(frame: KonitifFrame, fps: KonitifFps): KonitifTime {
  return Number((Math.max(0, Math.round(normalizeNumber(frame))) / normalizeFps(fps)).toFixed(3));
}

export function snapTimeToFrame(time: KonitifTime, fps: KonitifFps): KonitifTime {
  return timeFromFrame(frameFromTime(time, fps), fps);
}

export function normalizeFrameRange(input: NormalizeKonitifFrameRangeInput): KonitifFrameRange {
  const minFrame = Math.max(0, Math.round(normalizeNumber(input.minFrame ?? 0)));
  const maxFrame = Math.max(minFrame, Math.round(normalizeNumber(input.maxFrame)));
  const rawStart = Math.round(normalizeNumber(input.startFrame));
  const rawEnd = Math.round(normalizeNumber(input.endFrame));
  const clampedStart = Math.max(minFrame, Math.min(rawStart, maxFrame));
  const clampedEnd = Math.max(minFrame, Math.min(rawEnd, maxFrame));

  return {
    startFrame: Math.min(clampedStart, clampedEnd),
    endFrame: Math.max(clampedStart, clampedEnd)
  };
}

export function timeRangeFromFrameRange(input: KonitifFrameRangeTimeRangeInput): KonitifTimeRange {
  const normalizedRange = normalizeFrameRange({
    startFrame: input.startFrame,
    endFrame: input.endFrame,
    minFrame: input.minFrame,
    maxFrame: input.maxFrame
  });
  const safeFps = normalizeFps(input.fps);
  const halfFrame = 0.5 / safeFps;
  const startTime = timeFromFrame(normalizedRange.startFrame, safeFps);
  const endTime = timeFromFrame(normalizedRange.endFrame, safeFps);
  const start = Math.max(0, startTime - halfFrame);
  const end = Math.max(start, Math.min(normalizeNonNegativeNumber(input.duration), endTime + halfFrame));

  return { start, end };
}

function normalizeFps(fps: KonitifFps): KonitifFps {
  return Math.max(normalizeNumber(fps), 1);
}

function normalizeNonNegativeNumber(value: number): number {
  return Math.max(0, normalizeNumber(value));
}

function normalizeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
