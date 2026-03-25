import React, {createContext, useContext} from 'react';

/** When docs layout is active, footer renders inside doc main container instead of Layout. */
export const DocFooterEmbeddedSetterContext = createContext(() => {});

export function useDocFooterEmbeddedSetter() {
  return useContext(DocFooterEmbeddedSetterContext);
}
