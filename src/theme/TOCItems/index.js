import React, { useEffect, useMemo, useRef } from "react";
import { useThemeConfig } from "@docusaurus/theme-common";
import { useFilteredAndTreeifiedTOC } from "@docusaurus/theme-common/internal";
import TOCItemTree from "@theme/TOCItems/Tree";

function getAnchors({ minHeadingLevel, maxHeadingLevel }) {
  const selectors = [];

  for (let i = minHeadingLevel; i <= maxHeadingLevel; i += 1) {
    selectors.push(`h${i}.anchor`);
  }

  return Array.from(document.querySelectorAll(selectors.join(",")));
}

function getLinkAnchorValue(link) {
  return decodeURIComponent(link.href.substring(link.href.indexOf("#") + 1));
}

function getLinks(linkClassName) {
  return Array.from(document.getElementsByClassName(linkClassName));
}

// Activation line, in viewport coordinates: a heading becomes "active" once its
// top crosses below this line. Anchored to the sticky navbar so it is correct
// regardless of whether the window or an inner panel (.doc-main) is scrolling.
function getActivationLine() {
  const navbar = document.querySelector(".navbar");
  const navbarHeight = navbar ? navbar.clientHeight : 0;
  return navbarHeight + 96;
}

// True when whichever element owns the scroll is within a few px of its end.
// A short final section can never push its heading past the activation line,
// so without this the second-to-last heading stays highlighted at the bottom.
function isScrolledToBottom() {
  const SLOP = 2;
  const candidates = [
    document.querySelector(".doc-main"),
    document.scrollingElement,
  ];

  for (const el of candidates) {
    if (!el) {
      continue;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isScrollable = scrollHeight - clientHeight > SLOP;
    if (isScrollable && scrollTop + clientHeight >= scrollHeight - SLOP) {
      return true;
    }
  }

  return false;
}

function getActiveAnchor(anchors) {
  if (anchors.length === 0) {
    return null;
  }

  // At the very bottom, always highlight the last heading regardless of where
  // its top sits relative to the activation line.
  if (isScrolledToBottom()) {
    return anchors[anchors.length - 1];
  }

  const activationLine = getActivationLine();
  let activeAnchor = null;

  for (const anchor of anchors) {
    // getBoundingClientRect().top is viewport-relative, so it reflects the
    // real on-screen position no matter which element is the scroll container.
    if (anchor.getBoundingClientRect().top <= activationLine) {
      activeAnchor = anchor;
    } else {
      break;
    }
  }

  // Before the first heading crosses the line, keep the first one highlighted.
  return activeAnchor ?? anchors[0];
}

function useScrollRootTOCHighlight(config) {
  const lastActiveLinkRef = useRef();

  useEffect(() => {
    if (!config) {
      return () => {};
    }

    const {
      linkClassName,
      linkActiveClassName,
      minHeadingLevel,
      maxHeadingLevel,
    } = config;

    function updateLinkActiveClass(link, active) {
      if (active) {
        if (lastActiveLinkRef.current && lastActiveLinkRef.current !== link) {
          lastActiveLinkRef.current.classList.remove(linkActiveClassName);
        }

        link.classList.add(linkActiveClassName);
        lastActiveLinkRef.current = link;
      } else {
        link.classList.remove(linkActiveClassName);
      }
    }

    function updateActiveLink() {
      const links = getLinks(linkClassName);
      const anchors = getAnchors({ minHeadingLevel, maxHeadingLevel });
      const activeAnchor = getActiveAnchor(anchors);
      const activeLink = links.find(
        (link) => activeAnchor && activeAnchor.id === getLinkAnchorValue(link),
      );

      links.forEach((link) => {
        updateLinkActiveClass(link, link === activeLink);
      });
    }

    let frame = null;
    function scheduleUpdate() {
      if (frame !== null) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updateActiveLink();
      });
    }

    // Capture-phase scroll catches scroll events from ANY scroll container
    // (the doc panel uses an inner overflow scroller, so scroll never reaches
    // window/document in the bubble phase).
    document.addEventListener("scroll", scheduleUpdate, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdate);

    updateActiveLink();

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      document.removeEventListener("scroll", scheduleUpdate, {
        capture: true,
      });
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [config]);
}

export default function TOCItems({
  toc,
  className = "table-of-contents table-of-contents__left-border",
  linkClassName = "table-of-contents__link",
  linkActiveClassName = undefined,
  minHeadingLevel: minHeadingLevelOption,
  maxHeadingLevel: maxHeadingLevelOption,
  ...props
}) {
  const themeConfig = useThemeConfig();

  const minHeadingLevel =
    minHeadingLevelOption ?? themeConfig.tableOfContents.minHeadingLevel;
  const maxHeadingLevel =
    maxHeadingLevelOption ?? themeConfig.tableOfContents.maxHeadingLevel;

  const tocTree = useFilteredAndTreeifiedTOC({
    toc,
    minHeadingLevel,
    maxHeadingLevel,
  });

  const tocHighlightConfig = useMemo(() => {
    if (linkClassName && linkActiveClassName) {
      return {
        linkClassName,
        linkActiveClassName,
        minHeadingLevel,
        maxHeadingLevel,
      };
    }

    return undefined;
  }, [linkClassName, linkActiveClassName, minHeadingLevel, maxHeadingLevel]);

  useScrollRootTOCHighlight(tocHighlightConfig);

  return (
    <TOCItemTree
      toc={tocTree}
      className={className}
      linkClassName={linkClassName}
      {...props}
    />
  );
}
