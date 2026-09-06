# Repository and release activation

Owner-confirmed first public version: `0.284.1`; expected tag: `v0.284.1`.
Preserve continuity with the existing source and catalogs. A fresh Git history
does not reset package versions. This decision does not create a tag or release.

## Candidate 0.284.2

Infrastructure-only patch release intended to exercise the protected GitHub OIDC
publication path. No functional API change; the exported version changes to
0.284.2. The manifest, lockfile and runtime version are synchronized. Reference
catalogs contain no package-version field and are unchanged. Historical baseline
and 0.284.1 publication evidence remain unchanged.

Validation on PR/main must pass before activation. The owner must then set the
repository Actions variable CORE_NPM_PUBLISH_ENABLED to true (not an environment
variable: the job-level condition is evaluated before entering npm-release).
Create v0.284.2 only on the validated merged commit, then approve the protected
npm-release deployment. A green validation CI is not proof of OIDC publication.
After publication, verify registry version/integrity and provenance. If a run
fails after uploading, check the registry before any retry; never overwrite a
published version. No new release is claimed by this candidate document.

## Activation checkpoint (2026-09-06)

Core 0.284.1 was published manually to bootstrap the npm package. Its registry
integrity matches the verified archive:
`sha512-zUxINek1Po4SAy0m/3si4CndR4tGlxiyt9WssGxiQzXe8p07US+3zH4r7aPa6Mr/MBTmjXMZCIlVjMnhFQkXVw==`.
This first publication has no GitHub OIDC provenance. Do not republish it.
The owner configured main protection, the npm-release environment and the npm
trusted publisher (LeMouf/konitif-core, publish.yml, npm-release, direct publish).
An actual OIDC publication remains untested; leave activation disabled until
the updated CI passes and a new version is deliberately prepared.

Baseline validation run 34025151610 succeeded, but its default npm 10.9.8 is
too old for OIDC. Both workflows now select the already cached Node 24.20.0
from the reviewed ubuntu-24.04 image and validate its bundled npm against the
OIDC minimum. Missing cache or incompatible npm fails without downloading a
fallback. Only the locked TypeScript dependency is installed. Checkout is pinned
to the exact revision used in the successful baseline CI. The runner image itself
remains rolling; this is not a fully hermetic build.

The workflow grants read-only repository permission, disables persisted checkout
credentials, and has no publish command or OIDC permission. Pull requests cannot
publish a package through this workflow. The package check extracts a local
archive for runtime/type checks; it does not install a registry consumer.

Release checklist (some steps completed in the checkpoint above):

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
The bundled npm version is checked at runtime; runner image updates may require
a reviewed change to the pinned cache version.

Only the publish job receives `id-token: write`; no long-lived npm token is
configured. `verify:package` checks a packed archive using an external runtime
and TypeScript consumer, then retains that exact archive in `.release/core.tgz`
when `CORE_RELEASE_ARCHIVE=true`. Publication uses it with public access,
provenance, explicit npm registry and lifecycle scripts disabled. Version
publication is not automatically rolled back or overwritten on failure.

First-package bootstrap is complete. No manual-token fallback is encoded in the
workflow. No release tag or OIDC publication has been created by this preparation.
The next release must use a new version, with manifest, lock, exported version
and catalogs kept consistent. Keep CORE_NPM_PUBLISH_ENABLED disabled while
recording any historical v0.284.1 tag so it cannot trigger a duplicate publish.

Local reproduction in an isolated Core checkout:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm test
npm run verify:package
```
