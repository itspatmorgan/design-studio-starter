import { fileURLToPath } from 'node:url';
import type { ModuleServer } from '../../platform/core/modules/index.ts';
import { claimWelcome } from './node/progress.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export default {
  progress: ({ body }) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { status: 400, body: { error: 'Invalid Welcome request.' } };
    const request = body as Record<string, unknown>;
    if (request.action !== 'claim' || Object.keys(request).some(key => key !== 'action')) {
      return { status: 400, body: { error: 'Invalid Welcome request.' } };
    }
    return { body: { show: claimWelcome(root) } };
  },
} satisfies ModuleServer;
