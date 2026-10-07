import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {ArrowUpRight} from 'lucide-react';
import {productById} from '@site/src/data/products';
import {ProductIcon} from '@site/src/utils/productIcons';

// Product landing (docs/<product>/overview.mdx): hero with screenshot, four
// "Get going" tasks, then a map of every group and page in the product's
// sidebar, so the section map can never drift from the real sidebar.

function leafCount(item) {
  if (item.type === 'category') return item.items.reduce((n, c) => n + leafCount(c), 0);
  if (item.type === 'link' && item.customProps?.crossLink) return 0;
  return item.type === 'link' || item.type === 'doc' ? 1 : 0;
}

function firstHref(item) {
  if (item.href) return item.href;
  for (const c of item.items || []) {
    const h = firstHref(c);
    if (h) return h;
  }
  return null;
}

function GroupItem({item}) {
  const cross = productById[item.customProps?.crossLink];
  const href = item.type === 'category' ? firstHref(item) : item.href;
  if (!href) return null;
  const count = item.type === 'category' ? leafCount(item) : 0;
  return (
    <li>
      <Link to={href}>
        {item.label}
        {cross && <span className="qd-xp">in {cross.name}</span>}
        {count > 0 && <span className="qd-xp">({count})</span>}
      </Link>
    </li>
  );
}

function SectionMap({product}) {
  const sidebar = useDocsSidebar();
  const items = sidebar?.items || [];
  const groups = items.filter((i) => i.type === 'category');
  const loose = items.filter(
    (i) => i.type !== 'category' && i.href && i.href.replace(/\/$/, '') !== `/${product.slug}`,
  );
  const total = items.reduce((n, i) => n + leafCount(i), 0) - 1; // minus this landing
  return (
    <section className="qd-land-sec">
      <div className="qd-sec-h">
        <h2>Everything in {product.name}</h2>
        <p>{total} pages</p>
      </div>
      {product.mirror && <p className="qd-mirror">{product.mirror}</p>}
      <div className="qd-smap">
        {loose.length > 0 && (
          <div className="qd-smap-g">
            <h3>
              Pages<span>{loose.length}</span>
            </h3>
            <ul>
              {loose.map((it, i) => (
                <GroupItem key={i} item={it} />
              ))}
            </ul>
          </div>
        )}
        {groups.map((g) => (
          <div className="qd-smap-g" key={g.label}>
            <h3>
              {g.label}
              <span>{g.items.reduce((n, c) => n + Math.max(leafCount(c), 1), 0)}</span>
            </h3>
            <ul>
              {g.items.map((it, i) => (
                <GroupItem key={i} item={it} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductLanding({product}) {
  const p = productById[product];
  if (!p) return null;
  return (
    <div className="qd-land not-prose">
      <div className="qd-land-hero">
        <div className="qd-land-txt">
          <nav className="qd-crumb" aria-label="Breadcrumbs">
            <Link to="/">QuilrAI Docs</Link>
            <span aria-hidden="true">/</span>
            <span>{p.name}</span>
          </nav>
          <h1>
            <span className="qd-ico-tile qd-ico-tile--lg">
              <ProductIcon product={p} size={22} />
            </span>
            {p.name}
          </h1>
          <p>{p.tagline}</p>
          <div className="qd-ctas">
            <Link className="qd-btn qd-btn--primary" to={p.primary.to}>
              {p.primary.label}
            </Link>
            {p.consoleUrl && (
              <Link className="qd-btn" href={p.consoleUrl}>
                Open in console <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
        {p.shot ? (
          <figure className="qd-shot-fig">
            <div className="qd-shot">
              <img src={p.shot} alt={p.shotCaption} loading="eager" />
            </div>
            <figcaption className="qd-shot-cap">{p.shotCaption}</figcaption>
          </figure>
        ) : (
          <div className="qd-shot qd-shot--ph" role="img" aria-label={`${p.shotCaption}: screenshot coming soon`}>
            <div>
              <b>Screenshot coming soon</b>
              {p.shotCaption}
            </div>
          </div>
        )}
      </div>

      <section className="qd-land-sec">
        <div className="qd-sec-h">
          <h2>Get going</h2>
        </div>
        <div className="qd-tasks">
          {p.tasks.map((t) => (
            <Link className="qd-task" to={t.to} key={t.to + t.title}>
              <b>{t.title}</b>
              <span>{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <SectionMap product={p} />
    </div>
  );
}
