// A capability chapter stays in the Guide but is exposed only while its module is enabled.
// Invalid metadata proceeds to manifest validation instead of silently hiding the chapter.
export function guideChapterEnabled(frontmatter, enabled) {
  return typeof frontmatter?.module !== 'string' || enabled.includes(frontmatter.module);
}
