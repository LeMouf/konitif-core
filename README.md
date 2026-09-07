# @konitif/core

Source-available core contracts for KONITIF applications (experimental v0.x).
Licensed under PolyForm Noncommercial 1.0.0; see [LICENSE.md](LICENSE.md).
Public availability does not imply unrestricted commercial usage rights.

## Installation

Core is published on npm. To install the published 0.284.2 version:

```bash
pnpm add @konitif/core@0.284.2
```

## Usage

```ts
import {
  KONITIF_CORE_VERSION,
  createCommandRegistry,
  createInMemoryWorkspace,
  defineKonitifApp,
  defineKonitifTool
} from '@konitif/core';

const inspectTool = defineKonitifTool({
  id: 'robot.inspect',
  name: 'Inspect Robot'
});

const app = defineKonitifApp({
  id: 'example.behavior-studio',
  name: 'Example Behavior Studio',
  tools: [inspectTool]
});

const commands = createCommandRegistry();
const workspace = createInMemoryWorkspace({ name: app.name });

console.log(KONITIF_CORE_VERSION);
console.log(workspace.getSnapshot());
console.log(commands.list());
```

## Workspace snapshots

`createInMemoryWorkspace` owns volatile local state. Creation, update, reset and
reads deeply copy metadata, including nested arrays and records. Metadata accepts
plain data (strings, booleans, finite numbers, null, undefined, arrays and plain
records); functions, symbols, class instances, accessors and cycles are rejected
with `TypeError`. Failed updates/resets leave the previous state intact.
Convert dates and other application-specific objects into plain values before
passing them to this boundary. This tightens the former shallow-copy behavior.
`update` cannot change identity or creation time; `reset` explicitly can.
Durable persistence and distributed synchronization remain host responsibilities.

## Ecosystem and partnerships

The [KONITIF ecosystem registry](https://github.com/LeMouf/kontif/blob/main/ecosystem/registry.json)
owns current membership by reference, independently of optional ecosystem
releases. Core does not embed a copy of that registry. Membership, technical
accessibility and legal provenance are distinct from rights granted by the
applicable public licence or a separate agreement. This common framework can
support any partnership type; First Partner is one application, not a special
Core licence. Nominative agreements and access evidence stay in private supports.

## Development

Experimental public API.

Standalone development: `npm ci --ignore-scripts --no-audit --no-fund`,
`npm run build`, then `npm test`. The lockfile pins TypeScript 5.9.3. Tests
exercise the compiled public API with Node's built-in test runner. This independent
repository owns Core source; consuming workspaces reference the published package.
