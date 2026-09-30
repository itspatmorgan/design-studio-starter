// A Markdown file's title is the `title` in its frontmatter. In plain Markdown (and in a skill's
// SKILL.md, whose format has no title) it is usually the first heading, so when there's no `title`
// and the file opens with a level-1 heading, that heading becomes the title and leaves the body:
// the page then shows its title, its description, and its content, in that order.
// Runs before remark-mdx-frontmatter, which reads the frontmatter this edits.
const textOf = (node) => (typeof node.value === 'string' ? node.value : (node.children ?? []).map(textOf).join(''));

export default function remarkTitleFromHeading() {
  return (tree) => {
    const at = tree.children.findIndex((n) => n.type !== 'yaml');
    const heading = tree.children[at];
    if (!heading || heading.type !== 'heading' || heading.depth !== 1) return;
    const title = textOf(heading).trim();
    if (!title) return;
    const yaml = tree.children.find((n) => n.type === 'yaml');
    if (yaml && /^title\s*:/m.test(yaml.value)) return;
    // A JSON string is a valid YAML string, so quotes and colons in a title are safe.
    const line = `title: ${JSON.stringify(title)}`;
    if (yaml) yaml.value = yaml.value ? `${yaml.value}\n${line}` : line;
    else tree.children.unshift({ type: 'yaml', value: line });
    tree.children.splice(tree.children.indexOf(heading), 1);
  };
}
