export type KonitifTarget = string;
export type KonitifTrackTarget = KonitifTarget;
export type KonitifValue = number;
export type KonitifNullableValue = KonitifValue | null;

export interface KonitifTargetedValue<
  TTarget extends KonitifTarget = KonitifTarget,
  TValue extends KonitifValue = KonitifValue
> {
  target: TTarget;
  value: TValue;
}

export interface KonitifNullableTargetedValue<TTarget extends KonitifTarget = KonitifTarget> {
  target: TTarget;
  value: KonitifNullableValue;
}

export interface KonitifNumericRange {
  min: KonitifValue;
  max: KonitifValue;
}

export interface NormalizeKonitifNumericRangeOptions {
  minimumSpan?: KonitifValue;
}

export function normalizeKonitifValue(value: unknown, fallback: KonitifValue = 0): KonitifValue {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function normalizeNumericRange(
  range: KonitifNumericRange,
  options: NormalizeKonitifNumericRangeOptions = {}
): KonitifNumericRange {
  const rawMin = normalizeKonitifValue(range.min);
  const rawMax = normalizeKonitifValue(range.max, rawMin);
  const min = Math.min(rawMin, rawMax);
  const max = Math.max(rawMin, rawMax);
  const minimumSpan = Math.max(0, normalizeKonitifValue(options.minimumSpan ?? 0));

  return {
    min,
    max: Math.max(max, min + minimumSpan)
  };
}

export function clampKonitifValue(value: KonitifValue, range: KonitifNumericRange): KonitifValue {
  const normalizedRange = normalizeNumericRange(range);
  return Math.max(normalizedRange.min, Math.min(normalizedRange.max, normalizeKonitifValue(value)));
}
