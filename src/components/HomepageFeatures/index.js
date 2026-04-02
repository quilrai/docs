import clsx from 'clsx';
import Heading from '@theme/Heading';
import {FileText, Layers, Sparkles} from 'lucide-react';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Clear documentation',
    Icon: FileText,
    description: (
      <>
        Structure guides, API notes, and examples in one place so teams can ship
        faster without hunting for context.
      </>
    ),
  },
  {
    title: 'Organized by design',
    Icon: Layers,
    description: (
      <>
        Sidebars, versioning, and search-friendly layouts help readers find the
        right page the first time.
      </>
    ),
  },
  {
    title: 'Easy to extend',
    Icon: Sparkles,
    description: (
      <>
        Built on React and MDX—customize components and theme details when you
        need more than markdown alone.
      </>
    ),
  },
];

function Feature({Icon, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Icon className={styles.featureSvg} role="img" />
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
          {FeatureList.map(({Icon, ...rest}, idx) => (
            <Feature key={idx} Icon={Icon} {...rest} />
          ))}
        </div>
      </div>
    </section>
  );
}
