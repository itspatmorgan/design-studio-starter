// studio.config.ts (at the repo root) as the app reads it.
import config from '../../../../studio.config.ts';
import { isEnabled as enabled, type StudioConfig } from '@/studio/core/config';

export const CONFIG: StudioConfig = config;
export const APP_NAME = config.name;
export const isEnabled = (id: string) => enabled(config, id);
