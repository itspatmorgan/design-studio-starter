# Publish your Design Studio

Publish when you want a viewing link to share. Start from your existing Studio folder in Codex, Claude Code, Cursor, or another local coding agent. If you have not created your Studio, follow [SETUP.md](https://github.com/itspatmorgan/design-studio-starter/blob/main/SETUP.md) first.

Your agent handles configuration, builds, and uploads. You create the hosting account and complete any sign-in or authorization. Interactive prototypes work on the published site; authoring stays local. Local changes appear online after another deployment.

## Choose a service

| Service | Choose it when | Account and setup |
| --- | --- | --- |
| [ChatGPT Sites](#chatgpt-sites) | Your agent has Sites capabilities and you want conversational publishing. | A ChatGPT account with Sites available; no GitHub account needed. |
| [GitHub Pages](#github-pages) | You want source stored in GitHub and publication on push. | A GitHub account, a repository, and GitHub CLI authorization. |
| [Netlify](#netlify) | You want a short command-line path from local build to viewing link. | A Netlify account and CLI authorization; no Git repository connection needed. |
| [Vercel](#vercel) | You prefer Vercel and want to upload your local build. | A Vercel account and CLI authorization; no Git repository connection needed. |

If you have no preference, Netlify is a simple standalone starting point. Choose ChatGPT Sites when those capabilities are already available. Provider plans, usage limits, and access controls vary; your agent should check the current options for your intended audience.

Copy this prompt in your Studio folder:

> Read DEPLOY.md and help me publish this Design Studio. Help me choose between ChatGPT Sites, GitHub Pages, Netlify, and Vercel. Handle the technical steps and guide me through account creation or authentication. Preserve my work and existing deployment settings. Publish for the audience we choose, verify a direct prototype link, and give me the viewing URL and instructions for updating it.

If you already know the provider, replace the choice sentence with “Use Netlify,” or the service you prefer. For public sharing, say “Publish a public viewing link.” For limited sharing, describe who should have access.

## For the agent

This guide supplies provider setup paths. The [publishing contract](src/platform/context/publishing.md) owns Studio's build, routing, caching, content review, and verification requirements. Read it and the repository's `AGENTS.md` before changes. A request to read or draft deployment instructions does not request publication.

1. Resolve the existing Studio and contributor. Preserve work, Git remotes, and provider identities. Inspect existing configuration before registering anything.
2. Establish the provider, account or team, and audience. Reuse explicit choices and authorization. Guide the person through browser authentication when required; keep passwords and tokens out of chat and repository files.
3. Use the tools pinned in `mise.toml` and `package.json`. Currently these are Node 24 and pnpm 12. If setup already prepared them, reuse that environment. Run commands from the Studio root; use `mise exec --` when needed.
4. Review the content that will be published. Build with `pnpm install --frozen-lockfile` when dependencies need preparation, then `pnpm build`. Run `pnpm build:inspect` and preview the output. Reuse a completed build while its inputs remain unchanged.
5. Configure the selected provider for static output and the publishing contract's routing and caching requirements. Use current CLI help and official documentation; adapt examples to existing configuration.
6. Deploy, wait for success, and follow [Verify and update](#verify-and-update). If blocked, preserve the local Studio and deployment identity, and explain the next required step.

The commands below are examples for the agent. Replace uppercase placeholders with resolved values before execution. Install provider CLIs through supported host mechanisms; a global pnpm install is one option. Do not change Studio dependencies merely to install a deployment CLI.

## ChatGPT Sites

### What you do

Sign in to ChatGPT with Sites available. Use a local agent environment that exposes the native Sites tools. Sites availability depends on the account and workspace. Public sharing may require workspace admin enablement. There is no standalone Sites management interface in Codex CLI; installing Design Studio alone does not provide Sites capabilities.

> Read DEPLOY.md and publish my existing Design Studio through ChatGPT Sites as a public viewing link. Keep authoring local and reuse any existing Site. Guide me through missing capabilities or account steps, then give me the verified link.

### What the agent does

1. Discover Sites capabilities and read the current Sites building and hosting skills. Use the Design Studio [publish-studio procedure](https://github.com/itspatmorgan/design-studio-starter/blob/main/plugins/design-studio/skills/publish-studio/SKILL.md) from the installed plugin or source tooling. Packaged Studios omit plugin tooling; obtain it separately when needed.
2. Inspect `.openai/hosting.json`. Reuse its exact `project_id`, or register a new Site through native tools. Save the returned identity without replacing unrelated configuration.
3. Configure static hosting with this fragment:

   ```json
   {
     "static": {
       "directory": "dist",
       "not_found_handling": "single-page-application"
     }
   }
   ```

4. Use `/` as the build base. Follow the Sites source workflow to synchronize source, build, and package the static output. This sends source to a Sites-managed repository as well as uploading assets. It does not require a GitHub repository.
5. Set the requested audience through native access tools. New Sites start restricted. For a public viewing link, save a version and use the general deployment path. For an owner-private Site, use the private path required by the Sites skill.
6. Wait for successful deployment and return the URL from the native result. Verify the intended visitor experience and direct links.

For updates, use the same Site identity and preserve its audience. Ask “Publish my latest Studio changes to the same ChatGPT Site.”

Reference: [Official Sites documentation](https://learn.chatgpt.com/docs/sites).

## GitHub Pages

### What you do

Create a GitHub account and authorize GitHub CLI when the agent opens the browser flow. GitHub Free supports Pages from public repositories. An eligible paid plan can publish from a private repository; repository privacy alone does not restrict visitors to the site.

> Read DEPLOY.md and help me publish my Design Studio with GitHub Pages. Guide me through authentication and choosing a repository. Configure publication on push, preserve any existing remotes, and give me the verified viewing link.

### What the agent does

1. Install GitHub CLI if missing, then authenticate and check the account:

   ```sh
   gh auth login --web --git-protocol https --scopes workflow
   gh auth status
   ```

2. Inspect local commits and remotes. Reuse the intended repository or create one with the chosen visibility. A new public repository can use:

   ```sh
   gh repo create OWNER/REPOSITORY --public --source=. --remote=studio
   ```

   Choose an unused remote name and preserve existing remotes. Review committed history before uploading it. Obtain an explicit visibility choice before making source public. A publishing request to a selected GitHub repository covers the necessary source push.

3. Enable Pages using GitHub Actions. For a new Pages site:

   ```sh
   gh api --method POST repos/OWNER/REPOSITORY/pages -f build_type=workflow
   ```

   If Pages already exists, inspect it and use the update endpoint with `--method PUT` when a source change is needed. Repository administration or Pages-management permission is required. Organization policy may require an administrator's help.

4. Configure a deployment workflow. Source clones contain `.github/workflows/checks.yml`; its upstream-only publishing conditions must be adapted to the destination repository. Preserve its validation requirements. Packaged Studios omit `.github/`; create a workflow if none exists.

   The workflow must check out source, prepare the pinned tools, install dependencies, run `actions/configure-pages`, build, upload `dist/` with `actions/upload-pages-artifact`, and deploy with `actions/deploy-pages`. Use compatible current action versions. Pass the configure step's `base_path` output as `STUDIO_BASE_PATH` to `pnpm build`. Deployment needs `pages: write`, `id-token: write`, a `github-pages` environment, and serialization through a deployment concurrency group. Preserve the team's required checks before deploying.

5. Commit the deployment configuration and push to the configured publishing branch. Watch that workflow to completion, for example:

   ```sh
   git push studio PUBLISHING_BRANCH
   gh run list --repo OWNER/REPOSITORY --limit 5
   gh run watch RUN_ID --repo OWNER/REPOSITORY --exit-status
   gh api repos/OWNER/REPOSITORY/pages --jq '.html_url'
   ```

   Select the run for the pushed commit. Replace the remote and branch examples with the actual destination. The Pages URL may inherit an account custom domain; return the resolved URL.

6. Test a direct prototype URL and reload it. Studio generates `404.html` for Pages; the app can load while the HTTP status remains 404. Explain this limitation. Do not change Studio routing to hash URLs unless requested.

For updates, commit and push to the publishing branch, then verify the deployment. Review which local changes belong in each commit; do not stage unrelated work.

References: [CLI authentication](https://cli.github.com/manual/gh_auth_login), [repository creation](https://cli.github.com/manual/gh_repo_create), [Pages API](https://docs.github.com/en/rest/pages/pages), [custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Netlify

### What you do

Create a Netlify account and authorize the CLI in the browser. A GitHub account and Git integration are optional.

> Read DEPLOY.md and publish my Design Studio on Netlify as a public viewing link. Build locally and upload the static output. Guide me through authentication, reuse any existing project, and verify direct prototype links.

### What the agent does

1. Install and authenticate the CLI when needed:

   ```sh
   pnpm add --global netlify-cli
   netlify login
   netlify status
   ```

2. Inspect `.netlify/state.json` and existing provider configuration. Reuse the linked project. If creating a project, choose its account or team and a unique name:

   ```sh
   netlify sites:create --name UNIQUE-STUDIO-NAME
   ```

   This creates a project without Git integration and links the local folder. Keep `.netlify/` out of Git.

3. Create or merge `netlify.toml` with `[build] publish = "dist"`. Configure status-200 rewrites for Studio application routes. Serve existing files normally. Put missing-asset handling before application fallbacks, including `assets/*`, `prototypes/manifest.json`, and `prototypes/artifacts/*`. Inspect the current router and public-file inventory for other asset namespaces and enabled module routes. Avoid an unrestricted catch-all that returns HTML for missing JavaScript or data.
4. Configure cache headers according to the publishing contract. Keep rules in `netlify.toml`, or use `public/_redirects` and `public/_headers`, which Vite copies into `dist/`. Preserve existing rules.
5. Build at `/` and upload the output:

   ```sh
   pnpm build
   pnpm build:inspect
   netlify deploy --dir=dist --no-build --prod --json
   ```

   `--no-build` avoids a second build. `--prod` updates the production site; omitting it creates a draft deployment. Return the production URL from the result after success.

6. Verify public access and a direct prototype URL. If restricted sharing is requested, configure the available hosting access controls before sharing the URL.

For updates, rebuild and repeat the deploy command in the linked folder. Keep using the same project. Configure continuous Git deployment only when requested.

References: [CLI setup](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/), [project creation](https://cli.netlify.com/commands/sites/), [deploy command](https://cli.netlify.com/commands/deploy/), and [rewrite options](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

## Vercel

### What you do

Create a Vercel account and authorize the CLI. Select the intended account or team. Git integration is optional. Vercel Hobby is for personal, noncommercial use; company or client work needs an appropriate paid plan.

> Read DEPLOY.md and publish my Design Studio on Vercel as a public viewing link. Build locally and deploy the static output. Guide me through authentication, reuse any existing project, and verify direct prototype links.

### What the agent does

1. Install and authenticate the CLI when needed:

   ```sh
   pnpm add --global vercel
   vercel login
   vercel whoami
   ```

2. Inspect `.vercel/project.json` and existing Vercel configuration. Reuse the linked project or create/link the chosen destination:

   ```sh
   vercel link --yes --project STUDIO-PROJECT --scope ACCOUNT-OR-TEAM
   ```

   Keep `.vercel/` out of Git. Preserve existing source-build settings when a project already uses them; do not overwrite server-backed configuration with this static path.

3. Build at `/` using the Studio's pinned tools. Package a fresh copy of the complete `dist/` contents under `.vercel/output/static/`. This is generated output; replace stale generated files without disturbing `.vercel/project.json`.
4. Write `.vercel/output/config.json` using Build Output API version 3. The minimum identity is `{ "version": 3 }`. Add routing and caching rules from the publishing contract. Check the filesystem before applying application fallbacks. Inspect current Studio routes and asset namespaces; missing assets and prototype data must retain error responses. Do not copy `dist/` alone and assume `--prebuilt` understands its format.
5. Deploy the packaged output:

   ```sh
   vercel deploy --prebuilt --prod
   ```

   Vercel supports manually prepared Build Output API artifacts. This path uploads static files without a remote dependency installation. Wait for readiness and identify the stable production project URL, rather than only the deployment-specific address.

6. Verify the intended visitor access. Existing deployment protection may restrict visitors; preserve restrictions unless the requested audience requires a change. Test a direct prototype URL and reload.

For updates, rebuild, refresh the generated package, and repeat the deploy command for the same linked project. Git-driven builds are an optional alternative; they need explicit Node, pnpm, build-command, and output-directory configuration.

References: [CLI setup](https://vercel.com/docs/cli), [project linking](https://vercel.com/docs/cli/link), [Build Output API](https://vercel.com/docs/build-output-api), [static files](https://vercel.com/docs/build-output-api/primitives), [output configuration](https://vercel.com/docs/build-output-api/configuration), [deploy command](https://vercel.com/docs/cli/deploy), and [plan restrictions](https://vercel.com/docs/limits/fair-use-guidelines).

## Verify and update

Follow the [publishing contract's verification steps](src/platform/context/publishing.md#verify-the-viewing-link) on the actual hosted URL. Test Home, a direct prototype link and reload, and the enabled content you intend to share. Confirm assets load and the chosen audience can visit. For public sharing, test without owner credentials. Check caching and an already-open viewer after updates. Report any unresolved limitation.

Return the viewing URL, audience, provider/project identity, and the short update instruction. Keep the local folder and local preview separate from the published URL. Document repository-specific deployment configuration in the Studio's maintainer guidance, without credentials.

You can return to your agent and say:

> Publish my latest Studio changes to the same deployment. Keep its existing audience, verify the update, and give me the viewing link.

Custom domains are optional. Start with the provider's supplied address. If you request a custom domain later, your agent can guide you through the provider's domain setup and the required DNS changes.
