/** Serializable reading of a workspace at a given instant. */
export interface KonitifWorkspaceSnapshot {
  /** Stable identifier of this workspace within the host's identity regime. */
  id: string;
  /** Human-readable label; never used as canonical identity. */
  name: string;
  /** ISO 8601 creation time preserved across updates. */
  createdAt: string;
  /** ISO 8601 time of the latest local update. */
  updatedAt: string;
  /** Plain data tree, deeply copied at every boundary. No instances, accessors or cycles. */
  metadata?: Record<string, unknown>;
}

/** Local authority over the current workspace snapshot. */
export interface KonitifWorkspace {
  /** Returns an isolated reading; mutating it cannot alter workspace state. */
  getSnapshot(): KonitifWorkspaceSnapshot;
  /** Updates only label/metadata. Invalid metadata throws TypeError without changing state. */
  update(patch: Partial<Pick<KonitifWorkspaceSnapshot, 'name' | 'metadata'>>): KonitifWorkspaceSnapshot;
  /** Replaces the current state from a partial snapshot and applies defaults. */
  reset(snapshot?: Partial<KonitifWorkspaceSnapshot>): KonitifWorkspaceSnapshot;
}

/**
 * Creates a volatile workspace authority.
 *
 * Use it for tests, prototypes, or hosts that provide persistence separately.
 * It does not provide durable storage, distributed synchronization, or tool-domain state.
 */
export function createInMemoryWorkspace(snapshot: Partial<KonitifWorkspaceSnapshot> = {}): KonitifWorkspace {
  let currentSnapshot = createWorkspaceSnapshot(snapshot);

  return {
    getSnapshot() {
      return cloneSnapshot(currentSnapshot);
    },

    update(patch) {
      currentSnapshot = cloneSnapshot({
        ...currentSnapshot,
        name: patch.name ?? currentSnapshot.name,
        metadata: patch.metadata ?? currentSnapshot.metadata,
        updatedAt: new Date().toISOString()
      });

      return cloneSnapshot(currentSnapshot);
    },

    reset(nextSnapshot = {}) {
      currentSnapshot = createWorkspaceSnapshot(nextSnapshot);
      return cloneSnapshot(currentSnapshot);
    }
  };
}

function createWorkspaceSnapshot(snapshot: Partial<KonitifWorkspaceSnapshot>): KonitifWorkspaceSnapshot {
  const now = new Date().toISOString();

  return {
    id: normalizeText(snapshot.id, 'default'),
    name: normalizeText(snapshot.name, 'KONITIF Workspace'),
    createdAt: snapshot.createdAt ?? now,
    updatedAt: snapshot.updatedAt ?? now,
    metadata: cloneMetadata(snapshot.metadata)
  };
}

function cloneSnapshot(snapshot: KonitifWorkspaceSnapshot): KonitifWorkspaceSnapshot {
  return {
    ...snapshot,
    metadata: cloneMetadata(snapshot.metadata)
  };
}

function cloneMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (metadata === undefined) return undefined;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new TypeError('Workspace metadata must be a plain record.');
  return cloneData(metadata, new Set()) as Record<string, unknown>;
}

function cloneData(value: unknown, ancestors: Set<object>): unknown {
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || ancestors.has(value)) {
    throw new TypeError('Workspace metadata must be an acyclic plain data tree.');
  }
  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Workspace metadata cannot contain class or built-in instances.');
  }
  ancestors.add(value);
  const copy: Record<string, unknown> | unknown[] = Array.isArray(value) ? new Array(value.length) : {};
  for (const key of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
    if (typeof key !== 'string' || !('value' in descriptor)) {
      throw new TypeError('Workspace metadata cannot contain symbols or accessors.');
    }
    Object.defineProperty(copy, key, {
      value: cloneData(descriptor.value, ancestors), enumerable: descriptor.enumerable,
      writable: true, configurable: true
    });
  }
  ancestors.delete(value);
  return copy;
}

function normalizeText(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : fallback;
}
