export type KonitifToolCapabilityRequirementMode = 'required' | 'optional';

export interface KonitifToolProvidedCapability {
  id: string;
  version: string;
}

export interface KonitifToolConsumedCapability {
  id: string;
  versionRange: string;
  mode: KonitifToolCapabilityRequirementMode;
  purpose?: string;
}

export interface KonitifToolCapabilities {
  provides: readonly KonitifToolProvidedCapability[];
  consumes: readonly KonitifToolConsumedCapability[];
}

export interface KonitifToolManifest {
  id: string;
  name: string;
  description?: string;
  version?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  capabilities?: KonitifToolCapabilities;
}

export function defineKonitifTool(manifest: KonitifToolManifest): KonitifToolManifest {
  return {
    ...manifest,
    id: normalizeRequiredIdentifier(manifest.id, 'tool id'),
    name: normalizeRequiredText(manifest.name, 'tool name'),
    tags: manifest.tags ? [...manifest.tags] : undefined,
    metadata: manifest.metadata ? { ...manifest.metadata } : undefined,
    capabilities: manifest.capabilities
      ? normalizeKonitifToolCapabilities(manifest.capabilities)
      : undefined
  };
}

export function normalizeKonitifToolCapabilities(
  capabilities: Partial<KonitifToolCapabilities>
): KonitifToolCapabilities {
  return Object.freeze({
    provides: Object.freeze((capabilities.provides ?? []).map((capability) => Object.freeze({
      id: normalizeRequiredIdentifier(capability.id, 'provided capability id'),
      version: normalizeCapabilityVersion(capability.version, 'provided capability version')
    }))),
    consumes: Object.freeze((capabilities.consumes ?? []).map((requirement) => Object.freeze({
      id: normalizeRequiredIdentifier(requirement.id, 'consumed capability id'),
      versionRange: normalizeCapabilityVersionRange(requirement.versionRange),
      mode: requirement.mode === 'required' ? 'required' : 'optional',
      ...(requirement.purpose?.trim() ? { purpose: requirement.purpose.trim() } : {})
    })))
  });
}

export function isKonitifCapabilityVersionCompatible(version: string, versionRange: string): boolean {
  const parsedVersion = parseSemanticVersion(version);
  const normalizedRange = normalizeCapabilityVersionRange(versionRange);

  if (!parsedVersion || normalizedRange === '*') {
    return normalizedRange === '*' || version.trim() === normalizedRange;
  }

  const rangePrefix = normalizedRange[0];
  const rangeVersion = parseSemanticVersion(
    rangePrefix === '^' || rangePrefix === '~' ? normalizedRange.slice(1) : normalizedRange
  );

  if (!rangeVersion) {
    return version.trim() === normalizedRange;
  }

  if (rangePrefix === '^') {
    return parsedVersion.major === rangeVersion.major && compareSemanticVersions(parsedVersion, rangeVersion) >= 0;
  }

  if (rangePrefix === '~') {
    return parsedVersion.major === rangeVersion.major &&
      parsedVersion.minor === rangeVersion.minor &&
      compareSemanticVersions(parsedVersion, rangeVersion) >= 0;
  }

  return compareSemanticVersions(parsedVersion, rangeVersion) === 0;
}

function normalizeRequiredIdentifier(value: string, fieldName: string): string {
  const normalized = normalizeRequiredText(value, fieldName);

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(normalized)) {
    throw new Error(`Invalid KONITIF ${fieldName}: "${value}".`);
  }

  return normalized;
}

function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`Missing KONITIF ${fieldName}.`);
  }

  return normalized;
}

function normalizeCapabilityVersion(value: string, fieldName: string): string {
  const normalized = normalizeRequiredText(value, fieldName);

  if (!parseSemanticVersion(normalized)) {
    throw new Error(`Invalid KONITIF ${fieldName}: "${value}".`);
  }

  return normalized;
}

function normalizeCapabilityVersionRange(value: string): string {
  const normalized = normalizeRequiredText(value, 'capability version range');

  if (normalized === '*') {
    return normalized;
  }

  const version = normalized[0] === '^' || normalized[0] === '~'
    ? normalized.slice(1)
    : normalized;

  if (!parseSemanticVersion(version)) {
    throw new Error(`Invalid KONITIF capability version range: "${value}".`);
  }

  return normalized;
}

interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
}

function parseSemanticVersion(value: string): SemanticVersion | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.trim());

  return match
    ? {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3])
      }
    : null;
}

function compareSemanticVersions(left: SemanticVersion, right: SemanticVersion): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}
