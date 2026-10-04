/** @lofi */

const blocks = [
  { title: 'Introduction', purpose: 'What is Design Studio?', content: 'Product promise · One sentence of context · Get started', space: 'py-8' },
  { title: 'Examples', purpose: 'What can I make with it?', content: 'View / Diagram / Canvas / Document · One product preview', space: 'py-12' },
  { title: 'Install', purpose: 'How do I run it?', content: 'Repository · mise prerequisite · Clone, install, and run commands', space: 'py-8' },
  { title: 'Usage', purpose: 'What do I do next?', content: 'Configure the studio · Bring a system · Setup guide', space: 'py-8' },
  { title: 'Reference', purpose: 'Where can I learn more?', content: 'Project brief · Marketing system · GitHub', space: 'py-6' },
];

export default function LandingWireframe() {
  return <main className="mx-auto max-w-3xl px-6 py-8 text-text-primary">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-lg font-semibold">Landing page structure</h1><span className="text-sm text-text-tertiary">Human / Agent</span></header>
    <div className="flex flex-col gap-4">{blocks.map((block, index) => <section key={block.title} className={`rounded-lg border border-dashed border-border-primary bg-bg-secondary px-6 ${block.space}`}>
      <h2 className="text-xl font-medium">{index + 1}. {block.title}</h2>
      <p className="mt-3 text-md text-text-secondary">{block.purpose}</p>
      <p className="mt-3 text-sm leading-relaxed text-text-tertiary">{block.content}</p>
    </section>)}</div>
  </main>;
}
