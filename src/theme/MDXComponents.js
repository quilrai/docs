import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import StepFlow from '@site/src/components/StepFlow';
import ArchitectureDiagram from '@site/src/components/ArchitectureDiagram';
import ExpandableTable from '@site/src/components/ExpandableTable';

export default {
  ...MDXComponents,
  table: ExpandableTable,
  StepFlow,
  ArchitectureDiagram,
};
