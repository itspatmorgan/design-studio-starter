import { SourceChanged, TAB_ID } from '@/platform/app/data/files';

export type GuideSource = { path: string; content: string; version: string };

async function request<T>(route: 'read' | 'write', body: object): Promise<T> {
  const response = await fetch(`/__studio/documentation/${route}`, {
    method: 'POST', signal: AbortSignal.timeout(10_000),
    headers: { 'Content-Type': 'application/json', 'X-Studio-Tab': TAB_ID },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (response.status === 409) throw new SourceChanged(result.error);
  if (!response.ok) throw new Error(result.error ?? 'Could not access this Guide source.');
  return result as T;
}

export const readGuideSource = (slug: string) => request<GuideSource>('read', { slug });
export const writeGuideSource = (slug: string, content: string, base: string) => request<{ version: string }>('write', { slug, content, base });
