import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('CI and publication use the same checked cached runtime and checkout', () => {
  for (const workflow of ['ci.yml', 'publish.yml']) {
    const text = readFileSync(new URL(`../.github/workflows/${workflow}`, import.meta.url), 'utf8');
    assert.match(text, /run: bash scripts\/select-ci-runtime\.sh/);
    assert.match(text, /actions\/checkout@11d5960a326750d5838078e36cf38b85af677262/);
    assert.doesNotMatch(text, /setup-node|npm install -g/);
  }
});

test('runtime selection refuses a missing cache without installing a fallback', { skip: process.platform === 'win32' }, () => {
  const result = spawnSync('bash', [fileURLToPath(new URL('../scripts/select-ci-runtime.sh', import.meta.url))], {
    env: { PATH: process.env.PATH, GITHUB_PATH: '/dev/null' }, encoding: 'utf8',
  });
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /GitHub runner tool cache required/);
});
