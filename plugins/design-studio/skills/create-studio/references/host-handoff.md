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

## Other hosts

Use the current host's documented folder-opening mechanism. Keep the studio folder and repository instructions independent of the host. Claude Code and Cursor handoff behavior still requires testing; do not send them Codex links.
