import React, { useState } from 'react';
import { MANAGEMENT_PREFIX, seg } from './client.mjs';
import { ApiChips, ConnectFirst, ErrorBox, JsonView, Pager, Panel, Table, Tabs, fmt, useAction, useCollection, usePlayground } from './ui';
import { idOf } from './shared';
import styles from './styles.module.css';

const KINDS = {
  groups: {
    title: 'Smart groups',
    subtitle: 'Groups of users that app settings and budgets can reference. Read only here; edit them in the console.',
    path: '/smart-groups',
    item: '/smart-groups/{group_name}',
    id: (r) => idOf(r, 'group_name', 'name', 'id'),
    columns: [
      { label: 'Members', render: (r) => fmt(r.member_count ?? r.members?.length) },
      { label: 'Description', render: (r) => fmt(r.description) },
    ],
  },
  definitions: {
    title: 'Custom definitions',
    subtitle: 'Custom detection definitions an app can select in detection.custom_definitions. Read only here.',
    path: '/custom-definitions',
    item: '/custom-definitions/{definition_id}',
    // Rows are keyed by edm_id; the detail route matches it too.
    id: (r) => idOf(r, 'edm_id', 'reference'),
    columns: [
      { label: 'Name', render: (r) => fmt(r.display_name || r.name) },
      { label: 'Type', render: (r) => fmt(r.type) },
      { label: 'Enabled', render: (r) => fmt(r.enabled) },
    ],
  },
};

export default function Catalogs() {
  const { client } = usePlayground();
  const [kind, setKind] = useState('groups');
  if (!client) return <ConnectFirst what="browse smart groups and custom definitions" />;
  return (
    <div className={styles.stack}>
      <Tabs
        label="Catalog"
        value={kind}
        onChange={setKind}
        tabs={[
          ['groups', 'Smart groups'],
          ['definitions', 'Custom definitions'],
        ]}
      />
      <Catalog key={kind} config={KINDS[kind]} />
    </div>
  );
}

function Catalog({ config }) {
  const { client } = usePlayground();
  const [detail, setDetail] = useState(null);
  const action = useAction();
  const list = useCollection(
    (cursor) => client.call({ path: MANAGEMENT_PREFIX + config.path, query: { limit: 50, cursor }, source: config.title }),
    [client, config.path],
  );
  async function open(id) {
    await action.run(async () => {
      const res = await client.call({ path: `${MANAGEMENT_PREFIX}${config.path}/${seg(id)}`, source: `${config.title} detail` });
      setDetail({ id, data: res });
      return res;
    });
  }
  return (
    <Panel title={config.title} subtitle={config.subtitle} actions={<ApiChips calls={[['GET', config.path], ['GET', config.item]]} />}>
      <ErrorBox error={list.error} />
      <div className={styles.split}>
        <div>
          <Table
            rows={list.data?.items || []}
            rowKey={config.id}
            selected={detail?.id}
            onRowClick={(r) => open(config.id(r))}
            empty={list.loading ? 'Loading...' : 'Nothing here yet.'}
            columns={[{ label: 'Id', render: (r) => <code>{fmt(config.id(r))}</code> }, ...config.columns]}
          />
          <Pager list={list} />
        </div>
        <div>
          <ErrorBox error={action.error} onDismiss={() => action.setError(null)} />
          {detail ? <JsonView value={detail.data} maxHeight={560} /> : <p className={styles.muted}>Select a row to read it.</p>}
        </div>
      </div>
    </Panel>
  );
}
