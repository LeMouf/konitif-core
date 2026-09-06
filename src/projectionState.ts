export type KonitifProjectionState =
  | 'reported'
  | 'desired'
  | 'simulated';

const KONITIF_PROJECTION_STATES: readonly KonitifProjectionState[] = [
  'reported',
  'desired',
  'simulated'
];

export function normalizeProjectionState(
  input: unknown,
  fallback: KonitifProjectionState = 'reported'
): KonitifProjectionState {
  return isKonitifProjectionState(input) ? input : fallback;
}

export function isKonitifProjectionState(input: unknown): input is KonitifProjectionState {
  return typeof input === 'string' && KONITIF_PROJECTION_STATES.includes(input as KonitifProjectionState);
}

export function isReportedProjectionState(state: KonitifProjectionState): boolean {
  return state === 'reported';
}

export function isDesiredProjectionState(state: KonitifProjectionState): boolean {
  return state === 'desired';
}

export function isSimulatedProjectionState(state: KonitifProjectionState): boolean {
  return state === 'simulated';
}
