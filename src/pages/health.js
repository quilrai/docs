import React from 'react';
import Layout from '@theme/Layout';
import GatewayHealth from '@site/src/components/GatewayHealth';

export default function HealthPage() {
  return (
    <Layout
      title="System Health"
      description="Live reachability and latency from your browser to the QuilrAI LLM Gateway and MCP Gateway, plus upstream provider availability."
      noFooter
    >
      <GatewayHealth />
    </Layout>
  );
}
