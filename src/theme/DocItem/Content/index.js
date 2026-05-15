import React from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import Heading from "@theme/Heading";
import MDXContent from "@theme/MDXContent";
import DocPageCopyDropdown from "@site/src/components/DocPageCopyDropdown";

function useSyntheticTitle() {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === "undefined";
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

export default function DocItemContent({ children }) {
  const syntheticTitle = useSyntheticTitle();
  const { frontMatter } = useDoc();

  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, "markdown")}>
      <div className="doc-page-content-with-actions">
        {!frontMatter.hide_copy_dropdown && (
          <div className="doc-page-copy-actions">
            <DocPageCopyDropdown />
          </div>
        )}
        <MDXContent>{children}</MDXContent>
      </div>
    </div>
  );
}
