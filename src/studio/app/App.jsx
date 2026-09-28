import '../styles/index.css';
import { useEffect, useState } from 'react';
import Index, { firstView } from './Index.jsx';
import PrototypeViewer, { viewLabel } from './PrototypeViewer.jsx';
import SystemsPage from './SystemsPage.jsx';
import MainNav from './MainNav.jsx';
import { TooltipProvider } from '@/studio/components/tooltip';
import { CommandPaletteProvider } from './CommandPalette.jsx';
import { useColorMode, useSectionNav } from './appPrefs.js';

const readUrl = () => Object.fromEntries(new URLSearchParams(location.search));

function useManifest() {
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}prototypes/manifest.json`)
      .then((r) => r.json())
      .then(setManifest)
      .catch(() => setManifest({ prototypes: [] }));
  }, []);
  return manifest;
}

const APP_NAME = 'Prototype Sandbox';

// The browser tab names the page: "Hello World — Main — Prototype Sandbox".
function pageTitle(params, manifest) {
  if (params.page === 'systems') return `Systems — ${APP_NAME}`;
  const proto = manifest?.prototypes.find((p) => p.contributorKey === params.contributor && p.id === params.prototype);
  if (!proto) return `Prototypes — ${APP_NAME}`;
  const view = params.view ?? firstView(proto)?.name;
  return [proto.title, view && viewLabel(view), APP_NAME].filter(Boolean).join(' — ');
}

export default function App() {
  const [params, setParams] = useState(readUrl);
  const manifest = useManifest();
  useEffect(() => {
    const onPop = () => setParams(readUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const { colorMode, toggleColorMode } = useColorMode();
  const sectionNav = useSectionNav();
  const inPrototype = Boolean(params.contributor && params.prototype);

  useEffect(() => {
    document.title = pageTitle(params, manifest);
  }, [params, manifest]);

  let page;
  if (params.page === 'systems') page = <SystemsPage />;
  else if (inPrototype) page = <PrototypeViewer params={params} manifest={manifest} sectionNavOpen={sectionNav.open} />;
  else page = <Index manifest={manifest} search={params.q} />;

  return (
    <TooltipProvider>
      <CommandPaletteProvider params={params} manifest={manifest}>
        <div className="flex h-screen overflow-hidden">
          <MainNav
            page={params.page}
            colorMode={colorMode}
            onToggleColorMode={toggleColorMode}
            sectionNav={inPrototype ? sectionNav : null}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-auto">{page}</div>
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
