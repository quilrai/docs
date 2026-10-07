import React from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import {useSidebarBreadcrumbs} from '@docusaurus/plugin-content-docs/client';
import {productForPath} from '@site/src/data/products';

// "Product / Group / Subgroup" above the doc title, as in the redesign. The
// current page is left out: its title is the H1 right below. Product landings
// draw their own crumb, so nothing renders there.
export default function DocBreadcrumbs() {
  const {pathname} = useLocation();
  const breadcrumbs = useSidebarBreadcrumbs();
  const product = productForPath(pathname);
  const path = pathname.replace(/\/$/, '');
  if (!product || path === `/${product.slug}`) return null;

  const trail = (breadcrumbs || []).slice(0, -1);
  return (
    <nav className="qd-crumb theme-doc-breadcrumbs" aria-label="Breadcrumbs">
      <Link to={`/${product.slug}`}>{product.name}</Link>
      {trail.map((item, i) => (
        <React.Fragment key={i}>
          <span aria-hidden="true">/</span>
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
