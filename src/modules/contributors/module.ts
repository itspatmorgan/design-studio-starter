import type { ModuleSpec } from '../../platform/core/api.ts';

export default {
  id: 'contributors',
  label: 'Contributors & Permissions',
  version: '0.1.0',
  requires: '0.1.0',
  description: 'Manage contributor and system assignments for a team studio.',
  optional: true,
  lib: false,
  section: { key: 'contributors' },
  instructions: [{ path: 'skills/use-contributors/', when: 'asks to assign or review team Admins, system maintainers, or contributor permissions' }],
} satisfies ModuleSpec;
