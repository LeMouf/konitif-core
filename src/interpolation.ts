export type KonitifInterpolationPreset =
  | 'step'
  | 'linear'
  | 'ease_in'
  | 'ease_out'
  | 'ease_in_out';

export interface KonitifInterpolationCurve {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type KonitifSegmentInterpolation =
  | KonitifInterpolationPreset
  | {
      kind: 'custom';
      curve: KonitifInterpolationCurve;
    };

const defaultKonitifInterpolationCurve: KonitifInterpolationCurve = {
  x1: 0.22,
  y1: 0,
  x2: 0.18,
  y2: 1
};

const presetCurves: Record<Exclude<KonitifInterpolationPreset, 'step' | 'linear'>, KonitifInterpolationCurve> = {
  ease_in: {
    x1: 0.42,
    y1: 0,
    x2: 1,
    y2: 1
  },
  ease_out: {
    x1: 0,
    y1: 0,
    x2: 0.58,
    y2: 1
  },
  ease_in_out: {
    x1: 0.42,
    y1: 0,
    x2: 0.58,
    y2: 1
  }
};

export function normalizeCurve(curve: Partial<KonitifInterpolationCurve> | null | undefined): KonitifInterpolationCurve {
  return {
    x1: clampUnitValue(curve?.x1 ?? defaultKonitifInterpolationCurve.x1),
    y1: clampUnitValue(curve?.y1 ?? defaultKonitifInterpolationCurve.y1),
    x2: clampUnitValue(curve?.x2 ?? defaultKonitifInterpolationCurve.x2),
    y2: clampUnitValue(curve?.y2 ?? defaultKonitifInterpolationCurve.y2)
  };
}

export function normalizeSegmentInterpolation(
  interpolation: unknown,
  fallback: KonitifSegmentInterpolation = 'linear'
): KonitifSegmentInterpolation {
  if (isKonitifInterpolationPreset(interpolation)) {
    return interpolation;
  }

  if (isCustomInterpolation(interpolation)) {
    return {
      kind: 'custom',
      curve: normalizeCurve(interpolation.curve)
    };
  }

  return normalizeSegmentInterpolationFallback(fallback);
}

export function evaluateInterpolation(interpolation: KonitifSegmentInterpolation, progress: number): number {
  const clampedProgress = clampUnitValue(progress);
  const normalizedInterpolation = normalizeSegmentInterpolation(interpolation);

  if (normalizedInterpolation === 'step') {
    return clampedProgress < 1 ? 0 : 1;
  }

  if (normalizedInterpolation === 'linear') {
    return clampedProgress;
  }

  return sampleInterpolation(getInterpolationCurve(normalizedInterpolation), clampedProgress);
}

export function sampleInterpolation(curve: KonitifInterpolationCurve, progress: number): number {
  const normalizedCurve = normalizeCurve(curve);
  const clampedProgress = clampUnitValue(progress);
  let parameter = clampedProgress;

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const currentX = sampleCubicBezierAtT(parameter, normalizedCurve.x1, normalizedCurve.x2) - clampedProgress;
    const slope = sampleCubicBezierSlopeAtT(parameter, normalizedCurve.x1, normalizedCurve.x2);

    if (Math.abs(currentX) < 0.000001 || Math.abs(slope) < 0.000001) {
      break;
    }

    parameter -= currentX / slope;
    parameter = clampUnitValue(parameter);
  }

  return clampUnitValue(sampleCubicBezierAtT(parameter, normalizedCurve.y1, normalizedCurve.y2));
}

function getInterpolationCurve(interpolation: Exclude<KonitifSegmentInterpolation, 'step' | 'linear'>): KonitifInterpolationCurve {
  if (typeof interpolation === 'object') {
    return normalizeCurve(interpolation.curve);
  }

  return presetCurves[interpolation];
}

function normalizeSegmentInterpolationFallback(fallback: KonitifSegmentInterpolation): KonitifSegmentInterpolation {
  if (typeof fallback === 'object') {
    return {
      kind: 'custom',
      curve: normalizeCurve(fallback.curve)
    };
  }

  return fallback;
}

function isKonitifInterpolationPreset(value: unknown): value is KonitifInterpolationPreset {
  return (
    value === 'step' ||
    value === 'linear' ||
    value === 'ease_in' ||
    value === 'ease_out' ||
    value === 'ease_in_out'
  );
}

function isCustomInterpolation(value: unknown): value is { kind: 'custom'; curve: Partial<KonitifInterpolationCurve> } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { kind?: unknown; curve?: unknown };

  return candidate.kind === 'custom' && !!candidate.curve && typeof candidate.curve === 'object';
}

function clampUnitValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function sampleCubicBezierAtT(t: number, control1: number, control2: number): number {
  const inverse = 1 - t;

  return 3 * inverse * inverse * t * control1 + 3 * inverse * t * t * control2 + t * t * t;
}

function sampleCubicBezierSlopeAtT(t: number, control1: number, control2: number): number {
  const inverse = 1 - t;

  return 3 * inverse * inverse * control1 + 6 * inverse * t * (control2 - control1) + 3 * t * t * (1 - control2);
}
