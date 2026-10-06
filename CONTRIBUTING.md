# Contributing

Design Studio Starter is an early beta. The current priority is a reliable local workflow: studio initialization, contributor onboarding, prototypes and their file types, design systems, and the system content. Hosting is outside the current release focus.

For local setup, follow the [README](README.md) and the Guide in `src/modules/documentation/pages/`. Coding agents should start with [AGENTS.md](AGENTS.md), which points to platform context, principles, personas, and task skills.

## Proposing a change

Open an issue for a substantial feature or architectural change before investing in an implementation. Small fixes can go straight to a pull request. Describe the problem, the resulting behavior, and how you verified it. Include screenshots for visible changes.

Create a branch in your fork and submit a pull request to `main`. Changes to the platform, systems, system content, scripts, and configuration need maintainer review. Prototype changes follow the contributor ownership requirements in [Contributor scope](src/platform/context/contributor-scope.md); when building a new prototype, use `pnpm new "Prototype Name"`.

## Checking your work

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm harness:check
pnpm build
```

The build runs tests, type checks, and production validation. Keep committed files below 750 KB. Include useful tests for behavior changes, and update the Guide or agent instructions when a workflow changes.

Run `pnpm harness:sync` after changing plugin identity or canonical project skills. It generates all three host manifests and catalogs, then synchronizes project routing and skill adapters. Edit canonical sources instead of generated files. See [Agent context routing](src/platform/context/agent-context.md) for ownership and installed-studio packaging.

Use fictional sample data. Do not commit credentials, local environment files, proprietary design-system code, or company information you do not have permission to share. Check both files and commit history before publishing your own studio.

## License

Contributions are made under the repository's [MIT license](LICENSE). Keep applicable third-party notices when importing or adapting code.
