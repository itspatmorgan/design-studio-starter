# Prototype Sandbox

At the start of every session, read:
- agent/rules/systems.md
- agent/rules/prototype-workflow.md
- agent/rules/contributor-scope.md

Find out who you're working with by running `node scripts/resolve-contributor.js`.
Create prototypes with `pnpm new "Prototype Name"`.
You can change only your own folder in src/prototypes/.
A prototype can depend only on its own folder, src/product/, and src/lib/.
