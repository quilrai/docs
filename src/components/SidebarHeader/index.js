import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {productForPath} from '@site/src/data/products';
import {ProductIcon} from '@site/src/utils/productIcons';

// Product tile + name + sub line on top of each product sidebar. Every doc
// route lives under its product's slug, so the route decides the product
// (this also renders in the mobile drawer, outside the sidebar context).
export default function SidebarHeader() {
  const p = productForPath(useLocation().pathname);
  if (!p) return null;
  return (
    <Link to={`/${p.slug}`} className="qd-side-head">
      <span className="qd-ico-tile">
        <ProductIcon product={p} size={17} />
      </span>
      <span>
        <b>{p.name}</b>
        <span>{p.sub}</span>
      </span>
    </Link>
  );
}
