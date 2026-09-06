#!/usr/bin/env bash
set -euo pipefail

# Already cached in the reviewed ubuntu-24.04 image; never download a fallback.
: "${RUNNER_TOOL_CACHE:?GitHub runner tool cache required}"
: "${GITHUB_PATH:?GitHub PATH output file required}"
core_node_version=24.20.0
core_node_bin="${RUNNER_TOOL_CACHE}/node/${core_node_version}/x64/bin"
test -x "${core_node_bin}/node"
test -x "${core_node_bin}/npm"
export PATH="${core_node_bin}:${PATH}"
test "$(node --version)" = "v${core_node_version}"
node --version
npm --version
node --input-type=module -e "import {execFileSync} from 'node:child_process'; import {assertPublishingTools} from './scripts/release-contract.mjs'; assertPublishingTools(process.versions.node, execFileSync('npm',['--version'],{encoding:'utf8'}).trim());"
printf '%s\n' "${core_node_bin}" >> "${GITHUB_PATH}"
