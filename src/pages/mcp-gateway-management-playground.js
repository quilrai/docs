import React from 'react';
import Layout from '@theme/Layout';
import McpManagementPlayground from '@site/src/components/McpManagementPlayground';

export default function McpManagementPlaygroundPage() {
  return (
    <Layout
      title="MCP Management API Playground"
      description="Manage MCP Gateway MCPs from the browser with a management key: inventory, settings and overrides, creates and catalog installs, upstream credentials and connect links, tool reviews, usage, latency and DLP analytics, the audit trail, and every operation with request builders and code snippets."
      noFooter
      wrapperClassName="mcp-gateway-management-playground-page"
    >
      <McpManagementPlayground />
    </Layout>
  );
}
