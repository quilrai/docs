import React from 'react';
import Layout from '@theme/Layout';
import ManagementPlayground from '@site/src/components/ManagementPlayground';

export default function ManagementPlaygroundPage() {
  return (
    <Layout
      title="Management API Playground"
      description="Administer LLM Gateway apps, providers, quota pools, credentials, prompts, budgets, routing, rate limits and incidents, review usage, guardrail activity, provider health and users, explain single requests, and explore every management API operation with request builders and code snippets."
      noFooter
      wrapperClassName="llm-gateway-management-playground-page"
    >
      <ManagementPlayground />
    </Layout>
  );
}
