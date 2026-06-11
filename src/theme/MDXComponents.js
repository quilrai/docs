import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import StepFlow from '@site/src/components/StepFlow';
import ArchitectureDiagram from '@site/src/components/ArchitectureDiagram';
import ExpandableTable from '@site/src/components/ExpandableTable';
import SdkApiKeyTester from '@site/src/components/SdkApiKeyTester';
import LogExportPlayground from '@site/src/components/LogExportPlayground';

export default {
  ...MDXComponents,
  table: ExpandableTable,
  StepFlow,
  ArchitectureDiagram,
  SdkApiKeyTester,
  LogExportPlayground,
};
