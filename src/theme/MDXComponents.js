import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import StepFlow from '@site/src/components/StepFlow';
import ArchitectureDiagram from '@site/src/components/ArchitectureDiagram';

function TableWrapper(props) {
  return (
    <div className="table-scroll-wrapper">
      <table {...props} />
    </div>
  );
}

export default {
  ...MDXComponents,
  table: TableWrapper,
  StepFlow,
  ArchitectureDiagram,
};
