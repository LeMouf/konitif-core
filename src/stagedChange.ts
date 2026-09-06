import type { KonitifKey } from './key.js';
import {
  isDesiredProjectionState,
  isKonitifProjectionState,
  normalizeProjectionState,
  type KonitifProjectionState
} from './projectionState.js';
import type { KonitifTrackTarget } from './targetValue.js';

export type KonitifStagedChangeId = string;

export type KonitifStagedChangeKind =
  | 'key'
  | 'track'
  | 'clip'
  | 'sequence'
  | string;

export interface KonitifStagedChange<TDesired = unknown, TReported = unknown> {
  id: KonitifStagedChangeId;
  kind: KonitifStagedChangeKind;
  projectionState: KonitifProjectionState;
  desired: TDesired;
  reported?: TReported | null;
}

export interface KonitifStagedKeyChange extends KonitifStagedChange<KonitifKey, KonitifKey | null> {
  kind: 'key';
  target: KonitifTrackTarget;
}

export interface NormalizeKonitifStagedChangeInput<TDesired = unknown, TReported = unknown> {
  id?: KonitifStagedChangeId | null;
  kind?: KonitifStagedChangeKind | null;
  projectionState?: KonitifProjectionState | null;
  desired: TDesired;
  reported?: TReported | null;
}

export function normalizeStagedChange<TDesired = unknown, TReported = unknown>(
  input: NormalizeKonitifStagedChangeInput<TDesired, TReported>
): KonitifStagedChange<TDesired, TReported> {
  return {
    id: normalizeText(input.id, 'staged-change'),
    kind: normalizeText(input.kind, 'change'),
    projectionState: normalizeProjectionState(input.projectionState, 'desired'),
    desired: input.desired,
    reported: input.reported ?? null
  };
}

export function isStagedChange(input: unknown): input is KonitifStagedChange {
  if (!isPlainRecord(input)) {
    return false;
  }

  return (
    isNonEmptyString(input.id) &&
    isNonEmptyString(input.kind) &&
    isKonitifProjectionState(input.projectionState) &&
    Object.prototype.hasOwnProperty.call(input, 'desired')
  );
}

export function isDesiredStagedChange(change: Pick<KonitifStagedChange, 'projectionState'>): boolean {
  return isDesiredProjectionState(change.projectionState);
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const text = typeof value === 'string' ? value.trim() : '';

  return text.length > 0 ? text : fallback;
}

function isPlainRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === 'string' && input.trim().length > 0;
}
