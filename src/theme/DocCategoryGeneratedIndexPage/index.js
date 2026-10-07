import React from 'react';
import clsx from 'clsx';
import {PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import {useCurrentSidebarCategory} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';

function DocCategoryGeneratedIndexPageMetadata({categoryGeneratedIndex}) {
  return (
    <PageMetadata
      title={categoryGeneratedIndex.title}
      description={categoryGeneratedIndex.description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

function DocCategoryGeneratedIndexPageContent({categoryGeneratedIndex}) {
  const category = useCurrentSidebarCategory();
  return (
    <>
      <DocVersionBanner />
      <article>
        <DocBreadcrumbs />
        <DocVersionBadge />
        <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
          <header>
            <Heading as="h1">{categoryGeneratedIndex.title}</Heading>
            {categoryGeneratedIndex.description && (
              <p>{categoryGeneratedIndex.description}</p>
            )}
          </header>
        </div>
        <div className="not-prose margin-top--lg">
          <DocCardList items={category.items} />
        </div>
      </article>
      <footer className="margin-top--md">
        <DocPaginator
          previous={categoryGeneratedIndex.navigation.previous}
          next={categoryGeneratedIndex.navigation.next}
        />
      </footer>
    </>
  );
}

export default function DocCategoryGeneratedIndexPage(props) {
  return (
    <>
      <DocCategoryGeneratedIndexPageMetadata {...props} />
      <div className="row">
        <div className="col">
          <DocCategoryGeneratedIndexPageContent {...props} />
        </div>
      </div>
    </>
  );
}
