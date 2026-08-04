import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import StepFlow from '@site/src/components/StepFlow';
import ArchitectureDiagram from '@site/src/components/ArchitectureDiagram';
import ExpandableTable from '@site/src/components/ExpandableTable';
import McpDecision, {McpSignalGrid} from '@site/src/components/McpDecision';

export default {
  ...MDXComponents,
  table: ExpandableTable,
  StepFlow,
  ArchitectureDiagram,
  McpDecision,
  McpSignalGrid,
};
