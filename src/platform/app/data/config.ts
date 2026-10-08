// studio.config.ts (at the repo root) as the app reads it.
import config from '../../../../studio.config.ts';
import { isEnabled as enabled, type StudioConfig } from '@/platform/core/config';
import directory from 'virtual:studio-resource-directory';
import { resolveStudioReferences } from '@/platform/core/resourceReferences';

export const CONFIG: StudioConfig = resolveStudioReferences(config, directory);
export const APP_NAME = config.name;
export const TAGLINE = config.tagline;
export const isEnabled = (id: string) => enabled(config, id);
