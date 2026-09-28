---
name: setup-contributor
description: Set up a new contributor in the prototype sandbox, from installing tools to adding them to contributors.json. Use when someone says "get me set up", "add me as a contributor", "onboard me", or is new to the repo.
---

# Set up a contributor

1. If tools or packages are missing, run `mise install`, then `pnpm install`.
2. Run `pnpm join`. If it says they're already a contributor, tell them their folder and skip to step 6.
3. Otherwise it prints a proposed entry and writes nothing. Show the person their name, GitHub username, email, and folder name in plain language, and ask if they're right. Pass on any warning, like a personal email (they should use their work email).
4. Run it again with the confirmed values: `pnpm join --key <key> --name "<name>" --github <username> --email <email> --yes`.
5. Check it worked: `node scripts/resolve-contributor.js` should print their key. If it doesn't, their Git name or GitHub username doesn't match the entry. Fix it with them.
6. Offer to create their first prototype with `pnpm new "Prototype Name"`, then start the app with `pnpm dev`.
