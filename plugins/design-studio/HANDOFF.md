# Continue portable setup testing

The Context and Skills foundation is merged into main. Portable setup work continues on `codex/portable-studio-setup`. Read repository instructions and the [plugin README](README.md) for authoritative setup behavior and release gates.

Experiment .9 has one set of create/open/use skills and one bootstrap, with generated Codex, Claude Code, and Cursor manifests. It pins public main commit `7c2ddf1c5bf79bb778827a4eaff2498ca96adae3`. Direct setup starts from [SETUP.md](../../SETUP.md). Existing studios are preserved; no plugin operation upgrades them automatically.

The next native checks are:

1. Run Claude with the local `--plugin-dir` test, invoke create-studio, and confirm preview, owned workspace, project skill discovery, and first prototype.
2. After the manifests are pushed, import the repository through Cursor's Customize UI and repeat that journey.
3. Install experiment .9 in a fresh Codex chat and test its current pinned snapshot and handoff.
4. Try the direct setup request without a plugin. Confirm the agent handles downloading and setup rather than asking the person to clone or run commands.
5. Test reopening, occupied ports, restart, removal, updates, and interrupted setup. Clean-computer prerequisite installation remains a separate gate.

CLI schema checks, local fixture tests, and a prepared studio on a machine with installed tools do not prove these native journeys. Record results in the plugin README. Push, publish, or submit only with current authorization. Do not copy operating skills into the plugin; they belong to the owned studio.
