import React, {useEffect, useRef} from 'react';
import Tabs from '@theme-original/Tabs';
import useIsBrowser from '@docusaurus/useIsBrowser';

export default function ModeAwareTabs(props) {
  const container = useRef(null);
  const isBrowser = useIsBrowser();

  useEffect(() => {
    if (!isBrowser || props.groupId !== 'gateway-configuration-mode') return undefined;
    let selectingTarget = false;

    const revealTarget = () => {
      let id;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = id && document.getElementById(id);
      if (!target || !container.current?.contains(target)) return;
      const tabRoot = container.current.querySelector('.tabs-container');
      if (!tabRoot) return;
      const panels = Array.from(tabRoot.querySelectorAll('[role="tabpanel"]')).filter(
        (panel) => panel.closest('.tabs-container') === tabRoot,
      );
      const panel = panels.find((candidate) => candidate.contains(target));
      if (!panel?.hidden) return;

      // Existing links may point into the mode hidden by the saved preference.
      const index = panels.indexOf(panel);
      const tabs = tabRoot.querySelector('[role="tablist"]')?.children;
      if (index < 0 || !tabs?.[index]) return;
      selectingTarget = true;
      try {
        tabs[index].click();
      } finally {
        selectingTarget = false;
      }
      window.requestAnimationFrame(() => target.scrollIntoView());
    };

    let observer;
    const stopWatching = () => observer?.disconnect();
    const watchTarget = () => {
      stopWatching();
      if (!window.location.hash || !container.current) return;
      // Hydration can restore a saved mode after the first render.
      observer = new MutationObserver(revealTarget);
      observer.observe(container.current, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['hidden'],
      });
      revealTarget();
    };
    const respectInteraction = (event) => {
      if (selectingTarget) return;
      stopWatching();
      const link = event.type === 'click' && event.target.closest?.('a[href]');
      if (link?.hash && link.hash === window.location.hash
        && link.origin === window.location.origin
        && link.pathname === window.location.pathname
        && link.search === window.location.search) {
        window.requestAnimationFrame(watchTarget);
      }
    };
    watchTarget();
    window.addEventListener('hashchange', watchTarget);
    window.addEventListener('click', respectInteraction, true);
    window.addEventListener('keydown', respectInteraction, true);
    return () => {
      stopWatching();
      window.removeEventListener('hashchange', watchTarget);
      window.removeEventListener('click', respectInteraction, true);
      window.removeEventListener('keydown', respectInteraction, true);
    };
  }, [isBrowser, props.groupId]);

  if (props.groupId !== 'gateway-configuration-mode') return <Tabs {...props} />;
  return (
    <div ref={container}>
      <Tabs {...props} />
    </div>
  );
}
