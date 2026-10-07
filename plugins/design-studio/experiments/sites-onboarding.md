# Local onboarding through ChatGPT Sites publication

Experiment date: October 6, 2026 (Pacific). Branch: `codex/sites-onboarding-experiment`.

## Outcome

The local Studio can publish its existing static build through Sites without a hosted editing backend. Two private publications succeeded at the same project and URL. Authenticated HTTP checks confirmed direct routes and the updated production assets. Normal viewer sign-in remains unverified after an in-app browser authentication error.

The person had already verified plugin installation and local setup. This experiment exercised the repository's plugin helper and native Sites tools. It did not install a new plugin version or start an independent agent session from the directory listing.

## Test environment

- macOS with Git, mise, Node, and pnpm already installed; this was not a clean computer.
- Plugin starter pin: `b6fc5d9c790671da5a27810a08ff9e05de700474`.
- Local studio: `/Users/itspatmorgan/Developer/Design Studio Sites Experiment`.
- Fresh installer verification: `/Users/itspatmorgan/Developer/Design Studio Sites Installer Check`.
- Site project: `appgprj_6ac5d76da7848191ab5ce8c6e5dc9144`.
- Viewing URL: https://design-studio-onboarding-experiment.itspatmorgan.chatgpt.site
- Sites access confirmed owner-private: custom audience, one owner, no additional viewers or editors.

Both local folders retain their source. The published Site remains private. No database, object storage, Worker, MCP capability, or connector access was added.

## Verified sequence

| Step | Evidence |
| --- | --- |
| Create local Studio | Normal plugin helper downloaded the public pin and created an independent Git repository in a visible folder. |
| Prepare and launch | Recovered the packaging issue below; dependencies and personal configuration completed. Loopback preview returned HTTP 200 and rendered Studio's Welcome and prototype navigation. |
| Verify corrected installer | A second fresh create-and-prepare run succeeded without manual recovery after preserving the legacy registry. |
| Build version 1 | All 225 included tests passed, followed by type checking and Vite. A chunk-size warning remained non-blocking. |
| Publish version 1 | Native private deployment succeeded from source SHA `48bde62cd548412c7e5f31ef33feb04f96e77753`. |
| Change locally | Managed Studio configuration changed the tagline to `Local creation. Private publishing. Same Studio.` |
| Build version 2 | All 225 included tests passed again, followed by type checking and Vite. |
| Publish version 2 | Native private deployment succeeded from source SHA `aca6f9046ecaba314e5882abbc17fb54adc17bdf`, with the same project and URL. |
| Verify deployed routes | Supported Sites service access returned HTTP 200 and the matching SPA entrypoint for `/`, `/prototypes/patrick/feedback-inbox/app/feedback-inbox`, and `/systems/product`. |
| Verify deployed update | The entry JavaScript and configuration module matched the second local build byte-for-byte. The configuration module contained the updated tagline. |
| Verify static interaction | Local production preview rendered the Feedback Inbox direct URL. Selecting New filtered rows; reloading the direct URL rendered successfully. Editing controls were absent from the production navigation. |
| Normal viewer login | Private Site showed the ChatGPT login gate. Account selection returned `400 Invalid content type: text/html; charset=UTF-8`. Retry reached OpenAI security verification. No challenge was solved and sharing was not weakened. |

Service access verifies the deployment and routes. It does not prove a browser visitor can sign in. Local production inspection verifies static rendering and interaction; it is not a rendered hosted-browser result.

## Required static configuration

```json
{
  "project_id": "<native Sites project ID>",
  "static": {
    "directory": "dist",
    "not_found_handling": "single-page-application"
  }
}
```

The normal `pnpm build` is sufficient. Sites packages `dist/` and serves browser-history routes through the SPA fallback. The complete local source is also pushed to the Sites-managed source repository. The workflow used its supplied destination without replacing local Git remotes or requiring a GitHub account.

## Issues found and recovered

### Legacy contributor registry was omitted

The working-studio package allowed per-contributor files but omitted the pinned starter's `contributors.json`. Its configuration still declared Admin `patrick`, and one CI test required the registry. Preparation failed with an unregistered Admin; the first build attempt failed with a missing registry path.

The initial test was recovered by registering the confirmed contributor, then restoring the original pinned registry for build compatibility. The recovery profile was retained outside the repository to avoid duplicate registration. The branch fixes the package allowlist and verifies both legacy and per-contributor files survive packaging. A fresh installer run then completed without recovery.

### Publishing needs the pinned environment throughout

The standalone Sites workflow initially selected a system Git executable blocked by an unaccepted Xcode license. Selecting the already installed Homebrew Git resolved that without changing system settings. A later source commit used Node 23 and failed to load TypeScript from a Git hook. Running the entire Sites workflow through `mise exec -- node` resolved the hook error with the pinned runtime. The successful build was reused because its source inputs had not changed.

### Viewer sign-in needs a separate test

The native deployment and authenticated route checks succeeded, but the in-app browser login flow did not. Verify the private URL in the person's normal browser before declaring the viewing experience seamless. Do not use service credentials as browser login or publish publicly to bypass the issue.

## Integration on this branch

- Added the experimental [publish-studio skill](../skills/publish-studio/SKILL.md).
- Routed explicitly requested create-and-publish onboarding and later publishing to that procedure.
- Kept ordinary local creation and editing local.
- Preserved the current package version and public starter pin.
- Updated the plugin README and human Guide to distinguish local authoring from private static viewing.

The next native onboarding test should use the installed branch package, request local creation plus private Sites publishing in one prompt, and complete viewer login in a normal browser. A later chat should publish an authorized local edit to the existing Site. Clean-computer setup, broader sharing, and other hosts' publishing remain separate tests.

## Local evidence logs

Branch verification passed: `pnpm build` (268 project tests, type checking, and Vite), all 15 plugin tests, `pnpm harness:check`, and `git diff --check`. Skill synchronization made no generated changes. The updated Guide rendered its publishing section in the branch's production preview. Vite reported its existing non-blocking large-chunk warning.

These logs are machine-local, contain no stored publishing credentials, and are not committed:

- `/tmp/design-studio-sites-setup.log`: initial preparation failure.
- `/tmp/design-studio-sites-setup-retry.log`: initial local recovery.
- `/tmp/design-studio-sites-fresh-install.log`: corrected fresh installation.
- `/tmp/design-studio-sites-publish-1.log`: successful first build and recovered hook failure.
- `/tmp/design-studio-sites-publish-1-finish.log`: source push and first deployment archive provenance.
- `/tmp/design-studio-sites-publish-2.log`: second build, source push, and archive provenance.
- `/tmp/design-studio-sites-route-check.log`: deployed route and exact JavaScript checks.
- `/tmp/design-studio-sites-package-tests.log`: packaging regression checks.
- `/tmp/design-studio-sites-branch-build.log`: complete experiment-branch verification.
- `/tmp/design-studio-sites-plugin-tests.log`: complete plugin test suite.
- `/tmp/design-studio-sites-harness-check.log`: generated-entry consistency.

Native Sites responses supplied terminal success, version identity, audience, and URL. Credentials stayed in session memory and hidden stdin. Temporary archives are `/tmp/design-studio-sites-v1.tar.gz` and `/tmp/design-studio-sites-v2.tar.gz`.
