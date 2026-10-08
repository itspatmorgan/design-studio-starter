# Local environment and destination

Use this procedure before installing prerequisites or copying/registering the plugin, and before creating a studio. It applies to plugin and direct-source setup.

## Establish where files will be saved

Read the host's execution context. A desktop editor can execute commands in a cloud VM, SSH session, container, or WSL. A preview, writable home directory, username, or OS does not prove that files are on the person's computer. Do not infer locality from missing remote indicators.

Use explicit host evidence that commands and file writes reach the person's native local filesystem. Record the evidence in plain language. The person's OS can come from that same host context or their statement. A GitHub repository connection does not establish local execution.

If the host does not establish this, ask one focused question: “Are you using a Mac, Windows, or Linux computer, and is this agent running locally on it?” Explain that this determines where their studio files will be saved. Do not repeat the question when the session already supplies the answer. Never invent confirmation.

For known remote execution, guide the person into a native local session using [Host handoff](host-handoff.md#establish-local-execution). Do not install the plugin or tools into the remote account as a substitute. This pilot does not create studios in containers, SSH hosts, or WSL; preserve any work already there.

Locate the setup helper in the downloaded tooling or installed plugin. If Node is available, run:

```sh
node <setup-tooling>/scripts/bootstrap.mjs preflight
```

The command is read-only and requires no Git or mise. It reports execution OS, architecture, account home, hostname, username, remote/container signals, and a suggested macOS parent. It always reports local access as **unverified**: observations do not authenticate the person's computer. It reports signal names, never environment values.

If Node is missing, first establish local execution through the host or person, then obtain Node through supported host tools and official sources. Run preflight before proceeding. Do not install missing tools in an unverified environment just to run preflight.

Resolve conflicts between the observed OS and the person's computer OS. For example, Linux execution with a person-confirmed Mac requires switching sessions. `/home/ubuntu` is a clue to investigate, not a forbidden username or proof of cloud execution.

## Select and save the plan

Honor an explicit folder. On macOS, suggest `~/Developer/design-studio`; use read-only `choose` to find the next available name and absolute destination. Explain that Developer is an ordinary folder in their home directory. On other OSes, state that the native journey is unverified and ask for an explicit local folder instead of applying a macOS convention.

When no folder was supplied, show the selected absolute destination and ask whether to use it or another folder. Use a supported native folder picker when available. This is a location choice, not a request to repeat authorization for installation. Do not ask again when the person already selected a destination. Wait for their answer before creation.

After the location is settled, run:

```sh
node <setup-tooling>/scripts/bootstrap.mjs plan --destination <absolute-folder> --name <studio-name> --expected-platform <darwin|linux|win32> --local-access <host|person> --evidence <plain-language-evidence> --output <absolute-plan-json>
```

Pass the actual confirmed computer OS as `--expected-platform`. Use `host` only for explicit local execution evidence from the host, or `person` for the person's actual confirmation. These fields record the basis for proceeding; they are not automatic proof of local access. Never choose the observed OS merely to satisfy a mismatch check.

Save the plan in the setup tooling's ordinary working folder, outside the studio. The output file is created exclusively; existing plans are not overwritten. It contains machine paths and evidence and should remain local. The command validates access to the nearest existing ancestor and refuses linked parents, plugin caches, internal folders, and unrelated occupied destinations. It does not create the studio or its parents.

The plan binds the display name and destination to the observed OS, architecture, home, hostname, account, and signal names. Creation and first-run preparation recheck these fields. Plans are coordination records, not a security boundary: a person or agent can edit their JSON or execute commands outside the helper.

## Execute and resume

```sh
node <setup-tooling>/scripts/bootstrap.mjs setup --plan <absolute-plan-json>
```

Use `--plan` alone. Do not add a different name or destination. The helper verifies the plan before download or directory creation, then prepares that same studio. The normal `create` entry point also requires the plan. Absolute local `--source` paths are reserved for maintainer fixtures, never a fallback for agent setup.

If creation finished but preparation was interrupted:

```sh
node <setup-tooling>/scripts/bootstrap.mjs prepare --destination <same-absolute-folder> --plan <absolute-plan-json>
```

If the environment changed or the plan is unavailable, recheck local access and generate a fresh plan for the known folder and existing display name. Do not select a numbered replacement or copy old machine facts into the new plan. Changed studio settings still require review before first-run defaults are applied.

After readiness, use the verified studio path for preview and workspace handoff. An open browser page cannot establish where the source lives. Existing prepared studios remain usable through open-studio without a new installation plan.
