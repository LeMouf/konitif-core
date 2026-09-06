# Repository and release activation

Owner-confirmed first public version: `0.284.1`; expected tag: `v0.284.1`.
Preserve continuity with the existing source and catalogs. A fresh Git history
does not reset package versions. This decision does not create a tag or release.

The validation workflow is prepared, not yet executed on GitHub. It uses the
runner's preinstalled Node/npm, prints their versions, refuses Node below 22,
and does not install a runtime. Only the locked TypeScript dependency is installed.
The existing checkout v4 action is reused. Review/pin its commit before release
hardening; the runtime environment is not yet fully pinned.

The workflow grants read-only repository permission, disables persisted checkout
credentials, and has no publish command or OIDC permission. Pull requests cannot
publish a package through this workflow. The package check extracts a local
archive for runtime/type checks; it does not install a registry consumer.

Before enabling releases:

1. Provide authenticated access to the approved public LeMouf/konitif-core
   destination and verify the npm scope owner. Never put credentials in source.
2. Review the allowlisted baseline and create a new Git history. Do not copy the
   development repository's history or company applications. Confirm source cutover.
3. Run the CI on GitHub and review the archive for the confirmed first version
   0.284.1. Verify that tag v0.284.1, manifest, lockfile and exported version agree.
4. Approve exact publishing toolchain/action revisions and configure npm trusted
   publishing with a protected release environment. npm 10.9.4 used locally is
   not sufficient for trusted publishing; no upgrade is authorized by this file.
5. Activate the prepared `publish.yml` only after the configuration below.
   Validate the actual registry-installed consumer before migrating applications.

## Prepared publication contract

`publish.yml` runs only on tag pushes in `LeMouf/konitif-core`, and only when
the repository variable `CORE_NPM_PUBLISH_ENABLED` is exactly `true`.
It checks that the tagged commit is in `main` history and that tag, package
manifest, lockfile and compiled exported version agree. Stable releases only;
prerelease channels require an explicit policy extension.

The job runs in the `npm-release` environment. Before enabling the variable,
configure required reviewers and permitted release tags for that environment,
protect main, restrict tag creation/deletion, and review workflow changes.
An environment declaration alone does not create approval protection.

Configure the npm trusted publisher as:

- Owner: `LeMouf`
- Repository: `konitif-core`
- Workflow filename: `publish.yml`
- Environment: `npm-release`
- Explicitly allow direct `npm publish`, not only staged publishing.

Official requirements: https://docs.npmjs.com/trusted-publishers/

Preinstalled Node must be at least 22.14.0 and npm at least 11.5.1. The workflow
fails rather than installing/upgrading either. The local npm 10.9.4 intentionally
fails this publishing gate; local build/package verification remains available.
The runner toolchain and checkout action still require exact revision hardening.

Only the publish job receives `id-token: write`; no long-lived npm token is
configured. `verify:package` checks a packed archive using an external runtime
and TypeScript consumer, then retains that exact archive in `.release/core.tgz`
when `CORE_RELEASE_ARCHIVE=true`. Publication uses it with public access,
provenance, explicit npm registry and lifecycle scripts disabled. Version
publication is not automatically rolled back or overwritten on failure.

First-package scope ownership/bootstrap is still an activation gate: confirm
how the package is registered and its trusted publisher enabled before pushing
the first release tag. No manual-token fallback is encoded in the workflow.
No GitHub workflow execution, tag creation or npm publication has occurred here.

Local reproduction in an isolated Core checkout:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run verify:package
```
