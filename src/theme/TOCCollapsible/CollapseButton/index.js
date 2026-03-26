import React from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

export default function TOCCollapsibleCollapseButton({collapsed, ...props}) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'clean-btn',
        'toc-mobile-collapse-btn',
        styles.tocCollapsibleButton,
        !collapsed && styles.tocCollapsibleButtonExpanded,
        props.className,
      )}>
      <span className={styles.tocCollapsibleButtonLabel}>
        <Translate
          id="theme.TOCCollapsible.toggleButtonLabel"
          description="The label used by the button on the collapsible TOC component">
          On this page
        </Translate>
      </span>
    </button>
  );
}
