import { readFileSync } from 'node:fs';
import { KONITIF_CORE_VERSION } from '../dist/index.js';
import { assertReleaseContract } from './release-contract.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
assertReleaseContract({ manifest: read('package.json'), lock: read('package-lock.json'),
  exportedVersion: KONITIF_CORE_VERSION, repository: process.env.GITHUB_REPOSITORY,
  ref: process.env.GITHUB_REF, event: process.env.GITHUB_EVENT_NAME });
console.log('Release contract validated');
