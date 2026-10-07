---
sidebar_position: 17
sidebar_custom_props:
  badge: advanced
  icon: BarChart2
---

# Semrush Advanced

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">SEO + MARKET INTELLIGENCE</span><h2>Twenty-three explicit tools. Fewer schema-guessing loops.</h2><p>Domains, keywords, backlinks, traffic, audiences, and projects with compound research briefs.</p></div>

Semrush Advanced is a Quilr-built MCP for SEO, keyword, backlink, traffic, market and project research. It signs in with a Semrush API key, not an OAuth app.

## Tools

The MCP provides 23 tools, all read only. Its plural and batch tools accept several inputs in one call, keep input order and report failures per item.

| Capability | Examples |
|------------|----------|
| Account usage | Standard API and Trends API unit balances |
| Domain research | Domain overview, organic and paid keywords, competitors, top pages, keyword gap |
| Keyword research | Keyword overview, ideas, questions, SERP results, opportunity briefs |
| Backlink research | Backlink overview, details, comparison and gap analysis |
| Traffic and market research | Traffic summaries, time series, channels, content, audience overlap and profiles |
| Projects | List projects; read Position Tracking and Site Audit data |

:::note
Database coverage, row limits and API unit cost depend on the Semrush subscription. Some traffic, market and Trends tools need a separate Trends API entitlement.
:::

## Setup

You need a Semrush account with API access, enough API units for the reports you plan to run, and permission to store the key in QuilrAI.

### 1. Get the API key

Sign in to Semrush, open **Subscription Info** > **API Units** and copy the API key. Treat it as a secret: it spends the account's API units.

### 2. Install from the Library

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **Semrush Advanced**.
2. Click **Set up** and paste only the key as the **Upstream API key**, with no `Bearer`, quotes or spaces.
3. Choose the **Authentication scope**:

   | Scope | Use when |
   |-------|----------|
   | **Shared by the whole tenant** | One approved Semrush account serves all authorized users. Everyone shares its unit balance, so restrict [server access](../protect/server-access) to the intended users and agents. |
   | **Each user brings their own** | Unit usage must be attributed to each user's own Semrush account. |

4. Click **Install**.

If **Semrush Advanced** is not in your Library, contact Quilr.

### 3. Verify

```text
Using Semrush Advanced, check my Semrush API unit balance. This is read-only.
```

```text
Using Semrush Advanced, return a domain overview for example.com in the US database.
Limit the result size and tell me the estimated API-unit cost before running any
additional reports.
```

To verify batch behavior:

```text
Using Semrush Advanced, compare domain overviews for example.com, example.org,
and example.net in one batch request. Keep the input order and report any
per-domain errors without failing the whole batch.
```

### Use it effectively

- Prefer batch tools for several domains, keywords, projects or backlink targets.
- Start with small row limits and expand only when the first result is useful.
- Name the country database when geography matters.
- Ask for an estimated upper bound before expensive or multi-target reports.
- Consider a [usage quota](../protect/usage-quotas-and-concurrency) on a shared key to protect the unit balance.

### Rotate or remove the key

Rotate or replace the key in Semrush, update the saved credential in QuilrAI, re-run the unit-balance check, and revoke the old key under your credential policy.

### Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `401 Unauthorized`, or tools cannot be listed | Invalid, revoked or wrongly pasted key | Copy the key again from **Subscription Info** > **API Units** and update the credential. |
| API unit balance is zero | No units left | Add units or use another approved account. |
| Report or database unavailable | The plan does not include it | Check the subscription and requested database. |
| Traffic or audience tools fail, SEO tools work | No Trends API access | Add the Trends API entitlement or turn those tools off. |
| A batch partially fails | Some inputs are invalid or exceed provider limits | Read the per-item results and retry only the failed inputs. |
| Higher unit cost than expected | Large limits or many reports | Reduce row limits, targets and date range. |

References: [Find your API key](https://www.semrush.com/kb/92-api-key), [Semrush API documentation](https://developer.semrush.com/api/).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for raw report breadth"
  official="Use Semrush's MCP when analysts need the newest report inventory and are comfortable discovering and executing generic schemas."
  officialPoints={['Broad generic report discovery', 'Fastest access to new provider reports']}
  quilrTitle="Choose Quilr for agent-ready research"
  quilr="Use Quilr when the agent benefits from explicit schemas, compound briefs, comparison outputs, project batches, and visible quota boundaries."
  quilrPoints={['Twenty-three named tools', 'Pre-composed SEO and market workflows']}
  verdict="Exploration favors the official server; repeatable briefs and predictable automation favor Quilr Advanced."
/>

| Capability | Semrush Official MCP | Quilr Advanced |
|---|:---:|:---:|
| Broad generic report discovery | ✅ | - |
| Schema-driven execution | ✅ | - |
| Explicit operation schemas | - | ✅ 23 tools |
| Domain research brief | - | ✅ |
| Keyword opportunity brief | - | ✅ |
| Native backlink and audience comparison | ✅ Reports | ✅ Agent-ready output |
| Keyword and backlink gaps | ✅ | ✅ |
| Batch project reads | Limited | ✅ |
| Standard and Trends quota visibility | ✅ | ✅ Explicit |

Choose the official server for the newest raw report breadth. Choose Quilr Advanced for predictable tools and pre-composed research workflows.
