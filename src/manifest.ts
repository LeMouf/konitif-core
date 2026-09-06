import { defineKonitifApp, type KonitifAppManifest } from './app.js';
import { defineKonitifTool, type KonitifToolManifest } from './tool.js';

export interface CreateKonitifManifestOptions {
  app: KonitifAppManifest;
  tools?: KonitifToolManifest[];
}

export function createKonitifManifest(options: CreateKonitifManifestOptions): KonitifAppManifest {
  const declaredTools = options.tools?.map((tool) => defineKonitifTool(tool)) ?? [];
  const app = defineKonitifApp(options.app);
  const appTools = app.tools ?? [];

  return {
    ...app,
    tools: mergeTools([...appTools, ...declaredTools])
  };
}

function mergeTools(tools: KonitifToolManifest[]): KonitifToolManifest[] {
  const byId = new Map<string, KonitifToolManifest>();

  for (const tool of tools) {
    byId.set(tool.id, tool);
  }

  return [...byId.values()];
}
