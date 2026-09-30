---
name: setup-contributor
description: Set up a new contributor in the prototype sandbox, from installing tools to adding them to contributors.json. Use when someone says "get me set up", "add me as a contributor", "onboard me", or is new to the repo.
---

# Set up a contributor

1. Install the tools: run `mise trust && mise install`, then `pnpm install`. Check `node -v` matches the version in `mise.toml`; if it doesn't, mise isn't activated in this shell. Run commands through it (`mise exec -- pnpm install`, `mise exec -- pnpm dev`), and offer to set up activation for them (https://mise.jdx.dev/getting-started.html).
2. Check Git knows who they are: `git config user.name` and `git config user.email` should show their own name and work email. On a shared or new machine they may be someone else's or empty; if so, ask for the right values and set them in this repo (`git config user.name "…"`).
3. Run `pnpm join`. If it says they're already a contributor, check the name is theirs. If it names someone else, like the example `patrick` entry, their GitHub account is already used by that entry: ask before removing it. Otherwise tell them their folder and skip to step 7.
4. Otherwise it prints a proposed entry and writes nothing. Show the person their name, GitHub username, email, and folder name in plain language, and ask if they're right. Pass on any warning, like a personal email (they should use their work email).
5. Run it again with the confirmed values (the key can't be `systems` or `guide`, which are app pages): `pnpm join --key <key> --name "<name>" --github <username> --email <email> --yes`.
6. Check it worked: `node scripts/resolve-contributor.js` should print their key. If it doesn't, their Git name or GitHub username doesn't match the entry. Fix it with them. Then commit it on its own: `git commit -m "Add <name> as a contributor"`.
7. Offer to create their first prototype with `pnpm new "Prototype Name"`. Start the app with `pnpm dev` and leave it running; it prints the local URL (the port can change if one is busy). Give them the link to their prototype: `/<key>/<prototype>`, like `http://localhost:5173/sam/settings-page`.
