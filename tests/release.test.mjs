import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertReleaseContract, assertPublishingTools } from '../scripts/release-contract.mjs';

const read = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const manifest = read('package.json');
const valid = { manifest, lock: read('package-lock.json'), exportedVersion: manifest.version,
  repository: 'LeMouf/konitif-core', ref: `refs/tags/v${manifest.version}`, event: 'push' };
test('admits the matching public release', () => assertReleaseContract(valid));
for (const patch of [{ repository: 'someone/core' }, { ref: 'refs/heads/main' },
  { ref: 'refs/tags/v0.1.0' }, { event: 'pull_request' }, { exportedVersion: '0.0.0' },
  { manifest: { ...manifest, private: true } },
  { lock: { ...valid.lock, version: '0.0.0' } }]) {
  test(`refuses invalid release ${JSON.stringify(patch)}`, () => assert.throws(() => assertReleaseContract({ ...valid, ...patch })));
}
test('requires OIDC-compatible stable tool versions without upgrading', () => {
  assertPublishingTools('22.14.0', '11.5.1');
  assertPublishingTools('24.0.0', '12.0.0');
  for (const [node, npm] of [['22.13.0','11.5.1'], ['22.22.0','10.9.4'], ['22.22.0','11.5.0'], ['24.0.0','12.0.0-beta']]) {
    assert.throws(() => assertPublishingTools(node, npm));
  }
});
