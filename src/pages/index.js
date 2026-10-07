import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {Search, Sparkles} from 'lucide-react';
import {productById} from '@site/src/data/products';
import {updates} from '@site/src/data/updates';
import {ProductIcon} from '@site/src/utils/productIcons';
import {ASK_AI_EVENT} from '@site/src/components/AskAiLauncher';
import {OPEN_SEARCH_EVENT} from '@site/src/theme/SearchBar';

// Homepage: hero, the platform map (Console control plane, Red Teaming, four
// sensor lanes, Integrations), common starting points and recent updates.

const LANES = [
  ['browser', 'People using AI in the browser', 'ChatGPT, Claude, Gemini, Copilot', 'AI web apps', 'Personal and enterprise accounts'],
  ['endpoint', 'Desktop apps and coding agents', 'Cursor, Claude Code, Ollama, local MCP', 'On the device', 'Apps, models, skills, MCP servers'],
  ['llm', 'Apps and agents you build', 'Your services call one endpoint', 'Model providers', 'OpenAI, Anthropic, Azure, Bedrock, Vertex'],
  ['mcp', 'Agents that call tools', 'Any MCP client or OneMCP', 'Tools and SaaS', 'GitHub, Slack, Salesforce, 400+ servers'],
];

const CONSOLE_PILLS = ['Overview', 'Costs & Savings', 'Findings', 'Inventory', 'Policy Engine', 'Detection Models', 'Settings'];

const JOURNEYS = [
  {
    title: 'Roll out to employees',
    desc: 'Get visibility into AI use across the workforce within a day.',
    steps: [
      ['browser', 'Microsoft Intune', '/browser-extension/deploy/microsoft-intune'],
      ['endpoint', 'Deployment and status', '/endpoint-agent/deploy-and-operate/deployment-and-status'],
      ['console', 'Overview', '/console/observe/overview'],
      ['console', 'Policy Engine overview', '/console/govern/policy-engine'],
    ],
  },
  {
    title: 'Put a gateway in front of your apps',
    desc: 'Route your services through one endpoint with guardrails on.',
    steps: [
      ['llm', 'Quick start', '/llm-gateway/get-started/quick-start'],
      ['llm', 'Providers and models', '/llm-gateway/apps-and-providers/providers-and-models'],
      ['llm', 'Security guardrails', '/llm-gateway/protect/security-guardrails'],
      ['console', 'Costs & Savings', '/console/observe/costs-and-savings'],
    ],
  },
  {
    title: 'Give agents safe access to tools',
    desc: 'Connect MCP clients to governed servers.',
    steps: [
      ['mcp', 'Quick start', '/mcp-gateway/get-started/quick-start'],
      ['mcp', 'MCP Library', '/mcp-gateway/servers-and-connections/mcp-library'],
      ['mcp', 'Server access', '/mcp-gateway/protect/server-access'],
      ['red', 'MCP Threat Detection', '/red-teaming/assessments/mcp-threat-detection'],
    ],
  },
];

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
  return `${month} ${d}, ${y}`;
}

