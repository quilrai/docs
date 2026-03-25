import React, {useState} from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import {useKeyboardNavigation} from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import {DocFooterEmbeddedSetterContext} from '@site/src/theme/DocFooterEmbeddedContext';
import styles from './styles.module.css';

export default function Layout(props) {
  const {
    children,
    noFooter,
    wrapperClassName,
    title,
    description,
  } = props;

  const [docFooterEmbedded, setDocFooterEmbedded] = useState(false);
  const showFooterInLayout = !noFooter && !docFooterEmbedded;

  useKeyboardNavigation();

  return (
    <LayoutProvider>
      <PageMetadata title={title} description={description} />

      <SkipToContent />

      <AnnouncementBar />

      <Navbar />

      <DocFooterEmbeddedSetterContext.Provider value={setDocFooterEmbedded}>
        <div
          id={SkipToContentFallbackId}
          className={clsx(
            ThemeClassNames.layout.main.container,
            ThemeClassNames.wrapper.main,
            styles.mainWrapper,
            wrapperClassName,
          )}>
          <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
            {children}
          </ErrorBoundary>
        </div>

        {showFooterInLayout && <Footer />}
      </DocFooterEmbeddedSetterContext.Provider>
    </LayoutProvider>
  );
}
