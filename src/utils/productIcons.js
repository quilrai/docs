import {LayoutGrid, Cpu, Network, Target, Globe, Laptop, Plug, Workflow} from 'lucide-react';
import {productById} from '@site/src/data/products';

// lucide-react components for the product icons named in src/data/products.js
// (that file stays plain data so docusaurus.config.js can import it in Node).
const icons = {LayoutGrid, Cpu, Network, Target, Globe, Laptop, Plug, Workflow};

export function ProductIcon({product, size = 16, ...props}) {
  const p = typeof product === 'string' ? productById[product] : product;
  const Icon = (p && icons[p.icon]) || LayoutGrid;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" {...props} />;
}
