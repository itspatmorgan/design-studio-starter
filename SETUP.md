# Set up Design Studio with your agent

Open your local coding agent: ChatGPT/Codex, Claude Code, or Cursor. Give it this request:

> Help me install Design Studio from https://github.com/itspatmorgan/design-studio-starter. Read its SETUP.md and follow the linked create-studio instructions. Handle downloading, setup, and opening it for me. Save my studio in my user Developer folder. Preserve anything already there. Show me the running studio and help me continue working in its folder.

Your agent may need permission to download tools or create the folder. It should handle the technical steps and tell you when it needs your help. Use a tool that can work with local files and run commands on your computer.

Your studio stays in a folder you own. You can explore the sample, then ask your agent to make your first prototype. A GitHub account is optional for personal use.

## For the agent carrying out setup

Use the existing [create-studio skill](plugins/design-studio/skills/create-studio/SKILL.md). That procedure and its [host handoff](plugins/design-studio/skills/create-studio/references/host-handoff.md) are the authoritative setup instructions for every supported host.

Without an installed plugin, download a temporary shallow checkout of this public repository through your supported tools. Record its full commit SHA and read the skill, helper, and references from that same checkout. This is setup tooling, not the person's studio. Inspect `plugins/design-studio/scripts/bootstrap.mjs` before execution; it pins the starter revision independently. Run the helper from that checkout and create the owned studio in the destination specified by the skill. Do not use the temporary checkout as the person's workspace. No repository duplication or remote is needed.

Use the person's requested folder when supplied. Handle missing tools through supported host mechanisms and their official sources. Honor permission prompts; report an unavailable local execution capability. Preserve existing studios and use open-studio for them. Complete the preview and workspace handoff before declaring setup finished.
