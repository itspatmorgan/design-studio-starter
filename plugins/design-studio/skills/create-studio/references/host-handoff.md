# Host handoff

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

## Claude Code

For a terminal session, use the host's persistent terminal to start `claude` with the studio folder as its working directory. Do not send an automatic task to a second agent or assume changing one shell's directory changes the current session's project. If the current host cannot open an interactive session, provide the full folder path and guide the person to open that local project in Claude Code. Then offer the same first question as above.

The studio's `CLAUDE.md` imports its shared `AGENTS.md`; `.claude/skills` exposes its current procedures. Read the shared instructions explicitly if an older studio has no Claude entry point. Preserve existing personal instruction files.

## Verify each handoff

A successful launch command proves only that a launch was requested. Verify the folder from the host UI, the new chat's reported working directory, or the person's observation. Claude Code and Cursor handoff journeys still need live testing. Never send them Codex links.

References: [Claude Code CLI](https://code.claude.com/docs/en/cli-reference), [Claude project instructions](https://code.claude.com/docs/en/memory). Check the installed Cursor CLI's help before using its folder-opening flags.
