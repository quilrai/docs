import React, {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

// The docs layout scrolls an inner element, not the window: `.doc-main` in
// src/css/custom.css is `height: calc(100vh - 68px)` with `overflow-y: scroll`
// so the panel fills the viewport and the footer can pin to the bottom.
//
// Docusaurus resets the WINDOW scroll on navigation, and the window is always
// at 0 here, so that reset does nothing. The inner container keeps whatever
// scroll position it had, which is why following a link from the bottom of a
// page landed you partway down the next one.
//
// Reset the real scroll container on navigation instead. Hash links are left
// alone so in-page anchors and deep links still land on their heading.
export default function Root({children}) {
  const {pathname, hash} = useLocation();

  useEffect(() => {
    if (hash) {
      return;
    }
    // Wait for the new route to paint before resetting, otherwise the scroll
    // is applied to the outgoing page and immediately overwritten.
    const frame = requestAnimationFrame(() => {
      document.querySelectorAll('.doc-main').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return <>{children}</>;
}
