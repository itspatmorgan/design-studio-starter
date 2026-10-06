import { fileURLToPath } from 'node:url';
import type { ModuleServer } from '../../platform/core/modules/index.ts';
import { createSystem } from './node/create-system.js';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export default {
  create: ({ me, body }) => {
    try { return { body: createSystem(root, me, body) }; }
    catch (error) {
      const status = error instanceof Error && 'status' in error && typeof error.status === 'number' ? error.status : 400;
      return { status, body: { error: error instanceof Error ? error.message : 'Could not create the system.' } };
    }
  },
} satisfies ModuleServer;
