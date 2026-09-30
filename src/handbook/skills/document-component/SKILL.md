---
name: document-component
description: Add a component to a prototype system, or bring its page up to date, so it gets a Systems page with a props table, live examples, and a description. Use when someone adds, imports, or ports a component, asks to document one, or the build warns that a component has no examples or page.
---

# Document a component

A component's page comes from files that share its name, in `src/systems/<system>/components/` (see `src/handbook/rules/systems.md`, "Component pages").

1. **Get the component in.** For a shadcn/ui component, run `npx shadcn add <name>`, adding `--path src/systems/<system>/components` for any system but `product`. If the new file imports `cn` from `"cn"`, change it to `@/lib/utils`. A component that renders a pop-up passes `usePortalContainer()` to its Portal. Ported components are already in the folder.
2. **Write the missing files.** Run `pnpm component-docs <system> <component>`. It creates `<name>.examples.tsx` and `<name>.md` beside the component, and skips any that exist. Without a component name it does every component that lacks them.
3. **Fill in the page** (`<name>.md`):
   - `description`: one or two sentences on what it is, for someone choosing a component.
   - `## When to use`: when this is the right component and when another is. Keep the heading; write it in plain language.
   - Anything else the team would want (usage guidelines, accessibility, links to Figma or the source). Nothing else is required. Delete the HTML comments once they've served.
4. **Fill in the examples** (`<name>.examples.tsx`). Each export named with a capital is one example. Add one per variant, size, and state worth seeing, and replace any `undefined as never` the template left for a required prop. Wrap nothing: the page frames each example in the system's theme.
5. **Check it.** Run `pnpm build`: it warns about a missing description or "When to use", and fails on a type error. Open the component's page in the app (`/systems/<system>/<component>`) and look at the examples in light and dark mode.

A folder per component (`dialog/dialog.tsx`, `dialog/dialog.md`) works the same as flat files, if the person prefers it.
