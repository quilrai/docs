import React, {useEffect, useMemo, useRef, useState} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {ArrowUpRight, BookOpen, Play} from 'lucide-react';
import {products, productById} from '@site/src/data/products';
import {videos, videoById, embedUrl, watchUrl, KIND_LABEL} from '@site/src/data/videos';
import {ProductIcon} from '@site/src/utils/productIcons';
import {Player} from '@site/src/components/VideoEmbed';
import styles from './styles.module.css';

// The /videos page: a player for the selected video, filters by product and
// kind, and every video grouped by its first product. /videos#<id> opens one.

const KINDS = [
  ['all', 'All types'],
  ['explainer', 'Explainers'],
  ['walkthrough', 'Console walkthroughs'],
];

// "2:19" -> "PT2M19S" for schema.org
const isoDuration = (d) => {
  const [m, s] = d.split(':').map(Number);
  return `PT${m}M${s}S`;
};

function StructuredData() {
  const {siteConfig} = useDocusaurusContext();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: v.title,
        description: v.description,
        thumbnailUrl: `${siteConfig.url}${v.poster}`,
        uploadDate: v.published,
        duration: isoDuration(v.duration),
        embedUrl: `https://www.youtube-nocookie.com/embed/${v.youtube}`,
        url: `${siteConfig.url}/videos#${v.id}`,
      },
    })),
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
    </Head>
  );
}

function ProductChips({v}) {
  return v.products.map((id) => (
    <span key={id} className={styles.prod} style={{'--pc': `var(--c-${id})`, '--ps': `var(--s-${id})`}}>
      <ProductIcon product={id} size={12} />
      {productById[id].name}
    </span>
  ));
}

function DocLinks({v}) {
  return (
    <ul className={styles.docs}>
      {v.docs.map((d) => (
        <li key={d.to}>
          <Link to={d.to}>
            <BookOpen size={13} aria-hidden="true" />
            {d.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Card({v, current, onPlay}) {
  // /videos#<id> is linked from every <VideoEmbed>; register it for the anchor check.
  useBrokenLinks().collectAnchor(v.id);
  return (
    <article id={v.id} className={styles.card} data-current={current || undefined}>
      <button type="button" className={styles.thumb} onClick={() => onPlay(v)} aria-label={`Play: ${v.title}`}>
        <img src={v.poster} alt="" loading="lazy" width="1280" height="720" />
        <span className={styles.thumbPlay}>
          <Play size={16} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <span className={styles.thumbDur}>{current ? 'Now playing' : v.duration}</span>
      </button>
      <div className={styles.cardBody}>
        <span className={styles.kind} data-kind={v.kind}>
          {KIND_LABEL[v.kind]}
        </span>
        <h3>
          <button type="button" onClick={() => onPlay(v)}>
            {v.title}
          </button>
        </h3>
        <p>{v.description}</p>
        <DocLinks v={v} />
      </div>
    </article>
  );
}

export default function VideoLibrary() {
  const [product, setProduct] = useState('all');
  const [kind, setKind] = useState('all');
  const [current, setCurrent] = useState(videos[0]);
  const [playing, setPlaying] = useState(false);
  const theater = useRef(null);

  // /videos#<id> selects that video (without autoplay: browsers block it on load).
  useEffect(() => {
    const read = () => {
      const v = videoById[decodeURIComponent(window.location.hash.slice(1))];
      if (!v) return;
      setCurrent(v);
      setPlaying(false);
      theater.current?.scrollIntoView({block: 'start'});
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const play = (v) => {
    setCurrent(v);
    setPlaying(true);
    window.history.replaceState(null, '', `#${v.id}`);
    theater.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  };

  const productCounts = useMemo(() => {
    const counts = {};
    for (const v of videos) for (const p of v.products) counts[p] = (counts[p] || 0) + 1;
    return counts;
  }, []);

  const shown = videos.filter(
    (v) => (product === 'all' || v.products.includes(product)) && (kind === 'all' || v.kind === kind),
  );
  // One section per product, in navbar order. A video sits under its first
  // product, or under the filtered product when one is picked.
  const sections = products
    .map((p) => ({p, items: shown.filter((v) => (product === 'all' ? v.products[0] : product) === p.id)}))
    .filter((s) => s.items.length);

  return (
    <main className={styles.root}>
      <StructuredData />

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Videos</span>
        <h1>Watch it work</h1>
        <p>
          Short explainers show what a feature does and why. Console walkthroughs show where to click. Every video
          links to the docs that cover the same feature in full.
        </p>
      </header>

      <section className={styles.theater} ref={theater} aria-label="Now playing">
        <div className={styles.stage}>
          <Player
            key={`${current.id}-${playing}`}
            bare
            startActive={playing}
            src={embedUrl(current)}
            poster={current.poster}
            title={current.title}
          />
        </div>
        <div className={styles.info}>
          <div className={styles.infoMeta}>
            <span className={styles.kind} data-kind={current.kind}>
              {KIND_LABEL[current.kind]}
            </span>
            <span className={styles.dur}>{current.duration}</span>
          </div>
          <h2>{current.title}</h2>
          <div className={styles.prods}>
            <ProductChips v={current} />
          </div>
          <p>{current.description}</p>
          <h3 className={styles.docsHead}>Read the docs</h3>
          <DocLinks v={current} />
          <a className={styles.yt} href={watchUrl(current)} target="_blank" rel="noopener noreferrer">
            Watch on YouTube <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="Product">
          <button type="button" aria-pressed={product === 'all'} onClick={() => setProduct('all')}>
            All products <span>{videos.length}</span>
          </button>
          {products
            .filter((p) => productCounts[p.id])
            .map((p) => (
              <button
                type="button"
                key={p.id}
                aria-pressed={product === p.id}
                onClick={() => setProduct(p.id)}
                style={{'--pc': `var(--c-${p.id})`}}>
                <ProductIcon product={p} size={14} />
                {p.name} <span>{productCounts[p.id]}</span>
              </button>
            ))}
        </div>
        <div className={styles.seg} role="group" aria-label="Type">
          {KINDS.map(([k, label]) => (
            <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {sections.map(({p, items}) => (
        <section key={p.id} className={styles.section}>
          <h2 className={styles.sectionHead} style={{'--pc': `var(--c-${p.id})`}}>
            <ProductIcon product={p} size={18} />
            {p.name}
            <Link to={`/${p.slug}`} className={styles.sectionLink}>
              Docs <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </h2>
          <div className={styles.grid}>
            {items.map((v) => (
              <Card key={v.id} v={v} current={v.id === current.id && playing} onPlay={play} />
            ))}
          </div>
        </section>
      ))}

      {sections.length === 0 && <p className={styles.empty}>No videos match these filters yet.</p>}
    </main>
  );
}
