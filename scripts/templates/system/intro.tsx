// __LABEL__ on the Systems page: what it is, and how its theme is set up. Its components and foundations pages come from
// its files (components/, styles/theme.css).
import type { SystemIntro } from '@/platform/app/data/types';

export default {
  summary: '__LABEL__ is a design system prototypes can build with. Describe its purpose and audience here.',
  overview: {
    guidance: 'Describe the context, constraints, and procedures included in __LABEL__.',
    code: 'Describe the interface toolkit and visual character of __LABEL__.',
  },
} satisfies SystemIntro;
