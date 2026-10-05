# __LABEL__

A design system for prototypes assigned to `__ID__`.

- `AGENTS.md` selects relevant context and skills.
- `context/` holds shared product and design knowledge.
- `skills/` holds task procedures when this system needs them.
- `components/` and `styles/theme.css` provide the interface toolkit.
- `system.ts` declares the system; `intro.tsx` describes it in the app.

Add context and skills only when needed. This system’s UI reads its original Context and Skills files alongside Theme and Components. See the [Systems module](../../modules/systems/README.md) for the authoring contract.
