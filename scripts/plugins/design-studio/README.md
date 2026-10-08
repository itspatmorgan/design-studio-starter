# Maintain the Design Studio plugin

The installable package is [plugins/design-studio](../../../plugins/design-studio/README.md). This directory contains repository-only tools and tests. Runtime code and skills must resolve inside the installable package. New Studios omit this directory and the plugin distribution package.

## Identity and generation

Edit the canonical [plugin manifest](../../../plugins/design-studio/plugin.json). Run `pnpm harness:sync` to generate Codex, Claude, and Cursor manifests and repository marketplace catalogs. Generated manifests remain in the deliverable because the hosts load them. Repository catalogs register that package; they do not belong in a created Studio.

[sync-manifests.mjs](sync-manifests.mjs) owns generation. [check-package.mjs](check-package.mjs) declares the delivery inventory and checks runtime imports, supporting file references, skill links, and manifest assets. It rejects unexpected files, directories, symlinks, and dependencies outside the package. Both `pnpm harness:sync` and `pnpm harness:check` enforce this boundary. The starter README is an output template: its links target the created Studio, so starter-package tests verify that those targets exist and are retained.

## Verify changes

Run commands from the repository root:

```sh
pnpm harness:check
node --test scripts/plugins/design-studio/tests/*.test.mjs
pnpm build
```

`pnpm test:release` includes these distribution tests. Ordinary `pnpm test` excludes them. Changed-file selection includes distribution tests when plugin delivery or maintenance changes. Update the package inventory deliberately when adding a runtime file; keep its references within the package.

Tests cover manifests, package boundaries, environment audit and confirmed installation plans, resumable setup, work preservation, working toolchains, starter contents, and benchmark accounting. Starter packaging must exclude `scripts/plugins/` as well as distribution catalogs and evaluation records.

## Validate a host journey

Use an isolated profile or disposable test environment. Read the version from the canonical manifest and the starter revision from [bootstrap.mjs](../../../plugins/design-studio/scripts/bootstrap.mjs). Record both with the host version and actual results outside the deliverable. Plugin version alone does not identify downloaded Studio code.

1. Follow [SETUP.md](../../../SETUP.md) for the selected host. For an existing installation, follow its plugin update procedure and preserve unrelated plugins and custom files.
2. Confirm the installed version and skill discovery in a fresh host session. CLI registration and schema validation do not prove desktop activation.
3. Ask the agent to create Studio. Verify it audits the environment, explains where files live, obtains folder confirmation, creates complete source there, and opens the preview.
4. Continue in the confirmed folder. Verify contributor registration and repository skill discovery, then request and inspect a small prototype.
5. Reopen after restarting. Confirm the same prototype and configuration remain. Check interrupted setup, occupied destinations and ports, missing tools, and restricted filesystem access in disposable fixtures.
6. For plugin updates or removal, verify the Studio's path and work remain intact and usable. Test clean-computer prerequisites separately from a host with installed dependencies.
7. When testing requested publishing, verify the actual audience, direct prototype links, reloads, and hosted interactions. In a later session, request an authorized edit and republish to the same Site. Check recovery preserves local work, Site identity, and audience.

For Claude schema checks, use its installed command help and `claude plugin validate --strict` on the package and marketplace. For Cursor and Codex, verify native discovery and activation through their supported controls. Respect organization permissions.

Keep release readiness and dated results in the pull request or release record. Do not put them in setup instructions or operational skills. Use [benchmarks](benchmarks/README.md) only when evaluating the user's wait.
