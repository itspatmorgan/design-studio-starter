---
name: initialize-studio
description: "Initialize or resume a personal or shared Design Studio, including local tooling, studio configuration, the first contributor, Handbook context and a design-system setup path. Use for a new studio or first-time kit setup; use setup-contributor for someone joining an existing studio."
---

The agent executes setup and verifies the result. Ask for missing intent or materials, not for the person to run commands you can run. Existing authorization applies; do not repeatedly confirm the same choices. Hosting and publishing are separate requests.

## Inspect and choose the path

Read `studio.config.ts`, the contributor registry (`contributors.json` and `contributors/`), Git identity/remotes, `src/systems/`, and the Handbook. Preserve existing work. Do not interpret a stock name, a missing dependency folder, or one contributor as proof this is a new studio. If intent is unclear, ask whether this is a new studio or joining an existing one; route joining to `setup-contributor`.

Install the pinned tools and packages as needed (`mise trust`, `mise install`, `pnpm install`; use `mise exec --` if shell activation is missing). Read `pnpm -s studio status --json` when dependencies are available. Resume from the actual state; there is no setup-complete flag.

Collect only unresolved choices: personal or team use (team is the starter default), studio name/tagline, the first person's identity, and whether their design system exists as code, tokens/design documentation, or needs to be started. Explain which materials you need and why. Batch related questions with suggested defaults. Continue independent setup while waiting; do not invent answers or brand tokens.

## Configure and register

Use `pnpm studio configure --name "…" --usage personal|team --tagline "…" --system <installed-id>` to preview, then `--yes` to apply the person's choices. Omit unchanged fields. For modules, read [modules.md](../../rules/modules.md) and use the existing studio commands. The beta ships with Tools off; enabling it is optional.

Follow [setup-contributor](../setup-contributor/SKILL.md) for the first person's identity and registration. A personal studio accepts a personal email and needs no GitHub account to run locally. A shared studio needs each contributor's own identity; inspect Git remotes and explain the GitHub repository prerequisite for sharing clones. Do not create a remote, push, or host anything without a request.

Ask for actual team/product context for the Handbook's principles and personas. Draft from supplied material, let the person review in text or `/handbook`, and preserve unresolved placeholders explicitly rather than inventing research. A personal studio uses the same Handbook and ownership model.

## Establish the design system

Follow [setup-design-system](../setup-design-system/SKILL.md). Keep Product available while the replacement is incomplete. Report what still needs human input. The placeholder is not the person's finished system merely because it builds.

The starter's `patrick` entry, prototype and disabled tool belong to the kit author. Explain cleanup before doing it; do not remove another contributor's work just because they joined. For authorized starter cleanup, inspect links and all content, including disabled modules: the sample tool also depends on Product and lists `patrick` as maintainer. Transfer, archive outside active source, or remove those samples according to the person's choice before retiring their dependencies. Preserve recoverable copies when replacing content. Do not leave orphaned maintainers or broken imports behind.

## Verify and hand off

Create the person's first prototype with `pnpm new "…"`. Exercise a view using the chosen system, a Markdown document, and a canvas if that module is enabled; use the relevant Handbook rules. Run `pnpm build`, start `pnpm dev`, and inspect the local app and Systems pages. Verify the person's key, prototype URL, and active module navigation. Use the running UI for component/theme review or context exchange when clearer than chat; keep text available and do not create a questionnaire without a concrete need. Any UI-collected context must be saved in readable repository files for the agent to resume.

Report completed choices, verification, exact local links, and remaining input. Stop short of claiming initialization is complete if the user's system or required context is still missing. Keep the dev server available for them; do not push or deploy.
