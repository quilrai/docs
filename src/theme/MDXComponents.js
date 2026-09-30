import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import StepFlow from '@site/src/components/StepFlow';
import ArchitectureDiagram from '@site/src/components/ArchitectureDiagram';
import ExpandableTable from '@site/src/components/ExpandableTable';
import McpDecision, {McpSignalGrid} from '@site/src/components/McpDecision';
import CopyField, {CopyFieldGroup} from '@site/src/components/CopyField';
import ConsolePath from '@site/src/components/ConsolePath';
import PolicyCard from '@site/src/components/PolicyCard';
import Walkthrough from '@site/src/components/Walkthrough';
import VideoEmbed from '@site/src/components/VideoEmbed';

export default {
  ...MDXComponents,
  table: ExpandableTable,
  StepFlow,
  ArchitectureDiagram,
  McpDecision,
  McpSignalGrid,
  CopyField,
  CopyFieldGroup,
  ConsolePath,
  PolicyCard,
  Walkthrough,
  VideoEmbed,
};
