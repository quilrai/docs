// Highlighted destinations outside the eight products: shown as accent
// buttons in the navbar (and the mobile drawer) and as feature cards under the
// homepage hero. Icons are lucide-react components.
import {CirclePlay, CodeXml} from 'lucide-react';
import {videos} from './videos';
import {openSourceProjects} from './openSource';

export const featuredLinks = [
  {
    id: 'videos',
    to: '/videos',
    label: 'Videos',
    sub: `${videos.length} walkthroughs and explainers`,
    Icon: CirclePlay,
  },
  {
    id: 'oss',
    to: '/#open-source',
    label: 'Open source',
    sub: openSourceProjects.map((p) => p.name).join(', '),
    Icon: CodeXml,
  },
];
