import { defineKonitifTool, type KonitifToolManifest } from './tool.js';

export interface KonitifAppManifest {
  id: string;
  name: string;
  version?: string;
  tools?: KonitifToolManifest[];
  metadata?: Record<string, unknown>;
}

export function defineKonitifApp(manifest: KonitifAppManifest): KonitifAppManifest {
  return {
    ...manifest,
    id: normalizeRequiredIdentifier(manifest.id, 'app id'),
    name: normalizeRequiredText(manifest.name, 'app name'),
    tools: manifest.tools?.map((tool) => defineKonitifTool(tool)),
    metadata: manifest.metadata ? { ...manifest.metadata } : undefined
  };
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
