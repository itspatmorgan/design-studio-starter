// The Source view of an item (?mode=source): the file's text in a code editor, in the space the
// item's page normally fills. Dev only: it reads and saves through the file layer
// (scripts/vite-files-plugin.js), and isn't in the deployed site.
//
// In your own prototypes you can edit and save it (⌘S), like your agent editing the same file.
// In other people's it is read-only. If the file changes on disk while it's open, an unedited
// editor updates to match (you can watch an agent write), and an edited one asks first.
import { useEffect, useRef, useState } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { search, searchKeymap } from '@codemirror/search';
import { FILE_TYPES } from '@/studio/app/data/fileTypes';
import { readSource, SourceChanged, useMe, writeSource } from '@/studio/app/data/files';
import type { Item, Prototype } from '@/studio/app/data/types';
import { Button } from '@/studio/components/button';
import { sourceTheme } from '@/studio/app/pages/prototype/sourceTheme';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/components/dialog';

// The file type's syntax, loaded when it's needed.
async function languageExtension(language: 'tsx' | 'markdown'): Promise<Extension> {
  if (language === 'markdown') return (await import('@/studio/app/pages/prototype/mdxLanguage')).mdxLanguage();
  return (await import('@codemirror/lang-javascript')).javascript({ jsx: true, typescript: true });
}

type Disk = { content: string; version: string };

export default function SourcePane({ proto, item }: { proto: Prototype; item: Item }) {
  const me = useMe();
  const editable = me === proto.contributorKey;
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  // What's on disk as far as this pane knows: the text and version it last read or saved.
  const disk = useRef<Disk | null>(null);
  const dirty = useRef(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The file changed on disk while there were unsaved edits.
  const [conflict, setConflict] = useState<Disk | null>(null);
  const save = useRef<() => void>(() => {});

  // Leaving with unsaved edits (another item, Preview, a reload) asks first.
  const blocker = useBlocker({
    shouldBlockFn: () => dirty.current,
    enableBeforeUnload: () => dirty.current,
    withResolver: true,
  });

  // Replace the editor's text with the disk's, as a change the editor treats as clean.
  const takeDisk = (next: Disk) => {
    const v = view.current;
    if (!v) return;
    disk.current = next;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: next.content } });
    dirty.current = false;
    setIsDirty(false);
    setConflict(null);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await Promise.all([
        readSource(proto, item.path),
        languageExtension(FILE_TYPES[item.fileType].language!),
      ]).catch((e: Error) => { if (!cancelled) setError(e.message); return null; });
      if (cancelled || !loaded || !host.current) return;
      const [first, language] = loaded;
      disk.current = first;
      view.current = new EditorView({
        parent: host.current,
        state: EditorState.create({
          doc: first.content,
          extensions: [
            lineNumbers(), highlightActiveLine(), highlightActiveLineGutter(), drawSelection(),
            history(), bracketMatching(), indentOnInput(), search({ top: true }),
            sourceTheme, language,
            ...(FILE_TYPES[item.fileType].language === 'markdown' ? [EditorView.lineWrapping] : []),
            EditorState.readOnly.of(!editable),
            EditorView.editable.of(editable),
            // Named for screen readers. A read-only editor isn't focusable by default, which would leave
            // it without ⌘F, go to line, and keyboard selection, so it gets a tab stop.
            EditorView.contentAttributes.of({ 'aria-label': `Source of ${item.path}`, ...(editable ? {} : { tabindex: '0' }) }),
            keymap.of([{ key: 'Mod-s', preventDefault: true, run: () => { save.current(); return true; } }, ...defaultKeymap, ...historyKeymap, ...searchKeymap]),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) return;
              const now = update.state.doc.toString() !== disk.current?.content;
              if (now !== dirty.current) { dirty.current = now; setIsDirty(now); }
            }),
          ],
        }),
      });
    })();
    return () => { cancelled = true; view.current?.destroy(); view.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proto.contributorKey, proto.id, item.path, editable]);

  // The file changed on disk. Our own saves come back here too, and are recognized by version.
  useEffect(() => {
    const hot = import.meta.hot;
    if (!hot) return;
    const onFile = async (change: { contributor: string; prototype: string; path: string }) => {
      if (change.contributor !== proto.contributorKey || change.prototype !== proto.id || change.path !== item.path) return;
      const next = await readSource(proto, item.path).catch(() => null);
      if (!next || !disk.current || next.version === disk.current.version) return;
      if (dirty.current) setConflict(next); else takeDisk(next);
    };
    hot.on('studio:file', onFile);
    return () => hot.off?.('studio:file', onFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proto.contributorKey, proto.id, item.path]);

  save.current = async () => {
    const v = view.current;
    if (!v || !editable || !dirty.current || !disk.current || saving) return;
    const content = v.state.doc.toString();
    setSaving(true);
    setError(null);
    try {
      const { version } = await writeSource(proto, item.path, content, disk.current.version);
      disk.current = { content, version };
      dirty.current = v.state.doc.toString() !== content;
      setIsDirty(dirty.current);
    } catch (e) {
      if (e instanceof SourceChanged) setConflict(await readSource(proto, item.path).catch(() => null));
      else setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
      {/* 56px of content plus the 1px border puts the text and Save at the same height as the
          navigation's title row and its buttons */}
      <div className="flex h-[57px] shrink-0 items-center gap-3 border-b border-border px-4 text-[12px]">
        <span className="min-w-0 truncate font-mono text-muted-foreground" title={`src/prototypes/${proto.contributorKey}/${proto.id}/${item.path}`}>{item.path}</span>
        <span className="ml-auto shrink-0 text-muted-foreground">{!editable ? 'Read-only' : isDirty ? 'Unsaved changes' : ''}</span>
        {editable && <Button size="sm" disabled={!isDirty || saving} onClick={() => save.current()} title="Save (⌘S)">{saving ? 'Saving…' : 'Save'}</Button>}
      </div>
      {conflict && (
        <div role="alert" className="flex shrink-0 items-center gap-3 border-b border-border bg-muted px-4 py-2 text-[12px]">
          <span className="min-w-0 flex-1">This file changed on disk while you were editing it.</span>
          <Button size="sm" variant="outline" onClick={() => takeDisk(conflict)}>Load the new version</Button>
          <Button size="sm" variant="outline" onClick={() => { disk.current = conflict; setConflict(null); }}>Keep mine</Button>
        </div>
      )}
      {error && <p role="alert" className="shrink-0 border-b border-border px-4 py-2 text-[12px] text-destructive">{error}</p>}
      <div ref={host} className="min-h-0 flex-1 overflow-hidden" />

      <Dialog open={blocker.status === 'blocked'} onOpenChange={(o) => { if (!o) blocker.reset?.(); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>You have unsaved changes to {item.path}. They'll be lost if you leave.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => blocker.reset?.()}>Keep editing</Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
