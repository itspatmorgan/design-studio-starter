# Host handoff

## Establish local execution

Before installation, establish where command execution and file writes occur using [Local environment and destination](local-setup.md). An editor running on the person's desktop may still be connected to a remote executor. The host's explicit execution context or the person's confirmation supplies evidence; a launch command, repository connection, or preview does not.

- **Codex desktop:** use a local chat whose executor accesses the person's native filesystem. A cloud task or a remote host does not establish that access.
- **Cursor:** use a native local Agent window. If the session is a Cloud Agent or a remote/SSH/container workspace, guide the person to a local window first. Do not copy the plugin into a remote account's `~/.cursor` directory.
- **Claude Desktop:** use **Code** with **Local** selected and verify the executor reaches the native filesystem. Do not use a remote environment or worktree as the new owned studio.

Keep the verified computer OS, selected absolute destination, and setup-plan path in any continuation handoff. After switching sessions, rerun preflight and recheck the plan; never carry an old environment's home path into a new session as a default.

## Codex desktop

After verifying the studio folder, provide a Markdown link labeled **Continue in your studio**:

```js
const url = 'codex://new?path=' + encodeURIComponent(studioFolder)
  + '&prompt=' + encodeURIComponent('What can I do with this studio, and which design systems are available?');
```

Use the actual absolute studio folder for `studioFolder`. Encode each query value separately. The link opens a new local chat in that folder and prefills the composer; the person sends the question. It does not send automatically or move the current chat.

Explain: “Continue in your studio, then send the question to get started.” The new chat can discover the repository's instructions from its working folder. A plugin mention is not required for repository context.

An offered link is a pending handoff. Confirm workspace opening only from the new chat's reported working folder or the person's observation. Do not claim the link registers a persistent sidebar project. If the host cannot open it, guide the person to select the studio folder through its project UI.

Official reference: [Codex deep links](https://learn.chatgpt.com/docs/reference/commands#chats).

## Cursor

When the installed `cursor --help` supports folder opening, run `cursor --new-window <absolute-studio-folder>` through the command API with separate arguments. This opens the owned studio in a new window without replacing another workspace. If the CLI is unavailable, use Cursor's **Open Folder** UI and select the studio folder. Ask the person to continue in that window and send: “What can I do with this studio, and which design systems are available?”

Verify the selected folder before declaring the handoff complete. The installed project skills supply current procedures; plugin skills handle entry and setup. Never install an editor extension as a substitute for the plugin.

## Claude Desktop — Code

Use the Claude desktop app's **Code** view with **Local** selected. This is the primary Claude journey for designers and product managers. The agent handles commands; the person should not need a terminal.

For first-time setup, a new local session can start with **No folder** if that option is available. Preserve an existing session's selected project. After creating the studio, show its absolute folder path. Guide the person to start a new local Code session, use the folder selector's **Open folder…**, and select that exact studio folder. Keep worktree isolation off for this setup journey so continued work uses the owned studio itself. Do not change an existing session's worktree setting.

Offer: “What can I do with this studio, and which design systems are available?” The person sends it in the new session. Verify the selected folder before declaring the handoff complete. Do not invent a Claude deep link or assume a shell directory change moves the desktop session.

Use the desktop preview capability to start and inspect Studio from its selected folder. If launch configuration is needed, follow the current [desktop preview documentation](https://code.claude.com/docs/en/desktop#configure-preview-servers) and the studio's documented pnpm commands. Preserve existing launch entries. A preview started from a parent folder does not establish the studio as the session's project.

The studio's `CLAUDE.md` imports its shared `AGENTS.md`; `.claude/skills` exposes its current procedures. Read the shared instructions explicitly if an older studio has no Claude entry point. Preserve existing personal instruction files.

### Optional terminal workflow

Use this only when the person explicitly chooses the CLI. Start `claude` in a persistent terminal with the studio folder as its working directory. Do not send an automatic task to a second agent or assume changing one shell's directory changes another session's project.

## Verify each handoff

A successful launch command proves only that a launch was requested. Verify the folder from the host UI, the new chat's reported working directory, or the person's observation. Claude Code and Cursor handoff journeys still need live testing. Never send them Codex links.

References: [Claude Desktop](https://code.claude.com/docs/en/desktop), [Claude Code CLI](https://code.claude.com/docs/en/cli-reference), [Claude project instructions](https://code.claude.com/docs/en/memory). Check the installed Cursor CLI's help before using its folder-opening flags.
