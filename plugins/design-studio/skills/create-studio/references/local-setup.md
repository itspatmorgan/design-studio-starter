# Environment audit and installation location

This is the shared procedure for Studio installation after plugin activation, or from direct-source tooling. Keep setup tooling separate from the owned studio.

## Audit and confirm

Run the read-only helper, adding `--destination` for a supplied folder or `--name` for a supplied name:

```sh
node <setup-tooling>/scripts/bootstrap.mjs audit
```

It returns environment observations, an available name and folder recommendation, and destination checks. macOS suggests Developer under the observed home; Windows/Linux suggest Projects. These are organizational suggestions, not guaranteed existing folders. Inspect the host's execution context and available Node, Git, and mise too.

If Node is missing, use supported host inspection tools first. Handle missing prerequisites through official sources and supported host tools in the agreed environment. The person should not need terminal commands.

Share the relevant findings and exact destination, then ask the person to confirm or change it. For example: “Setup is running on macOS under your account. I suggest saving Studio and its source files in **[actual path]**. Use this folder, or choose another?”

Explain uncertainty about where files live. Remote/container/WSL signals require explanation rather than automatic rejection. Never describe remote files as saved on the person's laptop. A supplied folder is shown with the audit findings; a response after seeing those findings supplies confirmation.

Wait for the response. Use a supported folder picker when available. If the destination is unavailable, explain the reported failure and help choose an accessible folder or the appropriate session. Respect managed-computer permissions; do not assume administrative access or silently change destinations.

## Install

Use the exact confirmed folder and name. Record the actual response; never fabricate confirmation:

```sh
node <setup-tooling>/scripts/bootstrap.mjs plan --destination <confirmed-folder> --name <studio-name> --confirmation <actual-user-response>
node <setup-tooling>/scripts/bootstrap.mjs setup --plan <returned-planFile>
```

The helper saves the plan outside Studio and returns its path. `--output` is available when a durable plan location is needed. Keep the machine-specific record local and its path in continuation handoffs. It binds the confirmed destination to the observed environment, but cannot authenticate the response or prove physical filesystem ownership.

Setup downloads the pinned starter, creates its local Git baseline without a remote, and prepares the pinned tools and dependencies. Use the helper for tool selection rather than replacing PATH. Save verbose output in a local log and report concise progress: Getting your studio, Preparing your studio, Opening your studio.

Preserve existing work. Never create Studio in a plugin cache, worktree, or temporary directory. Absolute local source overrides are for maintainer fixtures only.

## Resume or recover

Retain the known folder and name after interruption. For unfinished preparation:

```sh
node <setup-tooling>/scripts/bootstrap.mjs prepare --destination <same-folder> --plan <returned-planFile>
```

If the environment changes or the plan is unavailable, audit again and obtain confirmation for a replacement plan. If settings changed during setup, review them before applying first-run defaults. Resolve the actual failure; do not delete work or create a numbered replacement to retry.

Existing studios without a plugin receipt use open-studio. Existing prepared studios keep their open workflow. Cross-platform recommendations do not establish verified Windows/Linux native installation support.
