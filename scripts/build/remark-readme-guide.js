// A README that is also a Guide page: the Guide shows what a person using the app needs, and the README keeps the rest
// for whoever works on the code. In a file named README.md, the first heading (the README's title, which the page already
// has) and everything from the "For developers" heading on are left out of the page. Other Markdown files are untouched.
const textOf = (node) => (typeof node.value === 'string' ? node.value : (node.children ?? []).map(textOf).join(''));

export default function remarkReadmeGuide({ full = false } = {}) {
  return (tree, file) => {
    if ((file?.basename ?? file?.path?.split(/[\\/]/).pop()) !== 'README.md') return;
    const cut = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 2 && /^for developers$/i.test(textOf(n).trim()));
    if (!full && cut >= 0) tree.children.splice(cut);
    const first = tree.children.find((n) => n.type !== 'yaml');
    if (first?.type === 'heading' && first.depth === 1) tree.children.splice(tree.children.indexOf(first), 1);
  };
}
