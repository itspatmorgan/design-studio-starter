// Made by scripts/build/vite-system-props-plugin.js.
declare module 'virtual:system-props' {
  import type { ComponentPropsDoc } from '@/studio/systemDocs';
  const props: Record<string, ComponentPropsDoc[]>;
  export default props;
}
