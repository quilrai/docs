import React, {useEffect} from 'react';
import clsx from 'clsx';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import Footer from '@theme/Footer';
import {useDocFooterEmbeddedSetter} from '@site/src/theme/DocFooterEmbeddedContext';
import styles from './styles.module.css';

export default function DocRootLayoutMain({hiddenSidebarContainer, children}) {
  const sidebar = useDocsSidebar();
  const setDocFooterEmbedded = useDocFooterEmbeddedSetter();

  useEffect(() => {
    setDocFooterEmbedded(true);
    return () => setDocFooterEmbedded(false);
  }, [setDocFooterEmbedded]);
  return (
    <main
      className={clsx(
        'doc-main',
        styles.docMainContainer,
        (hiddenSidebarContainer || !sidebar) && styles.docMainContainerEnhanced,
      )}>
      <div
        className={clsx(
          'container padding-top--md padding-bottom--lg doc-main__panel',
          styles.docItemWrapper,
          hiddenSidebarContainer && styles.docItemWrapperEnhanced,
        )}>
        {children}
        <div className={clsx(styles.docFooter, 'doc-page-footer')}>
          <Footer />
        </div>
      </div>
    </main>
  );
}
