# Environment audit and installation location

After plugin activation, run this procedure before installing Studio. Direct-source setup uses the same helper and procedure. Plugin installation and Studio installation are separate stages.

## Audit the current environment

Read the host's execution context and inspect available Node, Git, and mise. When Node is available, run the read-only audit:

```sh
node <setup-tooling>/scripts/bootstrap.mjs preflight
```

It reports the execution OS, architecture, account home, hostname, username, home write-access check, and remote/container/WSL signals. It reports signal names rather than environment values. Inspect the result and the host's filesystem context; do not infer the person's computer OS from a desktop app or a GitHub connection.

If Node is missing, use the host's supported inspection tools to audit the OS, account home, execution location, and permissions. Install prerequisites through supported tools and official sources in the agreed environment, then run preflight before Studio creation. Do not ask the person to run terminal commands.

Determine what you can and explain what remains unknown. A writable home does not prove that files are on the person's physical computer. Remote, container, WSL, or Ubuntu indicators are facts to explain, not automatic reasons to reject installation. If the host cannot establish where files live, include that uncertainty in the location question. Ask a focused follow-up only if the response does not establish the intended destination.

## Recommend a folder and ask the user

Run read-only `choose` for an available name and absolute destination. It suggests a Developer folder under the observed home on macOS, or a Projects folder under the observed home on Windows and Linux. These are Studio's organizational suggestions, not guaranteed existing or system-provided folders. Prefer a person's supplied location or relevant workspace preference over the suggestion. Preserve occupied folders and use the first available numbered name for a new studio.

Summarize the relevant findings and show the exact absolute destination. For example: “Setup is running on macOS under your account. I suggest saving Design Studio and all its source files in **[actual path]**. Use this folder, or choose another?”

If remote execution is observed, say where files would be saved: “Setup is running on a Linux host through SSH. **[actual path]** would save your Studio on that host. Is that where you want it, or should we use another location?” Never describe remote files as saved on the person's laptop. An Ubuntu username alone does not prove remote execution.

Use a supported folder picker when available. Include any relevant permission limitation found by the audit. Work-managed computers may need an allowed folder or the host's normal permission flow. Do not assume administrative access or escalate permissions simply to retain the recommendation.

Wait for the person to confirm or modify the location before creating Studio. If the person already specified a destination after seeing this audit, that response supplies confirmation; do not ask again. A folder supplied before the audit should be shown with the findings for confirmation. If the environment cannot access the chosen location, explain that fact and help select the right session or another folder.

## Save and execute the confirmed plan

```sh
node <setup-tooling>/scripts/bootstrap.mjs plan --destination <confirmed-absolute-folder> --name <studio-name> --confirmation <actual-user-response> --output <absolute-plan-json>
node <setup-tooling>/scripts/bootstrap.mjs setup --plan <absolute-plan-json>
```

Record the person's actual response; never fabricate confirmation. The plan command requires the exact confirmed destination, validates its existing ancestor and write access, and preserves unrelated occupied folders. It creates only its JSON record, outside the studio; it does not create Studio or its parent folders. Keep this machine-specific file local and preserve its path in activation or restart handoffs.

Setup uses the plan's name and destination unchanged. It rechecks the observed OS, architecture, home, hostname, account, and signal names before download or creation. If they change, audit again and ask the person to confirm or modify the location. The record enforces consistent execution; it cannot authenticate a human response or prove physical filesystem ownership. Absolute local sources without plans are reserved for maintainer fixtures.

If the location is unavailable or permission is denied, preserve work and explain the actual failure. Ask for another folder or use the host's supported permission flow when appropriate. Do not silently switch destinations.

For interrupted first-run preparation, retain the known name and folder:

```sh
node <setup-tooling>/scripts/bootstrap.mjs prepare --destination <same-folder> --plan <absolute-plan-json>
```

If the plan is unavailable or the environment changed, audit again and save a new confirmed plan for the intended destination. Do not create a numbered replacement to recover. Existing prepared studios keep their open-studio workflow. Windows and Linux suggestions do not establish that the full native installation journey has been tested.
