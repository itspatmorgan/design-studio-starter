// __LABEL__ on the Systems page: what it is, and how its theme is set up. Its components and foundations pages come from
// its files (components/, styles/theme.css).
import { Code, Prose } from '@/studio/app/pages/systems/foundations';
import type { SystemIntro } from '@/studio/app/data/types';

export default {
  intro: (
    <Prose>
      <p>__LABEL__ is a design system prototypes can build with. Say here what it's for, and who uses it.</p>
      <p>Its theme is in <Code>src/systems/__ID__/styles/theme.css</Code>, set under <Code>.__ID__-theme</Code>. Its components are in <Code>src/systems/__ID__/components/</Code>: add one as <Code>button.tsx</Code> with a <Code>button.examples.tsx</Code> and a <Code>button.md</Code> next to it, and it gets a page here.</p>
    </Prose>
  ),
} satisfies SystemIntro;
