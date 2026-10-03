// __LABEL__ on the Systems page: what it is, and how its theme is set up. Its components and foundations pages come from
// its files (components/, styles/theme.css).
import { Code, ColorModeSupport, Prose } from '@/platform/modules/systems/pages/foundations';
import system from './system';
import type { SystemIntro } from '@/platform/app/data/types';

export default {
  intro: (
    <>
      <Prose>
        <p>__LABEL__ is a design system prototypes can build with. Say here what it's for, and who uses it.</p>
      </Prose>
      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
      <Prose>
        <ColorModeSupport modes={system.colorModes} />
        <p>Its theme is in <Code>src/systems/__ID__/styles/theme.css</Code>, set under <Code>.__ID__-theme</Code>. Its components are in <Code>src/systems/__ID__/components/</Code>: add one as a <Code>button/</Code> folder holding <Code>button.tsx</Code>, <Code>button.examples.tsx</Code>, <Code>button.md</Code> and an <Code>index.ts</Code>, and it gets a page here.</p>
      </Prose>
    </>
  ),
} satisfies SystemIntro;
