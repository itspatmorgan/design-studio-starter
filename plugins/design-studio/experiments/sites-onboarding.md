# Local onboarding through ChatGPT Sites publication

Experiment date: October 6, 2026 (Pacific). Branch: `codex/sites-onboarding-experiment`.

## Outcome

The local Studio can publish its existing static build through Sites without a hosted editing backend. Two publications succeeded at the same project and URL. They initially used private access. At the person's request, the existing Site was then made public for sharing with reviewers. Anonymous HTTP checks confirmed direct routes and production assets without authentication. The hosted Feedback Inbox rendered and its New filter worked in the browser.

The person had already verified plugin installation and local setup. The deployment experiment exercised the repository's plugin helper and native Sites tools. A later preparation step installed experiment .13 through the supported local CLI. A fresh desktop chat using that installation remains unverified.

## Test environment

- macOS with Git, mise, Node, and pnpm already installed; this was not a clean computer.
- Plugin starter pin: `b6fc5d9c790671da5a27810a08ff9e05de700474`.
- Local studio: `/Users/itspatmorgan/Developer/Design Studio Sites Experiment`.
- Fresh installer verification: `/Users/itspatmorgan/Developer/Design Studio Sites Installer Check`.
- Site project: `appgprj_6ac5d76da7848191ab5ce8c6e5dc9144`.
- Viewing URL: https://design-studio-onboarding-experiment.itspatmorgan.chatgpt.site
- Initial access was owner-private. The public follow-up changed only the audience to `public`; native access revision 3 confirmed the change. Site version 2 and its URL were retained.

Both local folders retain their source. The published Site is public. No database, object storage, Worker, MCP capability, or connector access was added.

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
| Public viewing follow-up | The person requested public sharing as the onboarding default. Native access update and read-back confirmed `public`, retaining version 2 and the same URL. |
| Anonymous access | Requests without cookies or service credentials returned HTTP 200 without redirects for `/`, the Feedback Inbox direct URL, `/systems/product`, and both checked production JavaScript assets. |
| Hosted interaction | The public Feedback Inbox rendered. Selecting New reduced eight rows to three new items. Reloading its direct URL rendered successfully. |

The initial service checks did not prove viewer login. The public follow-up verifies anonymous HTTP access and hosted rendering and interaction. Private viewer sign-in remains unverified; it is no longer required for the intended public review workflow. The version 2 home-page tagline still contains `Private publishing` from the earlier update test; this historical test string does not describe the current audience.

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

### Private viewer sign-in needs a separate test

The initial native deployment and authenticated route checks succeeded, but the private in-app browser login flow did not. A future private-audience test should verify normal browser sign-in. The subsequent public change fulfilled the person's explicit review-link requirement; it was not a workaround for this login failure.

## Integration on this branch

- Added the experimental [publish-studio skill](../skills/publish-studio/SKILL.md).
- Routed explicitly requested create-and-publish onboarding and later publishing to that procedure.
- Kept ordinary local creation and editing local.
- Preserved the current package version and public starter pin.
- Updated the plugin README and human Manual to distinguish local authoring from public static viewing.
- New requested publication defaults to public; explicit restrictions and existing Site audiences are preserved. Public Sites use the general deployment path rather than private deployment or automatic private publish-on-push.

Next steps, in order:

1. Start a fresh desktop chat with the installed experiment .13 candidate, restarting the app if needed. Request local creation plus public Sites publishing in one prompt. Verify the agent chooses the public audience and general deployment path. This experiment has changed an existing deployment's audience; it has not yet proved a fresh installed-plugin public deployment.
2. In a later chat, make an authorized local edit and republish to the same Site. Verify the same URL, changed content, and continued anonymous access.
3. Release the tested plugin changes with a new package version after those checks. Preserve a public, tested starter pin and distinguish repository installation from directory review.

Clean-computer prerequisite setup and publishing from other agent hosts remain separate tests.

## Installed test candidate

Experiment .13 adds the public publishing capability and combined onboarding prompt to the plugin interface. Generated Codex, Claude, and Cursor manifests share that version. The starter pin remains unchanged. The package check now verifies publish-studio is present in each host's skill directory.

The existing local marketplace was refreshed and `codex plugin add` installed experiment .13. Read-back confirmed it enabled at `/Users/itspatmorgan/.codex/plugins/cache/design-studio-experiment/design-studio/0.1.0-experiment.13`. Its installed publish-studio skill matched the branch copy byte-for-byte. These checks prove installation, not desktop activation or a successful fresh-chat journey. See [the candidate handoff](../HANDOFF.md#test-the-sites-candidate) for the two test prompts and preservation checks.

Publishing stays plugin-owned; no publishing procedure is being moved into the starter. At the candidate installation step, the changes had not been merged or pushed. Beta merge readiness does not imply the pending fresh-chat and recovery tests have passed.

## Local evidence logs

Branch verification passed: `pnpm build` (268 project tests, type checking, and Vite), all 15 plugin tests, `pnpm harness:check`, and `git diff --check`. Skill synchronization made no generated changes. The updated Manual rendered its publishing section in the branch's production preview. Vite reported its existing non-blocking large-chunk warning.

Public-default follow-up verification passed: `pnpm build` (268 project tests, type checking, and Vite), `pnpm harness:check`, and `git diff --check`. Skill synchronization again made no generated changes. The same non-blocking chunk warning remains.

Candidate verification passed: all 15 plugin tests, `pnpm build` (268 project tests, type checking, and Vite), `pnpm harness:check`, and `git diff --check`. Generated manifests synchronized successfully. The same non-blocking chunk warning remains.

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
- `/tmp/design-studio-sites-public-check.log`: anonymous public routes and JavaScript assets.
- `/tmp/design-studio-sites-public-build.log`: public-default branch build.
- `/tmp/design-studio-sites-public-harness.log`: public-default harness consistency.
- `/tmp/design-studio-sites-candidate-tests.log`: candidate plugin tests.
- `/tmp/design-studio-sites-candidate-build.log`: candidate build.
- `/tmp/design-studio-sites-candidate-harness.log`: candidate generated consistency.
- `/tmp/design-studio-sites-candidate-install.log`: supported CLI installation receipt.

Native Sites responses supplied terminal success, version identity, audience, and URL. Credentials stayed in session memory and hidden stdin. Temporary archives are `/tmp/design-studio-sites-v1.tar.gz` and `/tmp/design-studio-sites-v2.tar.gz`.
