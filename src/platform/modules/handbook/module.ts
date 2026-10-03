import type { ModuleSpec } from '../../core/modules/index.ts';

// The Handbook: what people and agents should know and follow (/handbook), in src/handbook/.
export default {
  id: 'handbook',
  label: 'Handbook',
  version: '0.1.0',
  description: 'Context, rules and skills for people and agents.',
  section: { key: 'handbook', folder: 'src/handbook', items: 'handbook', policy: 'open' },
} satisfies ModuleSpec;
