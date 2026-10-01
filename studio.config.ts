// What nearly every team changes. Everything else is code: you own the whole repo.
// A module you leave out of `modules` is on; { guide: false } turns the Guide off (its files stay, so
// turning it back on is one line). `pnpm check` explains anything that's wrong here.
import type { StudioConfig } from './src/studio/core/config.ts';

export default {
  name: 'Design Studio',
  modules: {},
  // defaultSystem: 'product',   // the design system a prototype uses when its meta.json doesn't name one
} satisfies StudioConfig;
