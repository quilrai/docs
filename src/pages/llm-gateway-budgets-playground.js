import React from 'react';
import Layout from '@theme/Layout';
import BudgetsAdmin from '@site/src/components/BudgetsAdmin';

export default function BudgetsPlaygroundPage() {
  return (
    <Layout
      title="Budgets admin playground"
      description="Manage LLM Gateway budgets, subjects, grants, model pricing, exemptions, and alerts directly through your management API."
      noFooter
    >
      <BudgetsAdmin />
    </Layout>
  );
}
