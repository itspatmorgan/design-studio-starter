import { getRouteApi } from '@tanstack/react-router';

const rootApi = getRouteApi('__root__');

// The manifest, current: it updates as files are added, renamed and removed in dev.
export const useManifest = () => rootApi.useLoaderData();
