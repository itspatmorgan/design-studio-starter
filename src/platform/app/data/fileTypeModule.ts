import type { ComponentType } from 'react';
import type { CodeIcon } from '@hugeicons/core-free-icons';
import { capabilityAvailability, type ArtifactAvailabilityContext, type FileTypeSpec, type EmbedSurface } from '../../core/fileTypes.ts';
export type { EmbedSurface } from '../../core/fileTypes.ts';
import type { Artifact, Prototype } from '@/platform/app/data/types';

// How the app opens a file type (src/modules/<type>/open.tsx). What the build needs to know
// about the type is in its type.ts.
export type ArtifactContext = { proto: Prototype; item: Artifact };

// What a type shows where another item includes it (in documents or on canvases): a live preview, in a box of
// this size. A type without one is shown as a card.
export type EmbedProps = { proto: Prototype; item: Artifact; width: number; height: number };

export type FileTypeModule<Props extends object = any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
  icon: typeof CodeIcon;
  // Loads the item's file before its page renders, so the open item stays on screen until the
  // next is ready. Returns the props for Page, or undefined if the file isn't there (the
  // not-found page).
  load(context: ArtifactContext): Promise<Props | undefined>;
  Page: ComponentType<Props> & { preload?: () => Promise<unknown> | undefined };
  Embed?: ComponentType<EmbedProps>;
  actions?: readonly ArtifactAction[];
};

export type ArtifactActionContext = ArtifactContext & { environment: ArtifactAvailabilityContext };
export type ArtifactAction = {
  id: string;
  label: string;
  icon?: typeof CodeIcon;
  localOnly: boolean;
  mutates: boolean;
  // Return a reason when unavailable, or null. Does not authorize a write.
  unavailable?: (context: ArtifactActionContext) => string | null;
  run(context: ArtifactActionContext): void | Promise<unknown>;
};

export function assertFileTypeModule(id: string, spec: FileTypeSpec, module: FileTypeModule | undefined) {
  const fail = (message: string): never => { throw new Error(`File type ${id}: ${message}`); };
  if (module && 'embedSurfaces' in module) fail('move embedSurfaces to capabilities.embeds in type.ts.');
  if (!module || !module.Page || typeof module.load !== 'function') fail('provide Page and load in open.tsx.');
  if (Boolean(module!.Embed) !== Boolean(spec.capabilities.embeds.length)) fail('capabilities.embeds must match the Embed implementation.');
  const actions = module!.actions ?? [];
  const ids = actions.map(action => action.id);
  if (new Set(ids).size !== ids.length) fail('action implementations must have unique IDs.');
  if (ids.length !== spec.capabilities.actions.length || ids.some(id => !spec.capabilities.actions.includes(id))) fail('capabilities.actions must match action implementations.');
  for (const action of actions) {
    if (!action.id.startsWith(id + '.') || !action.label?.trim() || typeof action.run !== 'function' || typeof action.localOnly !== 'boolean' || typeof action.mutates !== 'boolean' || (action.unavailable !== undefined && typeof action.unavailable !== 'function')) fail('actions need an owner-prefixed ID, label, run, localOnly and mutates declarations.');
  }
}

export function artifactActions(spec: FileTypeSpec | undefined, module: FileTypeModule | undefined, context: ArtifactActionContext) {
  const env = context.environment;
  return (module?.actions ?? []).filter(action => spec?.capabilities.actions.includes(action.id)).map(action => ({
    action,
    availability: capabilityAvailability(true,
      !env.present && 'This artifact is unavailable.',
      !env.renderer && 'The artifact renderer is unavailable.',
      Boolean(spec && !(env.scope === 'prototype' ? spec.inPrototype : spec.inSystemContent)) && 'This artifact type is unavailable in this scope.',
      action.localOnly && !env.local && 'This operation is available only in a local studio.',
      action.mutates && (!env.local || !env.editable) && 'You do not have permission to change this artifact.',
      action.unavailable?.(context) ?? undefined),
  }));
}

// Recheck availability at dispatch; handlers must use server-authorized operations for writes.
export async function runArtifactAction(id: string, spec: FileTypeSpec | undefined, module: FileTypeModule | undefined, context: ArtifactActionContext) {
  const entry = artifactActions(spec, module, context).find(({ action }) => action.id === id);
  if (!entry) throw new Error('This artifact action is unsupported.');
  if (!entry.availability.available) throw new Error(entry.availability.reason);
  return entry.action.run(context);
}

// Only explicitly declared surfaces receive a preview.
export function embedFor(spec: FileTypeSpec | undefined, module: FileTypeModule | undefined, surface: EmbedSurface) {
  return spec?.capabilities.embeds.includes(surface) ? module?.Embed : undefined;
}

// Every route reader uses the same handoff: data and renderer must both be prepared.
export async function prepareFile<Props extends object>(module: FileTypeModule<Props>, context: ArtifactContext): Promise<Props | undefined> {
  const [props] = await Promise.all([module.load(context), module.Page.preload?.()]);
  return props;
}
