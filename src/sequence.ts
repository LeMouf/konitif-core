import type { KonitifClipId } from './clip.js';
import type { KonitifDuration } from './timeFrame.js';

export type KonitifSequenceId = string;
export type KonitifSequenceStepId = string;

export interface KonitifSequenceStep {
  id: KonitifSequenceStepId;
  index: number;
  clipId: KonitifClipId | null;
  label: string;
  durationSeconds: KonitifDuration | null;
}

export interface KonitifSequence {
  id?: KonitifSequenceId | null;
  title?: string | null;
  steps: KonitifSequenceStep[];
}

export interface NormalizeKonitifSequenceStepInput {
  id?: KonitifSequenceStepId | null;
  index?: number | null;
  clipId?: KonitifClipId | null;
  label?: string | null;
  durationSeconds?: KonitifDuration | null;
}

export interface NormalizeKonitifSequenceInput {
  id?: KonitifSequenceId | null;
  title?: string | null;
  steps?: readonly NormalizeKonitifSequenceStepInput[] | null;
}

export function normalizeSequenceStep(
  input: NormalizeKonitifSequenceStepInput,
  fallbackIndex = 0
): KonitifSequenceStep {
  const index = normalizeIndex(input.index, fallbackIndex);
  const clipId = normalizeOptionalText(input.clipId);

  return {
    id: normalizeText(input.id, `sequence-step:${normalizeIndex(fallbackIndex, 0)}`),
    index,
    clipId,
    label: normalizeText(input.label, clipId ?? `Step ${index + 1}`),
    durationSeconds: normalizeDuration(input.durationSeconds)
  };
}

export function normalizeSequence(input: NormalizeKonitifSequenceInput): KonitifSequence {
  return {
    id: normalizeOptionalText(input.id),
    title: normalizeOptionalText(input.title),
    steps: normalizeSequenceSteps(input.steps)
  };
}

export function resolveSequenceDuration(sequence: Pick<KonitifSequence, 'steps'>): KonitifDuration | null {
  if (sequence.steps.length === 0) {
    return 0;
  }

  return sequence.steps.reduce<KonitifDuration | null>((total, step) => {
    if (total === null || step.durationSeconds === null) {
      return null;
    }

    return total + normalizeDuration(step.durationSeconds)!;
  }, 0);
}

export function nextSequenceStep(
  sequence: Pick<KonitifSequence, 'steps'>,
  currentStepId: KonitifSequenceStepId | null
): KonitifSequenceStep | null {
  if (!currentStepId) {
    return null;
  }

  const index = sequence.steps.findIndex((step) => step.id === currentStepId);

  return index >= 0 ? sequence.steps[index + 1] ?? null : null;
}

export function previousSequenceStep(
  sequence: Pick<KonitifSequence, 'steps'>,
  currentStepId: KonitifSequenceStepId | null
): KonitifSequenceStep | null {
  if (!currentStepId) {
    return null;
  }

  const index = sequence.steps.findIndex((step) => step.id === currentStepId);

  return index > 0 ? sequence.steps[index - 1] ?? null : null;
}

export function insertSequenceStep(
  sequence: KonitifSequence,
  step: NormalizeKonitifSequenceStepInput,
  index: number
): KonitifSequence {
  const normalizedSequence = normalizeSequence(sequence);
  const insertionIndex = clampIndex(index, normalizedSequence.steps.length);
  const steps = [
    ...normalizedSequence.steps.slice(0, insertionIndex),
    normalizeSequenceStep(step, insertionIndex),
    ...normalizedSequence.steps.slice(insertionIndex)
  ];

  return {
    ...normalizedSequence,
    steps: normalizeSequenceSteps(steps)
  };
}

export function appendSequenceStep(
  sequence: KonitifSequence,
  step: NormalizeKonitifSequenceStepInput
): KonitifSequence {
  return insertSequenceStep(sequence, step, sequence.steps.length);
}

export function removeSequenceStep(
  sequence: KonitifSequence,
  stepId: KonitifSequenceStepId
): KonitifSequence {
  const normalizedSequence = normalizeSequence(sequence);

  return {
    ...normalizedSequence,
    steps: normalizeSequenceSteps(normalizedSequence.steps.filter((step) => step.id !== stepId))
  };
}

function normalizeSequenceSteps(
  steps: readonly NormalizeKonitifSequenceStepInput[] | null | undefined
): KonitifSequenceStep[] {
  return Array.isArray(steps)
    ? steps.map((step, index) => ({
        ...normalizeSequenceStep(step, index),
        index
      }))
    : [];
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(Math.round(normalizeNumber(index)), length));
}

function normalizeIndex(index: number | null | undefined, fallback: number): number {
  return Math.max(0, Math.round(normalizeNumber(index, fallback)));
}

function normalizeDuration(duration: KonitifDuration | null | undefined): KonitifDuration | null {
  return typeof duration === 'number' && Number.isFinite(duration) ? Math.max(0, duration) : null;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const text = typeof value === 'string' ? value.trim() : '';

  return text.length > 0 ? text : null;
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  return normalizeOptionalText(value) ?? fallback;
}

function normalizeNumber(value: number | null | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
