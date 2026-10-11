#!/usr/bin/env bash
set -euo pipefail
: "${RUNNER_TOOL_CACHE:?GitHub runner tool cache required}"
: "${GITHUB_PATH:?GitHub PATH output file required}"
package_node_bin=''
while IFS= read -r candidate; do
  if test -x "${candidate}/node" && test -x "${candidate}/npm" \
    && [[ "$("${candidate}/node" --version)" == v24.* ]]; then
    package_node_bin="${candidate}"
    break
  fi
done < <(printf '%s\n' "${RUNNER_TOOL_CACHE}"/node/24.*/x64/bin | sort -Vr)

if test -z "${package_node_bin}"; then
  printf '%s\n' 'No usable Node 24 runtime with npm was found in the runner cache.' >&2
  printf '%s\n' 'Available cached Node versions:' >&2
  ls "${RUNNER_TOOL_CACHE}/node" >&2 || true
  exit 1
fi
export PATH="${package_node_bin}:${PATH}"
[[ "$("${package_node_bin}/node" --version)" == v24.* ]]
printf '%s\n' "${package_node_bin}" >> "${GITHUB_PATH}"
printf 'Selected Node %s with npm %s\n' "$("${package_node_bin}/node" --version)" "$("${package_node_bin}/npm" --version)"
"${package_node_bin}/node" --input-type=module -e "import {assertPublishingTools} from './scripts/release-contract.mjs'; assertPublishingTools(process.versions.node, process.argv[1]);" "$("${package_node_bin}/npm" --version)"
