# Core independent repository baseline

Preparation date: 2026-09-06. Starting source version: 0.284.1.
Owner-confirmed first public version: 0.284.1, expected tag v0.284.1.
Status: inaugural source baseline for the independent Core repository.
The first commit records this starting point; the implementation follows in a
separate initial import commit. No npm version has been published by this baseline.

## Scope

Core provides amodal application/tool manifests, command registration, a volatile
workspace authority, time/value/clip/sequence contracts and derivation primitives.
It does not provide a UI, robot runtime, durable storage or distributed authority.
The reference catalogs are documentation, not executable authority.

KONITIF v0.x is source-available under PolyForm Noncommercial 1.0.0; see LICENSE.md.
Company applications, vendor assets and development-repository Git history are
excluded. This candidate does not grant a commercial authorization.

## Reproduction

In the standalone checkout, run `npm ci --ignore-scripts --no-audit --no-fund`,
then `npm run build` and `npm test`. The committed npm lockfile pins the approved
TypeScript 5.9.3 compiler and its integrity. It has no transitive dependencies.
Tests use Node's built-in runner and the emitted public API. No runtime
dependencies are declared. The isolated install/build was verified using Node
22.22.0 and npm 10.9.4; exact versions are recorded in preparation evidence.
This proves a fresh isolated source-tree build, not an executed GitHub CI run.
In the development monorepo, retain pnpm and its root lockfile; do not run npm ci
inside the workspace package directory.

`src` is included alongside `dist` so declaration/source maps resolve to public
source files within the package. Tests and this baseline belong to the source
repository, not the npm artifact. npm lifecycle hooks build and test before pack
and publication; local staging additionally inspects the actual archive contents.

## Compatibility and limits

Workspace metadata is deeply copied plain data. Class instances, getters,
functions and cyclic data are refused; older consumers relying on shallow aliasing
must adapt. `update` preserves identity; `reset` may replace it explicitly.
No persisted-data migration is implied. Durable lifecycle, access control and
real-world confirmation remain host responsibilities.

Local evidence is not a complete KONITIF certification. Browser compatibility,
all exported helpers and a registry-installed consumer require further coverage.

## History and source authority

First commit intent: `chore: establish reviewed Core baseline`.
Do not copy the mixed development history. Review contents and preserve the
confirmed initial version 0.284.1 before committing. After explicit cutover the dedicated
Core repository becomes the editing authority; until then this staging tree is
a disposable derived candidate, not a second editable source of truth.
