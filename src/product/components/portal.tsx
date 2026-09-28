import { createContext, useContext } from 'react';

// The element product overlays (dialogs, popovers) portal into, so they stay inside .product-theme.
export const PortalContext = createContext<HTMLElement | null>(null);
export const usePortalContainer = () => useContext(PortalContext);
