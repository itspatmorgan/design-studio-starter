// A fitted, read-only picture of a canvas. No editor, saving, remembered camera, or agent API.
import { useEffect, useMemo, useState } from 'react';
import { Excalidraw, restoreElements, CaptureUpdateAction, getCommonBounds } from '@excalidraw/excalidraw';
import type { AppState, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import type { EmbedProps } from '@/platform/app/data/fileTypeModule';
import { readSource } from '@/platform/app/data/files';
import { rootOf } from '@/platform/core/roots';
import { useManifest } from '@/platform/app/data/useManifest';
import { canvasFiles } from './loader';
import { parseCanvas } from './format';
import { CanvasItem, validateEmbed } from './embeds';
import '@excalidraw/excalidraw/index.css';
import './canvas.css';

export default function CanvasEmbed({ proto, item, width, height }: EmbedProps) {
  const manifest = useManifest();
  const [text, setText] = useState<string>();
  const [error, setError] = useState(false);
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let active = true;
    let revision = 0;
    setText(undefined); setError(false);
    const load = async () => {
      const request = ++revision;
      try {
        const content = import.meta.env.DEV ? (await readSource(proto, item.path)).content
          : await canvasFiles[`/${rootOf(proto.contributorKey, proto.id)}/${item.path}`]?.();
        if (active && request === revision) { setText(content); setError(content === undefined); }
      } catch { if (active && request === revision) setError(true); }
    };
    const changed = (file: { contributor: string; prototype: string; path: string }) => {
      if (file.contributor === proto.contributorKey && file.prototype === proto.id && file.path === item.path) void load();
    };
    void load();
    import.meta.hot?.on('studio:file', changed);
    return () => { active = false; import.meta.hot?.off('studio:file', changed); };
  }, [proto, item]);
  const scene = useMemo(() => {
    if (text === undefined) return null;
    try {
      const parsed = parseCanvas(text);
      return { elements: restoreElements(parsed.elements as never, null, { refreshDimensions: true }), background: parsed.background };
    } catch { return null; }
  }, [text]);
  const camera = useMemo(() => {
    if (!scene?.elements.length) return { scrollX: 0, scrollY: 0, zoom: { value: 1 as AppState['zoom']['value'] } };
    const [left, top, right, bottom] = getCommonBounds(scene.elements);
    const zoom = Math.min(1, Math.max(0.01, 0.9 * Math.min(width / (right - left || 1), height / (bottom - top || 1))));
    return { scrollX: width / (2 * zoom) - (left + right) / 2, scrollY: height / (2 * zoom) - (top + bottom) / 2, zoom: { value: zoom as AppState['zoom']['value'] } };
  }, [scene, width, height]);
  useEffect(() => {
    if (!api || !scene) return;
    api.updateScene({ elements: scene.elements, appState: { viewBackgroundColor: scene.background, ...camera }, captureUpdate: CaptureUpdateAction.NEVER });
  }, [api, scene, camera]);
  if (error || (text !== undefined && !scene)) return <p role="alert" className="p-4 text-sm">This canvas could not load. Open it to inspect its source.</p>;
  if (!scene) return <p role="status" className="p-4 text-sm">Loading canvas…</p>;
  return <div className="canvas canvas-preview relative overflow-hidden" data-controls-hidden="" style={{ width, height, pointerEvents: 'none' }} aria-hidden>
    <Excalidraw excalidrawAPI={setApi} initialData={{ elements: scene.elements, appState: { ...camera, viewBackgroundColor: scene.background } }} viewModeEnabled zenModeEnabled theme={dark ? 'dark' : 'light'}
      validateEmbeddable={validateEmbed}
      renderEmbeddable={(element) => <CanvasItem element={element} manifest={manifest} current={proto} offscreen={false} overview={false} mounted />}
    />
  </div>;
}
