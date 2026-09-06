import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'konitif-core-package-check-'));
const run = (command, args, cwd = root) => execFileSync(command, args, {
  cwd, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  env: { ...process.env, npm_config_offline: 'true', npm_config_cache: join(temp, 'cache') }
});
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
// Build/tests are explicit preceding steps; packing never installs dependencies.
const [packed] = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', temp]));
const files = packed.files.map(file => file.path);
for (const file of files) assert.match(file, /^(dist\/|src\/|reference\/|package\.json$|README\.md$|LICENSE\.md$)/);
for (const file of ['dist/index.js', 'dist/index.d.ts', 'src/index.ts', 'LICENSE.md']) assert.ok(files.includes(file), file);
const consumer = join(temp, 'consumer');
const dependency = join(consumer, 'node_modules/@konitif/core');
mkdirSync(dependency, { recursive: true });
run('tar', ['-xzf', join(temp, packed.filename), '-C', dependency, '--strip-components=1']);
cpSync(join(root, 'tests/consumer.mts'), join(consumer, 'consumer.mts'));
run(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'consumer.mts'], consumer);
console.log(run(process.execPath, ['--input-type=module', '-e',
  `import {createInMemoryWorkspace,KONITIF_CORE_VERSION} from '@konitif/core'; if(KONITIF_CORE_VERSION!==${JSON.stringify(manifest.version)}) throw Error('version mismatch'); if(createInMemoryWorkspace({id:'external'}).getSnapshot().id!=='external') throw Error('workspace'); console.log('External package import OK');`], consumer));
console.log(JSON.stringify({ integrity: packed.integrity, bytes: packed.size, files: files.length, temporaryEvidence: temp }, null, 2));
if (process.env.CORE_RELEASE_ARCHIVE === 'true') {
  const release = join(root, '.release');
  mkdirSync(release, { recursive: true });
  cpSync(join(temp, packed.filename), join(release, 'core.tgz'), { errorOnExist: true, force: false });
  console.log('Validated archive retained at .release/core.tgz');
}
