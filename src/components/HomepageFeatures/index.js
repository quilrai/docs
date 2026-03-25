import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Clear documentation',
    Svg: require('@site/static/img/icon-docs.svg').default,
    description: (
      <>
        Structure guides, API notes, and examples in one place so teams can ship
        faster without hunting for context.
      </>
    ),
  },
  {
    title: 'Organized by design',
    Svg: require('@site/static/img/icon-stack.svg').default,
    description: (
      <>
        Sidebars, versioning, and search-friendly layouts help readers find the
        right page the first time.
      </>
    ),
  },
  {
    title: 'Easy to extend',
    Svg: require('@site/static/img/icon-sparkle.svg').default,
    description: (
      <>
        Built on React and MDX—customize components and theme details when you
        need more than markdown alone.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
