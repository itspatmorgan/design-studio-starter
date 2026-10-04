import { Code, ColorModeSupport, Prose } from '@/platform/modules/systems/pages/foundations';
import system from './system';
import type { SystemIntro } from '@/platform/app/data/types';
export default {
  intro: <>
    <Prose><p>A small marketing system built from Untitled UI’s open-source React components. It supports public-facing pages with a violet accent, Inter typography, and rounded controls. Product prototypes keep their own system.</p><p>Start with Button and Tooltip. The Design Studio Marketing prototype demonstrates a complete landing page assembled from this subset.</p></Prose>
    <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight text-foreground">Theme</h2>
    <Prose><ColorModeSupport modes={system.colorModes} /><p><Code>styles/theme.css</Code> declares the entire included inventory under <Code>.marketing-theme</Code>. Unlisted choices stay outside this system.</p></Prose>
  </>,
} satisfies SystemIntro;
