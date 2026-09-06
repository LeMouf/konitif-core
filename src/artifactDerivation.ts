export const KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA =
  'konitif.artifact-derivation-draft' as const;
export const KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA_VERSION = 1 as const;

export interface KonitifArtifactDerivationSource {
  artifactId: string;
  artifactRevision: number | null;
  artifactVersion: string | null;
  fingerprint: string;
}

export interface KonitifArtifactDerivationChange {
  id: string;
  kind: string;
}

export interface KonitifArtifactDerivationDraft<
  TChange extends KonitifArtifactDerivationChange = KonitifArtifactDerivationChange
> {
  schema: typeof KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA;
  schemaVersion: typeof KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA_VERSION;
  id: string;
  source: KonitifArtifactDerivationSource;
  revision: number;
  status: 'editing' | 'staged';
  changes: TChange[];
}

export interface CreateKonitifArtifactDerivationDraftInput<
  TChange extends KonitifArtifactDerivationChange = KonitifArtifactDerivationChange
> {
  id: string;
  source: KonitifArtifactDerivationSource;
  changes?: readonly TChange[];
}

export function createArtifactDerivationDraft<
  TChange extends KonitifArtifactDerivationChange
>(
  input: CreateKonitifArtifactDerivationDraftInput<TChange>
): KonitifArtifactDerivationDraft<TChange> {
  return {
    schema: KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA,
    schemaVersion: KONITIF_ARTIFACT_DERIVATION_DRAFT_SCHEMA_VERSION,
    id: requireIdentifier(input.id, 'id'),
    source: normalizeArtifactDerivationSource(input.source),
    revision: 1,
    status: 'editing',
    changes: normalizeArtifactDerivationChanges(input.changes ?? [])
  };
}

export function upsertArtifactDerivationChange<
  TChange extends KonitifArtifactDerivationChange
>(
  draft: KonitifArtifactDerivationDraft<TChange>,
  change: TChange
): KonitifArtifactDerivationDraft<TChange> {
  const normalizedChange = normalizeArtifactDerivationChange(change);
  const currentIndex = draft.changes.findIndex((entry) => entry.id === normalizedChange.id);

  if (
    currentIndex >= 0 &&
    areArtifactDerivationChangesEqual(draft.changes[currentIndex]!, normalizedChange) &&
    draft.status === 'editing'
  ) {
    return draft;
  }

  const changes = currentIndex >= 0
    ? draft.changes.map((entry, index) => index === currentIndex ? normalizedChange : entry)
    : [...draft.changes, normalizedChange];

  return reviseArtifactDerivationDraft(draft, {
    status: 'editing',
    changes
  });
}

export function removeArtifactDerivationChange<
  TChange extends KonitifArtifactDerivationChange
>(
  draft: KonitifArtifactDerivationDraft<TChange>,
  changeId: string
): KonitifArtifactDerivationDraft<TChange> {
  const normalizedChangeId = requireIdentifier(changeId, 'changeId');
  const changes = draft.changes.filter((change) => change.id !== normalizedChangeId);

  if (changes.length === draft.changes.length) {
    return draft;
  }

  return reviseArtifactDerivationDraft(draft, {
    status: 'editing',
    changes
  });
}

export function stageArtifactDerivationDraft<
  TChange extends KonitifArtifactDerivationChange
>(draft: KonitifArtifactDerivationDraft<TChange>): KonitifArtifactDerivationDraft<TChange> {
  if (draft.status === 'staged') {
    return draft;
  }

  return cloneArtifactDerivationDraft(draft, {
    status: 'staged',
    changes: draft.changes
  });
}

function cloneArtifactDerivationDraft<
  TChange extends KonitifArtifactDerivationChange
>(
  draft: KonitifArtifactDerivationDraft<TChange>,
  update: Pick<KonitifArtifactDerivationDraft<TChange>, 'status' | 'changes'>
): KonitifArtifactDerivationDraft<TChange> {
  return {
    ...draft,
    ...update,
    changes: update.changes.map((change) => structuredClone(change))
  };
}

function reviseArtifactDerivationDraft<
  TChange extends KonitifArtifactDerivationChange
>(
  draft: KonitifArtifactDerivationDraft<TChange>,
  update: Pick<KonitifArtifactDerivationDraft<TChange>, 'status' | 'changes'>
): KonitifArtifactDerivationDraft<TChange> {
  return {
    ...cloneArtifactDerivationDraft(draft, update),
    revision: draft.revision + 1,
  };
}

function normalizeArtifactDerivationSource(
  source: KonitifArtifactDerivationSource
): KonitifArtifactDerivationSource {
  const artifactRevision = source.artifactRevision;

  if (
    artifactRevision !== null &&
    (!Number.isInteger(artifactRevision) || artifactRevision <= 0)
  ) {
    throw new Error('source.artifactRevision must be a positive integer or null.');
  }

  return {
    artifactId: requireIdentifier(source.artifactId, 'source.artifactId'),
    artifactRevision,
    artifactVersion: normalizeOptionalIdentifier(source.artifactVersion),
    fingerprint: requireIdentifier(source.fingerprint, 'source.fingerprint')
  };
}

function normalizeArtifactDerivationChanges<
  TChange extends KonitifArtifactDerivationChange
>(changes: readonly TChange[]): TChange[] {
  const normalizedChanges = changes.map(normalizeArtifactDerivationChange);
  const changeIds = new Set<string>();

  for (const change of normalizedChanges) {
    if (changeIds.has(change.id)) {
      throw new Error(`Duplicate artifact derivation change id: ${change.id}.`);
    }
    changeIds.add(change.id);
  }

  return normalizedChanges;
}

function normalizeArtifactDerivationChange<
  TChange extends KonitifArtifactDerivationChange
>(change: TChange): TChange {
  return {
    ...structuredClone(change),
    id: requireIdentifier(change.id, 'change.id'),
    kind: requireIdentifier(change.kind, 'change.kind')
  };
}

function areArtifactDerivationChangesEqual(
  left: KonitifArtifactDerivationChange,
  right: KonitifArtifactDerivationChange
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function requireIdentifier(value: string, field: string): string {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (!normalizedValue) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return normalizedValue;
}

function normalizeOptionalIdentifier(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
}
