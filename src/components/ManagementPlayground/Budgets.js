import React, { useCallback } from 'react';
import BudgetsAdmin from '@site/src/components/BudgetsAdmin';
import { redactHeaders, redactSecrets } from './client.mjs';
import { ConnectFirst, usePlayground } from './ui';

let budgetSeq = 1000000;

export default function Budgets() {
  const { connection, record } = usePlayground();
  // The budgets client reports each call; convert it into an activity entry.
  const onResponse = useCallback(
    (call) => {
      record({
        id: ++budgetSeq,
        at: new Date().toISOString(),
        origin: connection?.baseUrl,
        method: call.method,
        path: call.path,
        tokenKind: 'management',
        source: 'Budgets',
        status: call.status,
        latencyMs: call.latencyMs,
        requestHeaders: redactHeaders(
          Object.fromEntries(
            Object.entries(call.requestHeaders || {}).filter(([k]) => !/^(authorization|accept|content-type)$/i.test(k)),
          ),
        ),
        requestBody: call.body === undefined ? null : redactSecrets(call.body),
        response: call.response === undefined ? undefined : redactSecrets(call.response),
        responseHeaders: redactHeaders(call.responseHeaders),
        error: call.error,
      });
    },
    [connection, record],
  );
  if (!connection) return <ConnectFirst what="manage budgets, grants, pricing and exemptions" />;
  return <BudgetsAdmin connection={{ url: connection.baseUrl, key: connection.key, id: connection.id }} onResponse={onResponse} embedded />;
}
