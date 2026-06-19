import React from 'react';
import Layout from '@theme/Layout';
import LlmGatewayStudio from '@site/src/components/LlmGatewayStudio';

export default function LlmGatewayPlaygroundPage() {
  return (
    <Layout
      title="LLM Gateway Playground"
      description="Fire real QuilrAI LLM Gateway requests from the browser. Stream chat, run every API surface, point at any gateway URL, and copy the exact cURL, Python, or JavaScript."
      noFooter
      wrapperClassName="llm-gateway-studio-page"
    >
      <LlmGatewayStudio />
    </Layout>
  );
}
