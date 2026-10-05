import type { ReactNode } from 'react';
import { ArrowUpRight } from '@untitledui/icons';
import { Button } from '@/systems/marketing/components/button';
import { Tabs } from '@/systems/marketing/components/tabs';
import { ArtifactPreview, StudioPreview } from './demo-previews';
import agentMarkdown from './agent.txt?raw';
import styles from './landing.module.css';

const repository = 'https://github.com/itspatmorgan/design-studio-starter';
const examples = [
  { id: 'view', label: 'View', text: 'Build a working interface with your own components.' },
  { id: 'diagram', label: 'Diagram', text: 'Make the system and its flows easier to understand.' },
  { id: 'canvas', label: 'Canvas', text: 'Explore ideas and arrange references on an open canvas.' },
  { id: 'document', label: 'Document', text: 'Keep the reasoning and references alongside the work.' },
] as const;
function StudioMark({ small = false }: { small?: boolean }) {
  return <svg viewBox="0 0 40 32" className={small ? styles.smallMark : "h-8 w-10"} aria-hidden="true" fill="currentColor"><path d="M0 0h11v32H0zM15 0h3a16 16 0 0 1 0 32h-3z" /></svg>;
}
function ResourceLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('https://');
  return <Button href={href} color="link-gray" size="sm" iconTrailing={ArrowUpRight} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</Button>;
}
function BrandGeometry({ version }: { version: 2 | 3 }) {
  return <svg viewBox="0 0 480 320" className={styles.geometry} aria-hidden="true">
    <rect width="480" height="320" fill="var(--color-bg-secondary)" />
    {version === 2 ? <>
      <circle cx="240" cy="160" r="150" fill="currentColor" opacity="0.12" />
      <rect x="240" width="120" height="160" fill="currentColor" opacity="0.18" />
      <rect x="360" y="160" width="120" height="160" fill="currentColor" />
      <path d="M0 160H480M240 0V320" stroke="currentColor" opacity="0.3" strokeDasharray="2 6" />
    </> : <>
      <rect x="320" width="160" height="160" fill="currentColor" opacity="0.1" />
      <rect x="160" y="160" width="160" height="160" fill="currentColor" opacity="0.2" />
      <rect x="320" y="160" width="160" height="160" fill="currentColor" />
      <path d="M0 0A320 320 0 0 1 320 320M0 0A160 160 0 0 1 160 160" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M160 0V320M320 0V320M0 160H480" stroke="currentColor" opacity="0.3" strokeDasharray="2 6" />
    </>}
  </svg>;
}
export function LandingPage({ version }: { version: 1 | 2 | 3 }) {
  const headlines = { 1: <>Your next idea.<br />Make it real.</>, 2: <>A studio for<br />what comes next.</>, 3: <>Design. Build.<br />Together.</> };
  const content = <>
        <main>
          <section className={`${styles.hero} ${styles['hero' + version]}`}>
            <div className={styles.heroCopy}>
            <h1 className="text-display-md font-medium tracking-tight md:text-display-lg">{headlines[version]}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-tertiary">An open-source prototype sandbox for designers and builders. Work with your coding agent, your components, and your context.</p>
            <div className="mt-6"><Button href="#install" size="lg">Get started</Button></div>
            </div>
            {version > 1 && <BrandGeometry version={version as 2 | 3} />}
          </section>
          <section className="py-8 md:py-12" aria-labelledby="demo-title">
            <h2 id="demo-title" className="text-display-sm font-medium tracking-tight">{version === 1 ? 'From an idea to a working prototype.' : version === 2 ? 'Give the idea room to move.' : 'One idea. Every part of the story.'}</h2>
            <Tabs defaultSelectedKey={version === 2 ? 'canvas' : 'view'} className="mt-6">
              <Tabs.List aria-label="Artifact examples">{examples.map(item => <Tabs.Item key={item.id} id={item.id}>{version === 3 && item.id === 'view' ? 'Interactive prototype' : item.label}</Tabs.Item>)}</Tabs.List>
              {examples.map(item => <Tabs.Panel key={item.id} id={item.id} className="pt-5">
                <figure><ArtifactPreview kind={item.id} /><figcaption className="mt-4 text-md text-text-secondary">{item.text}</figcaption></figure>
              </Tabs.Panel>)}
            </Tabs>
            <p className="mt-3 text-sm text-text-tertiary">Self-contained examples rendered in code. Try selecting and resolving feedback in the inbox.</p>
          </section>
          <section id="install" className="py-16 md:py-20">
            <h2 className="text-display-sm font-medium tracking-tight">Run your own studio.</h2>
            <ol className={styles.steps}>
              <li><h3 className="text-lg font-semibold">Create your repository.</h3>
                <p>On GitHub, choose “Use this template” → “Create a new repository”. Select your account or organization, give your studio a repository name, and choose its visibility.</p>
                <ResourceLink href={repository}>Use the template</ResourceLink>
              </li>
              <li><h3 className="text-lg font-semibold">Bring it onto your computer.</h3>
                <p>In your new repository, open “Code” and copy the HTTPS clone URL. Run these commands in your terminal, using that URL and the repository name you chose.</p>
                <pre className={styles.code}><code>{`git clone https://github.com/YOUR-ACCOUNT/YOUR-STUDIO.git\ncd YOUR-STUDIO`}</code></pre>
              </li>
              <li><h3 className="text-lg font-semibold">Install and start Studio.</h3>
                <p>Install mise if needed, then run these commands from your repository folder.</p>
                <ResourceLink href="https://mise.jdx.dev/installing-mise.html">Install mise</ResourceLink>
                <pre className={styles.code}><code>{`mise install\nmise exec -- pnpm install\nmise exec -- pnpm dev`}</code></pre>
                <p><code>mise install</code> installs the Node.js and pnpm versions this project uses. <code>pnpm install</code> installs its dependencies. <code>pnpm dev</code> starts the local development server.</p>
                <p>The <code>mise exec --</code> prefix runs pnpm with the project's tool versions. If mise is already activated in your shell, you can use <code>pnpm install</code> and <code>pnpm dev</code> directly.</p>
                <p>Open the local URL printed in your terminal. Keep the server running while you use Studio.</p>
              </li>
            </ol>
          </section>
          <section className="pb-16 md:pb-20">
            <h2 className="text-display-sm font-medium tracking-tight">Make it yours.</h2>
            <p className="mt-5 max-w-2xl text-md leading-relaxed text-text-tertiary">Open your repository folder in the editor or coding agent you already use, and run Studio alongside it. Ask your agent to configure your studio, bring your design system, or start a prototype. Review the results in your browser.</p>
            <div className="mt-4"><ResourceLink href="/documentation/guide/getting-started">Follow the setup guide</ResourceLink></div>
            <figure className="mt-6"><StudioPreview /><figcaption className="mt-3 text-sm text-text-tertiary">An example of how your prototypes and design system come together.</figcaption></figure>
          </section>
        </main>
        <footer className="pb-12"><p className="text-sm leading-relaxed text-text-tertiary">This marketing demo uses its own Marketing system: Geist, warm neutrals, and Untitled UI.</p><div className="mt-4 flex flex-wrap gap-6"><ResourceLink href="/systems/marketing">Marketing system</ResourceLink><ResourceLink href={repository}>GitHub</ResourceLink></div></footer>
  </>;
  const brand = <a href="#" className="flex items-center gap-3 text-lg font-semibold"><StudioMark small={version === 3} />Design Studio</a>;
  return <div className="min-h-full bg-bg-primary font-sans text-text-primary">
    {version === 3 ? <Tabs defaultSelectedKey="human" className="mx-auto max-w-4xl px-6">
      <header className="flex flex-wrap items-center justify-between gap-6 py-8">{brand}<Tabs.List aria-label="Reading mode" className={styles.modeList}><Tabs.Item id="human" className={styles.modeTab}>Human</Tabs.Item><Tabs.Item id="agent" className={styles.modeTab}>Agent</Tabs.Item></Tabs.List></header>
      <Tabs.Panel id="human">{content}</Tabs.Panel>
      <Tabs.Panel id="agent"><main className="pt-8 pb-16"><pre className={styles.markdown}>{agentMarkdown}</pre></main></Tabs.Panel>
    </Tabs> : <div className="mx-auto max-w-4xl px-6"><header className="py-8">{brand}</header>{content}</div>}
  </div>;
}
