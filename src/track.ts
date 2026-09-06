import type { KonitifKey } from './key.js';
import type { KonitifTrackTarget } from './targetValue.js';

export type KonitifTrackProperty = 'angle' | 'ratio';

export interface KonitifTrack {
  target: KonitifTrackTarget | null;
  property: KonitifTrackProperty;
  unit?: string | null;
  unitKind?: string | null;
  keys: KonitifKey[];
}
