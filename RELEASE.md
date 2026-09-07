# Core publication policy

## Published baseline

Core 0.284.1 was published manually to bootstrap the npm package.
Core 0.284.2 was subsequently published through GitHub Actions using the protected
npm OIDC workflow. Its source commit is
`4ef38c97e7ce9d79587987b7e86a59017c777666`, tag `v0.284.2`.

- [Publication run](https://github.com/LeMouf/konitif-core/actions/runs/34027347602)
- [Published version metadata](https://registry.npmjs.org/@konitif%2fcore/0.284.2)
- [Attestation](https://registry.npmjs.org/-/npm/v1/attestations/@konitif%2fcore@0.284.2)

Published archive integrity:
`sha512-OcvBwJXrSWiRPU+pDBmeGsUikyhFqk1f0OlCpVWJfYbRC8xWICJTBBHh3vkIf/xSfR5lt3YZT0UTq1NoIdMSNQ==`.

Do not republish either version or move its tag. Documentation and tooling changes
on main do not change already published artifacts. A future publication requires
a new version with manifest, lockfile and exported runtime version synchronized.

## Independent authorities

The [ecosystem registry](https://github.com/LeMouf/kontif/blob/main/ecosystem/README.md)
defines current membership. An ecosystem release is an optional evidence snapshot,
not a prerequisite for Core publication or inclusion. Inclusion and public
availability do not grant additional commercial rights. Those rights depend on
the applicable public licence or an explicit agreement.

This applies to all partnership types. Private nominative agreements and access
proofs do not belong in this repository. Technical attestations do not verify
ownership or licensing authority. This policy does not amend LICENSE.md.

## Publication contract

`publish.yml` runs only on tag pushes in `LeMouf/konitif-core` and when the
repository Actions variable `CORE_NPM_PUBLISH_ENABLED` is exactly `true`.
Use a repository variable, not an environment variable: the job condition is
evaluated before entering `npm-release`.

The job verifies that the tagged commit belongs to main history and that tag,
manifest, lockfile and compiled exported version agree. Only stable versions
are supported. Build and tests precede the offline package consumer check.
The exact verified archive is retained as `.release/core.tgz` when
`CORE_RELEASE_ARCHIVE=true`; only that archive is published, with public access,
provenance and lifecycle scripts disabled.

Only the publishing job receives `id-token: write`. Validation CI has read-only
permissions and does not publish. Checkout credentials are not persisted.
No manual-token fallback is encoded in the workflow.

The workflows select cached Node 24.20.0 and the publisher checks npm compatibility.
Missing cache or incompatible publishing tooling fails without downloading a
runtime fallback. Only the locked TypeScript 5.9.3 development dependency is
installed by CI. Checkout is pinned; the runner image remains rolling, not hermetic.

## Protection checklist

Before each release:

1. Require a PR and the GitHub Actions `validate` check on main, with an up-to-date
   branch; prevent deletion and non-fast-forward pushes.
2. Verify `npm-release` requires LeMouf approval, disallows administrator bypass
   and allows only tag pattern `v*`. Self-review remains allowed for a sole
   maintainer; this is manual approval, not independent second-person review.
3. Review tag creation, update and deletion protections separately. An environment
   tag allowlist does not protect Git tags from mutation.
4. Verify the npm trusted publisher: owner `LeMouf`, repository `konitif-core`,
   workflow `publish.yml`, environment `npm-release`, direct npm publish allowed.
5. Confirm the repository activation variable and the exact new version.
6. Merge the reviewed version PR and validate its main commit before separately
   authorizing a tag push. Approve the resulting protected deployment.
7. Verify npm version, archive integrity and provenance. After a partial failure,
   inspect the registry before retrying; never overwrite a published version.

Current settings must be checked on GitHub/npm; this document is not proof of
their continued configuration. Tag policy changes require separate approval.

## Local verification

With the locked development dependency already installed:

```sh
npm run build
npm test
npm run verify:package
```

The verifier uses offline npm packing and an external ESM/TypeScript consumer.
On Windows it invokes the installed npm CLI through Node instead of executing
the npm.cmd shim. It neither installs npm nor uses a shell fallback.

For an approved fresh setup, use `npm ci --ignore-scripts --no-audit --no-fund`.
Dependencies are not installed implicitly by the verifier.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) for provider
requirements. No tag or publication is authorized by this document alone.
