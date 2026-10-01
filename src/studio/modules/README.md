# Modules

A module is a part of Design Studio you can add or remove: the Guide, Tools, the Handbook, Systems.
Each is a folder here with a `module.ts` that says what it is and the address (section) it adds.
The build, the dev server and the app all read this list, so no list of sections is kept anywhere else.

```ts
import type { ModuleSpec } from '../index.ts';

export default {
  id: 'tools',                 // the folder's name
  label: 'Tools',
  version: '0.1.0',
  section: { key: 'tools', folder: 'src/tools' },   // /tools, and where its files live
} satisfies ModuleSpec;
```

`pnpm check` confirms every declaration is well formed, no two modules claim the same address, and no
contributor uses a module's address. Modules can't import each other, and code outside a module can
read only its `module.ts`.

File types (`src/studio/fileTypes/`) are modules of their own kind and keep their folders for now.
This is the first step: the rest of each module's code moves in as the app learns to read the list.
