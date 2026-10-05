# Continue the plugin experiment

## Product intent

Make Design Studio discoverable through ChatGPT and handle setup for nontechnical designers and product managers. The intended experience is to install the plugin, ask “Create my Design Studio,” and open the studio inside the local code harness.

Every studio must live in an obvious, ordinary folder on the user's computer. The complete repository and files belong to the user and remain usable without the plugin. GitHub is optional for individual use; team setup is a separate flow to investigate.

## Branch and current state

Continue on `codex/chatgpt-plugin-experiment`. The implementation commit is `bf3ec45`. Read the repository's `AGENTS.md` before making changes, then read the [experiment report](README.md) for the technical contracts, installation commands, results, and release gates.

The plugin package is `plugins/design-studio`; the private marketplace is `.agents/plugins/marketplace.json`. Version `0.1.0-experiment.2` installed successfully with Codex CLI 0.137.0. Both portable and compatibility manifests are present. The compatibility manifest is generated from the portable manifest.

The bootstrap downloads starter commit `d2d8fe02f1e3ec64d09d60448fbf8de5574ade23` from the public repository. It deliberately downloads the stable starter, not this experimental plugin branch. It creates a full local repository without a remote and preserves existing studios.

## What does not transfer through Git

The previous computer's plugin installation, marketplace registration, mise trust, dependencies, running server, and test studio are local state. Recreate them on the new computer using the report's maintainer installation steps. Use the new checkout's absolute path when registering the marketplace.

The old test studio was `~/Design Studios/Plugin Experiment`, served on loopback port 5183. That folder and server are not part of this branch. No user prototypes were created or edited as part of the experiment.

## Verification already completed

- Eight bootstrap tests passed, including preservation and linked-path refusal.
- Both plugin skills passed the skill-creator validator.
- The platform build passed with 190 tests and type checks. Vite reported its existing large-bundle warning.
- The installed helper downloaded the public starter, prepared personal configuration, reopened it without changing settings, and launched the preview.
- The studio home and Feedback Inbox rendered in the in-app browser.
- Existing Corepack shadowed pnpm initially. The helper now uses `mise exec pnpm@12` explicitly; the corrected preparation used pnpm 12.9.1.

These were helper and browser tests. They were not a fresh agent conversation exercising automatic onboarding.

## Next experiment

1. Install this private plugin on the new computer using the commands in the report. Check the current host's supported plugin installation and refresh behavior.
2. Start a fresh conversation with Design Studio enabled and ask “Create my Design Studio.” Observe skill selection, identity handling, permissions, and progress without supplying terminal instructions.
3. Verify the Design Studio logo and plugin placement in the actual native UI.
4. Prove the created folder becomes the local code harness's working project. The previous host exposed no supported project-registration API. Opening a browser preview alone does not satisfy this requirement. Do not invent APIs or modify the host's internal database.
5. Verify files are visible, the preview works, and reopening or uninstalling preserves the user's work.
6. Record clean-machine prerequisites and recovery behavior. Investigate the official public submission/discovery route and team setup after the local journey is proved.

Native Codex UI automation was unavailable on the previous computer, so those UI results remain unverified. No public submission was made. The user has authorized committing and pushing this experimental branch, not merging or releasing it.

## Suggested continuation prompt

“Continue the Design Studio plugin experiment on this branch. Read AGENTS.md, plugins/design-studio/HANDOFF.md, and plugins/design-studio/README.md. Help me test a fresh-chat installation and onboarding flow in the actual host, including the logo and attaching the visible local studio folder to the code harness. Preserve the requirement that users own the complete repo on their computer. Keep unverified host behavior explicit.”
