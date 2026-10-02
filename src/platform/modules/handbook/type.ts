import { defineFileType, markdownFileType } from '../../core/fileTypes.ts';

// The Handbook keeps Markdown support when prototype Documents is disabled or removed.
export default defineFileType({ ...markdownFileType, inPrototype: false, inHandbook: true });
