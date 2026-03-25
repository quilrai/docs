import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames, usePrismTheme} from '@docusaurus/theme-common';
import {getPrismCssVariables} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

export default function CodeBlockContainer({as: As, ...props}) {
  const prismTheme = usePrismTheme();
  const prismCssVariables = getPrismCssVariables(prismTheme);
  return (
    <As
      {...props}
      style={prismCssVariables}
      className={clsx(
        props.className,
        styles.codeBlockContainer,
        ThemeClassNames.common.codeBlock,
        'not-prose',
      )}
    />
  );
}
