// The contract a module is written against: the types of what it declares and what it may provide.
// A module imports them from here, not from the platform's internals, so this is the list to keep
// steady while the contract is 0.x (PLATFORM_VERSION, src/platform/core/modules/index.ts).
//   module.ts   what the module is and its section          ModuleSpec
//   server.ts   routes it adds to the dev server            ModuleServer, ServerRoute
//   app.tsx     its rail button, routes, palette, menu      ModuleApp, PaletteContext, PrototypeAction
// This entrypoint is safe for Node declarations and browser code. Browser-only
// framework services have explicit entrypoints listed in modules/boundaries.ts.
export type { ModuleServer, ModuleSpec, ServerRoute } from './modules/index.ts';
export type { ModuleApp, PaletteContext, PrototypeAction } from '../app/modules.ts';

// Studio identity is available to module routes without importing app internals.
export { APP_NAME, TAGLINE, CONFIG } from '../app/data/config.ts';
export { adminProblems } from './config.ts';
