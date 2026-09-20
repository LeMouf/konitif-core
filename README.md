# @konitif/core

Portable amodal contracts and local primitives for describing and manipulating
KONITIF systems independently of any projection or runtime implementation.

## Installation

```sh
npm install @konitif/core
```

## What it provides

- Application and tool declarations.
- Local command registration and invocation.
- An in-memory workspace authority with detached snapshots.
- Time, value, key, track, clip, sequence and interpolation contracts.
- Projection-state, staged-change and artifact-derivation primitives.

## Authority boundary

Core defines portable contracts and owns only the state of objects it creates,
such as an in-memory workspace or command registry. Durable persistence,
distributed synchronization, rendering, domain policy and real-world effect
confirmation remain responsibilities of explicit consumers.

## Quick start

```ts
import {
  createCommandRegistry,
  createInMemoryWorkspace,
  defineKonitifApp,
  defineKonitifTool,
} from '@konitif/core';

const inspect = defineKonitifTool({ id: 'inspect', name: 'Inspect' });
const app = defineKonitifApp({ id: 'example', name: 'Example', tools: [inspect] });
const workspace = createInMemoryWorkspace({ name: app.name });
const commands = createCommandRegistry();

console.log(workspace.getSnapshot(), commands.list());
```

Workspace metadata accepts plain data. Functions, accessors, class instances
and cyclic structures are rejected at the boundary.

## Public entry points

| Entry | Purpose |
| --- | --- |
| `@konitif/core` | Core contracts, factories and pure operators. |

## Reference

See [`reference/`](reference/) for the machine-readable capability catalog and
authority diagrams. These artifacts describe the package and do not replace
its exported contracts.

## License

Source-available under [PolyForm Noncommercial 1.0.0](LICENSE.md), not OSI open
source. Commercial use requires separate written authorization.
