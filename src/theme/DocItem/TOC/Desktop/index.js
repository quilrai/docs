import React from "react";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import Translate from "@docusaurus/Translate";
import TOC from "@theme/TOC";

// Swizzled to label the gutter rail. The TOC now floats in the panel's right
// gutter rather than sitting in a content column, so it needs a heading of its
// own to read as a component instead of a stray list of links.
export default function DocItemTOCDesktop() {
  const { toc, frontMatter } = useDoc();
  return (
    <div className="doc-toc-rail">
      <p className="doc-toc-rail__eyebrow">
        <Translate
          id="theme.TOCCollapsible.toggleButtonLabel"
          description="The label used by the button on the collapsible TOC component">
          On this page
        </Translate>
      </p>
      <TOC
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level}
        className={ThemeClassNames.docs.docTocDesktop}
      />
    </div>
  );
}
