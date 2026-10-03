// A diagram image on its own line becomes a file embed, not an image URL request.
const isDiagram = (node) => node.tagName === 'img' && typeof node.properties?.src === 'string' && /\.(mermaid|mmd)(?:[?#]|$)/i.test(node.properties.src);
export default function diagramFiles() {
  return function walk(node) {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.tagName === 'p' && child.children?.length === 1 && isDiagram(child.children[0])) {
        const image = child.children[0];
        return { type: 'element', tagName: 'diagram-file', properties: { source: image.properties.src, label: image.properties.alt || 'Diagram' }, children: [] };
      }
      // Inline diagram references stay links, so block previews never nest inside paragraphs.
      if (isDiagram(child)) return { type: 'element', tagName: 'a', properties: { href: child.properties.src }, children: [{ type: 'text', value: child.properties.alt || 'Diagram' }] };
      walk(child);
      return child;
    });
  };
}
