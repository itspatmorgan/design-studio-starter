# Setup speed measurements

Measured October 7, 2026 on the existing macOS setup. The person reported the installed-plugin creation and public publication journey took slightly under six minutes and succeeded.

## Candidate changes

Experiment .14 preserves the public starter pin b6fc5d9c790671da5a27810a08ff9e05de700474. The helper chooses design-studio, design-studio-2, and subsequent kebab-case folders while keeping readable display names. Custom names use the same conversion; exact supplied destinations and existing folders are preserved. Bootstrap subprocess durations are written to stderr so stdout remains machine-readable JSON.

The working-studio packager removes only the standalone pnpm test step from the ordinary build and preserves the complete original command as build:release. Source/module checks, type checking, Vite compilation, tests, dependencies, lockfile, and Git hooks remain available. The maintainer repository's build is unchanged and still runs the complete release suite. Platform changes should receive regression checks; installing an already-tested starter should not repeat the release suite.

The plugin procedures now direct the agent to reuse a verified setup checkout, batch prerequisite reads, overlap registration with preparation, use the pinned environment and working Git throughout, and avoid repeating builds or publishing a cosmetic test edit during routine onboarding.

## Measurements

A fresh disposable studio was packaged from the exact pinned commit using a local source fixture. It had no node_modules. Installed tools and the machine-wide pnpm dependency store were reused.

| Stage | Seconds |
| --- | ---: |
| Create pinned local source and Git baseline | 0.79 |
| Install from warm dependency store and prepare | 5.69 |
| Working-studio checks, type checking, and production build | 12.77 |
| Total measured commands | 19.25 |

These measurements exclude network source download, missing-tool installation, agent reasoning, tool/approval round trips, preview QA, registration, upload, and deployment. They do not establish cold-computer or end-to-end times. The previous native journey's production build ran 225 tests in 25.54 seconds; its nested setup fixture took 25.15 seconds. The current maintainer suite passed 270 tests in 29.18 seconds, including a 28.46-second nested setup test. Removing that repeat release suite is a measured opportunity of approximately 25–30 seconds per unchanged starter publication, not a guaranteed end-to-end saving.

## Priorities for the next timed native journey

1. Measure request-to-first-preview and request-to-public-link separately. Target a useful local preview within 30 seconds and a public link within 90 seconds on a prepared computer; these are targets to validate, not promises.
2. Minimize serial agent turns: one setup/preflight read, one destination selection, creation/preparation, one preview check, and one publishing sequence. Register Sites while dependencies prepare and reuse the registration credential. Do not recheck already-proven states.
3. Add a combined create-and-prepare helper command with explicit destination, preservation rules, and one summary receipt if tool round-trip timings prove material.
4. Measure source/module checks, type checking, Vite compilation, source push, archive upload, and deployment individually. Consider concurrent type checking and Vite after source validation only if profiles show meaningful benefit; retain both failures as publication gates.
5. Test a clean tool/dependency cache before claiming first-run speed. This machine's installed dependencies occupy about 813 MB. A warm-cache result cannot predict first-time download speed. Evaluate a smaller dependency footprint or versioned release bundle only after measuring that cold path.
6. Avoid a second build when its exact input state has not changed. Native public save and deploy currently require separate operations; backend latency needs separate measurement and cannot be removed by switching to private publishing.

## Validation and cleanup

All 17 plugin tests passed. The full maintainer build passed all 270 tests, type checking, and Vite. The generated pinned studio's ordinary build passed with the full regression command separately available. The usual Vite large-chunk warning remains. The benchmark studio was removed after measurement.

The four disposable folders Design Studio, Design Studio Public Onboarding QA, Design Studio Sites Experiment, and Design Studio Sites Installer Check were moved to Trash, preserving their contents. The person elected to delete the three hosted test sites themselves; no hosted deletion is claimed. Historical experiment URLs and folder paths are evidence of past runs, not current workspace recommendations.

## Tagline follow-up

Experiment .15 removes the installer’s explicit marketing tagline and advances the source pin to the verified public commit 599da74eee43aba5e1c4a97abad8dc87140f3989. A fresh disposable create-and-prepare fixture confirmed the inherited tagline is “A prototype sandbox for you and your team”, with Personal mode and the readable Design Studio name preserved. The full maintainer build passed again. The experiment .14 timing table above remains historical measurement of the earlier pin and should not be presented as a benchmark of experiment .15.
