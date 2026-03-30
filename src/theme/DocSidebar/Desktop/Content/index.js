import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import DocSidebarItems from '@theme/DocSidebarItems';
import SidebarThemeToggle from '@site/src/components/SidebarThemeToggle';
import SidebarLlmsTxt from '@site/src/components/SidebarLlmsTxt';

export default function DocSidebarDesktopContent({path, sidebar, className}) {
  return (
    <nav
      aria-label="Docs sidebar"
      className={clsx(
        'menu',
        ThemeClassNames.docs.docSidebarMenu,
        'sidebar-desktop-content',
        className,
      )}>
      <ul
        className={clsx(
          ThemeClassNames.docs.docSidebarMenu,
          'menu__list',
          'thin-scrollbar',
          'sidebar-desktop-content__menu',
        )}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} />
      </ul>
      <div className="sidebar-desktop-content__footer">
        <SidebarLlmsTxt />
        <SidebarThemeToggle />
      </div>
    </nav>
  );
}
