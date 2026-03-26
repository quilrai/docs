import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import styles from './styles.module.css';

function AdmonitionContainer({type, className, children}) {
  return (
    <div
      className={clsx(
        'admonition-block',
        ThemeClassNames.common.admonition,
        ThemeClassNames.common.admonitionType(type),
        styles.admonition,
        className,
      )}>
      {children}
    </div>
  );
}

function AdmonitionHeading({icon, title}) {
  return (
    <div className={clsx(styles.admonitionHeading, 'admonition-block__heading')}>
      <span className={clsx(styles.admonitionIcon, 'admonition-block__icon')}>
        {icon}
      </span>
      {title}
    </div>
  );
}

function AdmonitionContent({children}) {
  return children ? (
    <div className={clsx(styles.admonitionContent, 'admonition-block__content')}>
      {children}
    </div>
  ) : null;
}

export default function AdmonitionLayout(props) {
  const {type, icon, title, children, className} = props;
  return (
    <AdmonitionContainer type={type} className={className}>
      {title || icon ? <AdmonitionHeading title={title} icon={icon} /> : null}
      <AdmonitionContent>{children}</AdmonitionContent>
    </AdmonitionContainer>
  );
}
