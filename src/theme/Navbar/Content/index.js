import React, {useEffect, useRef, useState} from 'react';
import {ChevronDown} from 'lucide-react';
import clsx from 'clsx';
import {useThemeConfig, ErrorCauseBoundary} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import NavbarItem from '@theme/NavbarItem';
import SearchBar from '@theme/SearchBar';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import {products, productForPath, suiteById} from '@site/src/data/products';
import {ProductIcon} from '@site/src/utils/productIcons';
import {featuredLinks} from '@site/src/data/featured';

// Navbar: logo, one tab per product (the `product-tab` docSidebar items in
// docusaurus.config.js; rendered here from src/data/products.js so each tab
// gets its icon and accent), then search, the highlighted Videos / Open source
// buttons (src/data/featured.js) and the utility links.

export function ProductTabs({className, onNavigate}) {
  const {pathname} = useLocation();
  const active = productForPath(pathname);
  const navRef = useRef(null);

  // On narrow screens the strip scrolls sideways; keep the current product's
  // tab in view on load and after navigation. Only the strip's own scrollLeft
  // changes, so the page never jumps.
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector('[aria-current="true"]');
    if (!nav || !tab || nav.scrollWidth <= nav.clientWidth) return;
    const left = tab.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    const target = left - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollLeft = Math.max(0, Math.min(target, nav.scrollWidth - nav.clientWidth));
  }, [active?.id]);

  // Products in a suite share one tab (at the first member's place) with a menu.
  const entries = [];
  for (const p of products) {
    if (!p.suite) entries.push({product: p});
    else if (!entries.some((e) => e.suite?.id === p.suite)) {
      entries.push({suite: suiteById[p.suite], members: products.filter((m) => m.suite === p.suite)});
    }
  }

  return (
    <nav ref={navRef} className={clsx('qd-tabs', className)} aria-label="Products">
      {entries.map(({product: p, suite, members}) =>
        suite ? (
          <SuiteTab key={suite.id} suite={suite} members={members} active={active} onNavigate={onNavigate} />
        ) : (
        <Link
          key={p.id}
          to={`/${p.slug}`}
          // navbar__link--active also gives local search the product name as
          // the first breadcrumb of every result.
          className={clsx('qd-tab', active?.id === p.id && 'navbar__link--active')}
          style={{'--tc': `var(--c-${p.id})`}}
          aria-current={active?.id === p.id ? 'true' : undefined}
          title={p.navLabel ? p.name : undefined}
          onClick={onNavigate}>
          <ProductIcon product={p} size={15} />
          {p.navLabel || p.name}
        </Link>
        ),
      )}
    </nav>
  );
}

// One navbar tab for a suite. Hover, focus or click opens a menu of its
// products. The menu is position: fixed so the scrolling tab strip does not
// clip it.
function SuiteTab({suite, members, active, onNavigate}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  const closeTimer = useRef(null);
  const current = members.find((m) => m.id === active?.id);

  const show = () => {
    clearTimeout(closeTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({top: r.bottom, left: r.left});
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onScroll = () => setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <div className="qd-suite" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      <button
        ref={ref}
        type="button"
        className={clsx('qd-tab', 'qd-suite__btn', current && 'navbar__link--active')}
        style={{'--tc': `var(--c-${current ? current.id : suite.accent})`}}
        aria-current={current ? 'true' : undefined}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => (open ? setOpen(false) : show())}>
        <ProductIcon product={suite} size={15} />
        {suite.name}
        <ChevronDown size={13} aria-hidden="true" className="qd-suite__chev" />
      </button>
      {open && pos && (
        <div className="qd-suite__menu" role="menu" style={{top: pos.top, left: pos.left}}>
          {members.map((m) => (
            <Link
              key={m.id}
              to={`/${m.slug}`}
              role="menuitem"
              className="qd-suite__item"
              style={{'--tc': `var(--c-${m.id})`, '--ts': `var(--s-${m.id})`}}
              aria-current={active?.id === m.id ? 'true' : undefined}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}>
              <span className="qd-suite__ico">
                <ProductIcon product={m} size={16} />
              </span>
              <span>
                <b>{m.name}</b>
                <small>{m.sub}</small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedLinks() {
  const {pathname, hash} = useLocation();
  return featuredLinks.map(({id, to, label, Icon}) => {
    const [path, anchor] = to.split('#');
    const active = pathname === path && (!anchor || hash === `#${anchor}`);
    return (
      <Link
        key={id}
        to={to}
        className={clsx('qd-feat', `qd-feat--${id}`, active && 'qd-feat--active')}
        aria-current={active ? 'page' : undefined}>
        <Icon size={15} aria-hidden="true" />
        {label}
      </Link>
    );
  });
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
        <FeaturedLinks />
        <UtilityItems items={utility} />
      </div>
    </div>
  );
}
