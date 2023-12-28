import React from 'react';

export interface GridControlContextValue {
  addKeyDownListener: (listener: (e: KeyboardEvent) => void) => void;
  removeKeyDownListener: (listener: (e: KeyboardEvent) => void) => void;
}

export const GridControlContext = React.createContext<GridControlContextValue>({
  addKeyDownListener: () => {},
  removeKeyDownListener: () => {},
});
