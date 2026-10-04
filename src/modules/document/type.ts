import { defineFileType, markdownFileType } from '../../platform/core/fileTypes.ts';

// Markdown within a prototype is an optional capability.
export default defineFileType({ ...markdownFileType });
