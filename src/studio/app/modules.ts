// How a module appears in the app: the button on the rail, the routes it adds, and what it adds to the
// ⌘K palette. A module with these has an app.tsx in its folder (src/studio/modules/<id>/app.tsx) that
// exports a ModuleApp as its default. The shell finds them with a glob, so the app runs with any of
// them removed, and reads them in `order`: the rail, the palette and the routes all follow the list.
import type { ComponentType } from 'react';
import type { IconSvgElement } from '@hugeicons/react';
import type { AnyRoute, NavigateOptions } from '@tanstack/react-router';
import type { ModuleSpec } from '@/studio/modules';
import type { Item, Manifest, Prototype, PrototypeInfo } from '@/studio/app/data/types';
import { MODULES } from '@/studio/app/data/modules';
import { isEnabled } from '@/studio/app/data/config';

// What the palette gives a module to draw its entries: the manifest, the open prototype and item (so an
// entry for the page you're on can be disabled), and a function that goes somewhere and closes the palette.
export type PaletteContext = {
  manifest: Manifest;
  current: Prototype | undefined;
  isOpen: (item: Item) => boolean;
  go: (to: NavigateOptions) => void;
};

// One entry a module adds to a prototype's "…" menu (on its card and in its navigation).
export type PrototypeAction = { label: string; icon: IconSvgElement; onSelect: () => void; destructive?: boolean };

export type ModuleApp = {
  icon: IconSvgElement;
  // Where its rail button sits, and its place among the others: low first, in the rail, the palette and the routes.
  rail: 'top' | 'bottom';
  order: number;
  // Routes it adds under the root route. Their addresses start with the module's section key, so
  // /tools opens the Tools module. Links to them are written loosely, since the router's types
  // are made from the app's own routes.
  routes?: (root: AnyRoute) => AnyRoute[];
  // Entries it adds to a prototype's "…" menu, among the ones that change it (Edit, Archive). `editable` is
  // whether you may change this prototype. It's a hook: the shell calls every module's, in the same order each
  // time, since the modules that are on don't change while the app runs.
  useActions?: (proto: PrototypeInfo, can: { editable: boolean }) => PrototypeAction[];
  // CommandItems it adds to the palette's Places group, and groups of its own.
  places?: ComponentType<PaletteContext>;
  palette?: ComponentType<PaletteContext>;
};

const apps = import.meta.glob<ModuleApp>('/studio/modules/*/app.tsx', { eager: true, import: 'default' });
const idOf = (path: string) => path.split('/').at(-2)!;

export type InstalledModule = { spec: ModuleSpec; app: ModuleApp };

// The modules that are installed, on, and have an app, in order.
export const moduleApps: InstalledModule[] = Object.entries(apps)
  .flatMap(([path, app]) => {
    const spec = MODULES.find((m) => m.id === idOf(path));
    return spec && isEnabled(spec.id) ? [{ spec, app }] : [];
  })
  .sort((a, b) => a.app.order - b.app.order);

// The address a module's section opens at, like "/tools".
export const sectionPath = (spec: ModuleSpec) => `/${spec.section!.key}`;
// Whether a pathname is inside the module's section: /tools and /tools/quote-card.
export const inSection = (spec: ModuleSpec, pathname: string) =>
  Boolean(spec.section) && (pathname === sectionPath(spec) || pathname.startsWith(`${sectionPath(spec)}/`));
