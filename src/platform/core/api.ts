// The contract a module is written against: the types of what it declares and what it may provide.
// A module imports them from here, not from the platform's internals, so this is the list to keep
// steady while the contract is 0.x (PLATFORM_VERSION, src/platform/core/modules/index.ts).
//   module.ts   what the module is and its section          ModuleSpec
//   server.ts   routes it adds to the dev server            ModuleServer, ServerRoute
//   app.tsx     its rail button, routes, palette, menu      ModuleApp, PaletteContext, PrototypeAction
// Types only: this file adds nothing to the app or the build. A module.ts and a server.ts are loaded by Node as well as
// the app, so they take their types from ./modules/index.ts, where these two are defined; app.tsx takes all of them from here.
export type { ModuleServer, ModuleSpec, ServerRoute } from './modules/index.ts';
export type { ModuleApp, PaletteContext, PrototypeAction } from '../app/modules.ts';
