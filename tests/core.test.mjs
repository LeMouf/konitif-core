import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createInMemoryWorkspace, createCommandRegistry, KONITIF_CORE_VERSION,
  createArtifactDerivationDraft, upsertArtifactDerivationChange } from '../dist/index.js';

test('manifest and exported versions agree', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(KONITIF_CORE_VERSION, manifest.version);
  assert.equal(manifest.license, 'PolyForm-Noncommercial-1.0.0');
});

test('standalone toolchain is pinned and has no additional packages', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  assert.deepEqual(manifest.devDependencies, { typescript: '5.9.3' });
  assert.equal(lock.version, manifest.version);
  assert.equal(lock.packages[''].version, manifest.version);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
  assert.deepEqual(Object.keys(lock.packages).sort(), ['', 'node_modules/typescript']);
  assert.equal(lock.packages['node_modules/typescript'].version, '5.9.3');
  assert.equal(lock.packages['node_modules/typescript'].resolved, 'https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz');
});

test('workspace inputs and snapshots do not become mutable authorities', () => {
  const metadata = { panels: [{ value: 1 }] };
  const workspace = createInMemoryWorkspace({ id: 'stable', metadata });
  metadata.panels[0].value = 2;
  workspace.getSnapshot().metadata.panels[0].value = 3;
  assert.equal(workspace.getSnapshot().metadata.panels[0].value, 1);
  const next = { nested: { value: 4 } };
  const updated = workspace.update({ id: 'injected', metadata: next });
  next.nested.value = 5;
  updated.metadata.nested.value = 6;
  assert.equal(workspace.getSnapshot().id, 'stable');
  assert.equal(workspace.getSnapshot().metadata.nested.value, 4);
  const reset = workspace.reset({ id: 'reset', metadata: next });
  next.nested.value = 7;
  reset.metadata.nested.value = 8;
  assert.equal(workspace.getSnapshot().metadata.nested.value, 5);
});

test('invalid metadata fails atomically without invoking getters', () => {
  const workspace = createInMemoryWorkspace({ name: 'before' });
  const before = workspace.getSnapshot();
  const cycle = {}; cycle.self = cycle;
  for (const value of [cycle, new Date(), new Map(), Infinity, () => 0]) {
    assert.throws(() => workspace.update({ name: 'after', metadata: { value } }), TypeError);
    assert.deepEqual(workspace.getSnapshot(), before);
  }
  let calls = 0;
  assert.throws(() => workspace.reset({ metadata: { get value() { calls++; return 0; } } }), TypeError);
  assert.equal(calls, 0);
  assert.deepEqual(workspace.getSnapshot(), before);
});

test('registration has no effect; only admitted invocation runs the handler', async () => {
  let effects = 0;
  const registry = createCommandRegistry([
    { id: 'run', title: 'Run', run: () => { effects++; } },
    { id: 'denied', title: 'Denied', enabled: () => false, run: () => { effects++; } }
  ]);
  assert.equal(effects, 0);
  await assert.rejects(registry.run('missing', {}), /Unknown/);
  await assert.rejects(registry.run('denied', {}), /disabled/);
  assert.equal(effects, 0);
  await registry.run('run', {});
  assert.equal(effects, 1);
});

test('derivation draft retains provenance and repeated edits are idempotent', () => {
  const source = { artifactId: 'source', artifactRevision: 1, artifactVersion: '1', fingerprint: 'abc' };
  const draft = createArtifactDerivationDraft({ id: 'draft', source });
  const edited = upsertArtifactDerivationChange(draft, { id: 'change', kind: 'edit' });
  assert.equal(draft.changes.length, 0);
  assert.deepEqual(edited.source, source);
  assert.equal(upsertArtifactDerivationChange(edited, { id: 'change', kind: 'edit' }), edited);
});
