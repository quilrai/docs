import React from 'react';
import clsx from 'clsx';
import {useThemeConfig, ErrorCauseBoundary} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import {products, productForPath} from '@site/src/data/products';
import {ProductIcon} from '@site/src/utils/productIcons';

// Navbar: logo, one tab per product (the `product-tab` docSidebar items in
// docusaurus.config.js; rendered here from src/data/products.js so each tab
// gets its icon and accent), then search and the utility links.

export function ProductTabs({className, onNavigate}) {
  const {pathname} = useLocation();
  const active = productForPath(pathname);
  return (
    <nav className={clsx('qd-tabs', className)} aria-label="Products">
      {products.map((p) => (
        <Link
          key={p.id}
          to={`/${p.slug}`}
          className="qd-tab"
          style={{'--tc': `var(--c-${p.id})`}}
          aria-current={active?.id === p.id ? 'true' : undefined}
          onClick={onNavigate}>
          <ProductIcon product={p} size={15} />
          {p.name}
        </Link>
      ))}
    </nav>
  );
}

function UtilityItems({items}) {
  return items.map((item, i) => (
    <ErrorCauseBoundary
      key={i}
      onError={(error) =>
        new Error(
          `A theme navbar item failed to render.\n${JSON.stringify(item, null, 2)}`,
          {cause: error},
        )
      }>
      <NavbarItem {...item} className={clsx(item.className, 'qd-navlink')} />
    </ErrorCauseBoundary>
  ));
}

export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useThemeConfig().navbar.items;
  const utility = items.filter(
    (item) => !String(item.className || '').includes('product-tab') && item.type !== 'search',
  );

  return (
    <div className="navbar__inner qd-nav">
      <div className="qd-nav__brand">
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        <NavbarLogo />
        <span className="qd-nav__docs">Docs</span>
      </div>
      <ProductTabs />
      <div className="qd-nav__right">
        <SearchBar />
        <UtilityItems items={utility} />
      </div>
    </div>
  );
}
