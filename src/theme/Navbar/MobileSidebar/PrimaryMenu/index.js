import React from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import NavbarItem from '@theme/NavbarItem';
import SidebarThemeToggle from '@site/src/components/SidebarThemeToggle';
import {products, productForPath} from '@site/src/data/products';
import {ProductIcon} from '@site/src/utils/productIcons';

// Mobile drawer, main menu: the eight products (with icon and one-line sub),
// then the utility links. Opening a product shows its sidebar as the
// secondary menu (DocSidebar/Mobile).
export default function NavbarMobilePrimaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {pathname} = useLocation();
  const active = productForPath(pathname);
  const utility = useThemeConfig().navbar.items.filter(
    (item) => !String(item.className || '').includes('product-tab') && item.type !== 'search',
  );

  return (
    <div className="navbar-sidebar-menu-stack">
      <ul className="menu__list qd-mprod">
        <li className="qd-mprod__label">Products</li>
        {products.map((p) => (
          <li key={p.id}>
            <Link
              to={`/${p.slug}`}
              className="qd-mprod__item"
              style={{'--tc': `var(--c-${p.id})`, '--ts': `var(--s-${p.id})`}}
              aria-current={active?.id === p.id ? 'true' : undefined}
              onClick={() => mobileSidebar.toggle()}>
              <span className="qd-mprod__ico">
                <ProductIcon product={p} size={16} />
              </span>
              <span>
                <b>{p.name}</b>
                <small>{p.sub}</small>
              </span>
            </Link>
          </li>
        ))}
        <li className="qd-mprod__sep" aria-hidden="true" />
        {utility.map((item, i) => (
          <NavbarItem mobile {...item} onClick={() => mobileSidebar.toggle()} key={i} />
        ))}
      </ul>
      <div className="navbar-sidebar__theme">
        <SidebarThemeToggle />
      </div>
    </div>
  );
}
