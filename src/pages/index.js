import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {products} from '@site/src/data/products';

// Placeholder; the platform-map homepage replaces this.
export default function Home() {
  return (
    <Layout title="QuilrAI Docs" description="Documentation for the QuilrAI platform">
      <main style={{padding: 40}}>
        <h1>Govern every AI interaction across your enterprise</h1>
        <ul>{products.map((p) => <li key={p.id}><Link to={`/${p.slug}`}>{p.name}</Link></li>)}</ul>
      </main>
    </Layout>
  );
}
