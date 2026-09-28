import { createContext, useContext } from 'react';

export const PortalContext = createContext(null);
export const usePortalContainer = () => useContext(PortalContext);
