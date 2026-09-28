import '../styles/index.css';
import { useEffect, useState } from 'react';
import Index from './Index.jsx';
import PrototypeViewer from './PrototypeViewer.jsx';
import SystemsPage from './SystemsPage.jsx';
import MainNav from './MainNav.jsx';
import { TooltipProvider } from '@/studio/components/tooltip';

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

export default function App() {
  const [params, setParams] = useState(readUrl);
  const manifest = useManifest();
  useEffect(() => {
    const onPop = () => setParams(readUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  let page;
  if (params.page === 'systems') page = <SystemsPage />;
  else if (params.contributor && params.prototype) page = <PrototypeViewer params={params} manifest={manifest} />;
  else page = <Index manifest={manifest} />;

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden">
        <MainNav page={params.page} />
        <div className="flex min-w-0 flex-1 flex-col overflow-auto">{page}</div>
      </div>
    </TooltipProvider>
  );
}
