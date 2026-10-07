import React from 'react';
import Link from '@docusaurus/Link';
import {productById} from '@site/src/data/products';

// Placeholder; the full landing (hero, tasks, section map) replaces this.
export default function ProductLanding({product}) {
  const p = productById[product];
  return (
    <div>
      <h1>{p.name}</h1>
      <p>{p.tagline}</p>
      <ul>
        {p.tasks.map((t) => (
          <li key={t.to}><Link to={t.to}>{t.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}
