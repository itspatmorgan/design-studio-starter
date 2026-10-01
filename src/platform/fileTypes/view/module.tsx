// How the app opens a view: its component, in its prototype system's theme.
import { CodeIcon } from '@hugeicons/core-free-icons';
import type { FileTypeModule } from '@/platform/app/data/fileTypeModule';
import { loadView } from './load';
import ViewEmbed from './ViewEmbed';
import ViewFrame from './ViewFrame';

export default {
  icon: CodeIcon,
  load: loadView,
  Page: ViewFrame,
  Embed: ViewEmbed,
} satisfies FileTypeModule;
