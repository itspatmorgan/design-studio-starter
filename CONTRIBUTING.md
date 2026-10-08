# Contributing

Design Studio Starter is an early beta. The current priority is a reliable local workflow: studio initialization, contributor onboarding, prototypes and their file types, design systems, and the system content. Portable static publishing is part of the workflow; each studio chooses and configures its own host.

For local setup, follow the [README](README.md) and the Manual in `src/modules/documentation/pages/`. Coding agents should start with [AGENTS.md](AGENTS.md), which points to platform context, principles, personas, and task skills.

## Proposing a change

Open an issue for a substantial feature or architectural change before investing in an implementation. Small fixes can go straight to a pull request. Describe the problem, the resulting behavior, and how you verified it. Include screenshots for visible changes.

Create a branch in your fork and submit a pull request to `main`. Changes to the platform, systems, system content, scripts, and configuration need maintainer review. Prototype changes follow the contributor ownership requirements in [Contributor scope](src/platform/context/contributor-scope.md); when building a new prototype, use `pnpm new "Prototype Name"`.

## Checking your work

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm harness:check
pnpm build:release
pnpm build:inspect
```

Use `pnpm test` during development for focused regressions. `pnpm test:release` also exercises disposable setup and production fixtures and plugin distribution tests when present. `pnpm build` validates current source, types, and static output without rerunning tests. `pnpm build:release` performs both release regressions and the build. Keep committed files below 750 KB. Include useful tests for behavior changes, and update the Manual or agent instructions when a workflow changes.

Run `pnpm harness:sync` after changing plugin identity or canonical project skills. It generates all three host manifests and catalogs, then synchronizes project routing and skill adapters. Edit canonical sources instead of generated files. See [Agent context routing](src/platform/context/agent-context.md) for ownership and installed-studio packaging.

Use fictional sample data. Do not commit credentials, local environment files, proprietary design-system code, or company information you do not have permission to share. Check both files and commit history before publishing your own studio.

## License

Contributions are made under the repository's [MIT license](LICENSE). Keep applicable third-party notices when importing or adapting code.
