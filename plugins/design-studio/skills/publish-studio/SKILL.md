---
name: publish-studio
description: Publish an existing local Design Studio's static viewing site through ChatGPT Sites, including requested first-run publishing and updates to the same Site. Requires native Sites tools; local authoring remains in the owned studio folder.
---

This is an experimental publishing path. Keep the local repository as the authoring environment. Publish its production build; never expose the development server.

## Resolve the studio and host

1. Use the person's specified studio or current primary workspace. Read its `AGENTS.md`, working context, and publishing contract. Resolve its contributor before repository changes. Preserve existing work.
2. Publishing can be part of an explicitly requested create-and-publish onboarding flow. A local creation or edit request alone does not authorize publication. Reuse existing session authorization without asking again.
3. Discover native Sites capabilities and read the current Sites building and hosting skills. Those skills own source synchronization, credentials, packaging, and deployment. If unavailable, keep local setup working and report the missing publishing capability. Do not require a GitHub account or substitute another host without a request.
4. Inspect `.openai/hosting.json` before registration. Reuse its exact `project_id` when present. Check the selected Site's ownership and audience. For this Design Studio workflow, requested new publication defaults to a public viewing link for reviewers. State that audience in the publishing update. Respect an explicit private or restricted audience. When updating an existing Site, preserve its audience unless the person requests a change.

## Adapt the static build

Preserve the studio's pnpm commands, lockfile, and Vite architecture. Configure the existing build output in `.openai/hosting.json`:

```json
{
  "static": {
    "directory": "dist",
    "not_found_handling": "single-page-application"
  }
}
```

This fragment omits the project identity until native Sites registration supplies it. Preserve the registered `project_id`. Do not erase unrelated settings or convert an existing server-backed Site to static hosting without checking its capabilities.

Studio does not need a Worker, database, object storage, MCP server, or connector access for this viewing site. Do not add them. Use `/` as the build base for a Site hosted at its origin root. The SPA fallback supports direct prototype, system, and documentation URLs.

## Build and publish

1. Complete local setup and inspect the working preview first. Review the active content included by the production build.
2. Follow native Sites registration for a new project, persisting its exact identity in the local manifest. Sites registration starts private; for the requested public viewing link, set its audience to `public` with native access tools before deployment. Use the native save and general deployment path for public Sites, not the owner-private deployment or automatic private publish-on-push path. For later publications, use the existing project and current source-opening procedure, preserving its audience.
3. Run the Sites source workflow through the studio's pinned environment: `mise exec -- node <installed-sites-plugin>/scripts/site-workflow.mjs --project-id <exact-project-id>`. Include `['mise', 'exec', '--', 'pnpm', 'build']` among its ordered commands when a build is required. Newly packaged studios keep source, module, and type validation in this command; the full regression suite remains available through `pnpm test` or `pnpm build:release`. Run release checks for platform changes, not repeatedly during ordinary installation. Do not rebuild unchanged source, repeat completed checks, or republish a cosmetic test edit merely to complete onboarding. Start registration and access setup while local dependencies prepare, then collect their results before publication. The pinned runtime must cover source commits and Git hooks too.
4. Verify Git works in that environment. Do not accept an Xcode license or disable hooks to recover a PATH or runtime failure. Use an already installed supported Git executable when available.
5. Keep detailed output in a local log. Follow the Sites skill's credential handling: session memory and hidden stdin, never source files, shell arguments, or user-facing output.
6. Use the workflow's verified source SHA and matching static archive for native save and deployment. Keep existing Git remotes and work intact. Publishing sends source to the Sites-managed repository as well as uploading built assets; it does not require creating a GitHub repository.
7. Require terminal deployment success and return only its actual URL. An expected URL, saved version, or queued browser opening does not prove publication.

## Verify and hand off

Report the local folder, local preview, and published viewing link separately, stating its actual audience. A public viewing link lets anyone with the URL review the built content without granting source editing. Label bundled systems and prototypes as learning examples. The published site offers interaction with built prototypes; source, canvas, and configuration editing stay local.

For an onboarding experiment, test public access without cookies or service credentials, a direct prototype link and reload, and hosted interaction. Then make an authorized local change and republish to the same project and URL. Verify the update reached the deployment and the audience stayed public. For a requested private Site, report normal browser sign-in separately from authenticated service checks; service access does not prove viewer login.

If publishing fails, preserve local readiness, the project identity, saved versions, recoverable source commits, and the requested audience. Resume that Site instead of registering another. Never change access merely to recover a deployment or sign-in failure.

See the maintainer [experiment record](../../experiments/sites-onboarding.md) for verified results and remaining gaps.