function PlatformMap() {
  const red = productById.red;
  const integ = productById.integ;
  return (
    <div className="qd-pmap" role="group" aria-label="QuilrAI platform map">
      <div className="qd-pmap-cap">
        <h2>How QuilrAI fits together</h2>
        <p>Select any part to open its docs.</p>
      </div>
      <div className="qd-cp">
        <Link to="/console" className="qd-cp-console">
          <div className="qd-cp-text">
            <div className="qd-node-name" style={{color: 'var(--c-console)'}}>
              <ProductIcon product="console" size={18} />
              <span>Console</span>
            </div>
            <p>The control plane. Every sensor below reports here, and every policy you publish here is enforced by them.</p>
            <div className="qd-pills">
              {CONSOLE_PILLS.map((p) => (
                <span className="qd-pill" key={p}>{p}</span>
              ))}
            </div>
          </div>
          <div className="qd-cp-shot">
            <img
              src="/img/products/console-agentic-estate.jpg"
              alt="Console Overview, Agentic estate tab, showing agentic assets, shadow AI and MCP servers outside the gateway"
              loading="lazy"
            />
          </div>
        </Link>
        <Link to={`/${red.slug}`} className="qd-cp-red">
          <div className="qd-node-name" style={{color: 'var(--c-red)'}}>
            <ProductIcon product={red} size={18} />
            <span>{red.name}</span>
          </div>
          <p>Attacks your gateway apps, agents, models and MCP servers on demand or on a schedule, and turns what it finds into detections.</p>
        </Link>
      </div>
      <div className="qd-flowlabel" aria-hidden="true">
        <span>Who is using AI</span>
        <span>Policies flow down, evidence flows up</span>
        <span>Where the traffic goes</span>
      </div>
      <div className="qd-lanes">
        {LANES.map(([id, s1, s2, d1, d2]) => {
          const p = productById[id];
          return (
            <div className="qd-lane" key={id} style={{'--lc': `var(--c-${id})`, '--ls': `var(--s-${id})`}}>
              <div className="qd-lane-src">
                <b>{s1}</b>
                <span>{s2}</span>
              </div>
              <i className="qd-wire qd-wire--l" aria-hidden="true" />
              <Link to={`/${p.slug}`} className="qd-sensor">
                <span className="qd-sensor__ico">
                  <ProductIcon product={p} size={18} />
                </span>
                <b>{p.name}</b>
                <span>{p.sub}</span>
              </Link>
              <i className="qd-wire qd-wire--r" aria-hidden="true" />
              <div className="qd-lane-dst">
                <b>{d1}</b>
                <span>{d2}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Link to={`/${integ.slug}`} className="qd-integ">
        <div className="qd-node-name" style={{color: 'var(--c-integ)'}}>
          <ProductIcon product={integ} size={18} />
          <span>{integ.name}</span>
        </div>
        <div className="qd-integ__cols">
          <span>
            <b>Pull in</b> Claude and OpenAI compliance APIs, Copilot Studio, Azure AI Foundry, GitHub
          </span>
          <span>
            <b>Send out</b> Syslog, webhooks, Microsoft Sentinel
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="QuilrAI Docs"
      description="Documentation for the QuilrAI platform: Console, LLM Gateway, MCP Gateway, Red Teaming, Browser Extension, Endpoint Agent and Integrations."
      wrapperClassName="qd-home-wrap">
      <main className="qd-home">
        <div className="qd-home-hero">
          <h1>Govern every AI interaction across your enterprise</h1>
          <p>
            QuilrAI sits wherever your people and agents use AI: in the browser, on the device, and in front of the
            models and tools your teams build with. The Console is where you see it all and set the rules.
          </p>
          <div className="qd-ask">
            <button
              type="button"
              className="qd-ask__field"
              onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}>
              <Search size={17} aria-hidden="true" />
              <span>Search the docs or ask a question</span>
            </button>
            <button
              type="button"
              className="qd-btn"
              onClick={() => window.dispatchEvent(new Event(ASK_AI_EVENT))}>
              <Sparkles size={15} aria-hidden="true" /> Ask AI
            </button>
          </div>
        </div>

        <PlatformMap />

        <section className="qd-home-sec">
          <div className="qd-sec-h">
            <h2>Common starting points</h2>
            <p>Ordered steps across products.</p>
          </div>
          <div className="qd-journeys">
            {JOURNEYS.map((j) => (
              <div className="qd-journey" key={j.title}>
                <h3>{j.title}</h3>
                <p>{j.desc}</p>
                <ol>
                  {j.steps.map(([pid, label, to]) => (
                    <li key={to}>
                      <Link to={to}>
                        {label} <span className="qd-journey__p">{productById[pid].name}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="qd-home-sec">
          <div className="qd-sec-h">
            <h2>Recently updated</h2>
            <p>From the docs repository.</p>
          </div>
          <div className="qd-updates">
            {updates.map((u) => {
              const p = productById[u.product];
              return (
                <div className="qd-update" key={u.to}>
                  <time dateTime={u.date}>{formatDate(u.date)}</time>
                  <span className="qd-update__prod" style={{color: `var(--c-${p.id})`}}>
                    <ProductIcon product={p} size={14} />
                    <span>{p.name}</span>
                  </span>
                  <Link to={u.to}>{u.title}</Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
}
