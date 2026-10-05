# Design Studio Starter

An open-source starter kit for your own design environment. Work with a coding agent to build interactive prototypes, sketch on canvases, and keep useful context alongside your designs.

Made for designers and product managers, working individually or with a team. Bring your own design system, customize the studio, and own the code and everything you create.

## Get started

1. Select **Use this template** on GitHub to create your own repository, then clone it locally.
2. Install [mise](https://mise.jdx.dev/installing-mise.html) if you do not already have it.
3. From the repository directory, run:

   ```sh
   mise install
   mise exec -- pnpm install
   mise exec -- pnpm dev
   ```

Open the local URL printed by Vite. You can explore the starter before configuring anything or opening it in a coding agent. See the [setup guide](src/modules/documentation/pages/getting-started.md) for what to do next.

## Learn more

The Guide at `/documentation/guide` introduces setup, the app surfaces, and collaboration. Detailed platform contracts live in Reference at `/documentation/reference`.

- [Introduction](src/modules/documentation/pages/index.md) — how the studio works.
- [Collaborate](src/modules/documentation/pages/collaborate.md) — ownership and sharing work.
- [Modules](src/platform/context/technical/modules.md) — customize and extend your studio.
- [Tech stack](src/platform/context/technical/stack.md) — what's under the hood.

## Project status

Early beta, focused on local workflows: prototypes, canvases, documents, design systems, and system-owned context. See the [Changelog](CHANGELOG.md) for platform release history.

For bugs, ideas, and pull requests, see [Contributing](CONTRIBUTING.md). For the intended environment and private vulnerability reporting, see [Security](SECURITY.md).

## License

[MIT](LICENSE). Includes [Flexoki](https://stephango.com/flexoki) by Steph Ango (MIT) and [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/) by Atlassian (Apache-2.0).
