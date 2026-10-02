// A text file: any file in the Handbook (src/handbook/) that no other type claims, like a script in a
// skill's folder. It opens read-only as its text. It has no extensions of its own and prototypes
// don't use it: a prototype's other files stay plain files.
import { defineFileType } from '../../core/fileTypes.ts';

export default defineFileType({
  label: 'Text file',
  extensions: [],
  language: 'text',
  fallback: true,
});
