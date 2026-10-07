---
sidebar_position: 11
sidebar_custom_props:
  icon: BarChart2
---

# Semrush Advanced

**Semrush Advanced** is a QuilrAI-built MCP for SEO, keyword, backlink, traffic, market, and project research. It uses a Semrush API key instead of a Semrush OAuth Client ID and Client Secret.

Use this guide when **Semrush Advanced** is available in your MCP Store and the
QuilrAI setup screen asks for a Semrush API key. QuilrAI administrators handle
the MCP server registration.

## What This MCP Can Do

| Capability | Examples | Access |
|------------|----------|--------|
| Account usage | Check Standard API and Trends API unit balances | Read only |
| Domain research | Domain overview, organic and paid keywords, competitors, top pages, keyword gap | Read only |
| Keyword research | Keyword overview, ideas, questions, SERP results, opportunity briefs | Read only |
| Backlink research | Backlink overview, details, comparison, and gap analysis | Read only |
| Traffic and market research | Traffic summaries, time series, channels, content, audience overlap, audience profiles | Read only |
| Projects | List projects and read Position Tracking and Site Audit data | Read only |

The MCP provides 23 tools. Its plural and batch tools accept multiple inputs in one call, preserve input order, and report failures per item. Ask the agent to use batch operations whenever you need the same report for several domains, keywords, projects, or targets.

:::note
Semrush availability, database coverage, row limits, and API unit consumption depend on the connected Semrush subscription. Some Traffic & Market and Trends capabilities require a separate Trends API entitlement.
:::

## Before You Start

You need:

- A Semrush account with API access.
- Enough API units for the reports you plan to run.
- Permission to store the API key in QuilrAI.

### Get The Semrush API Key

1. Sign in to Semrush.
2. Open **Subscription Info**.
3. Open the **API Units** tab.
4. Copy the API key.

Treat the key as a secret. It can consume the API units associated with the Semrush account.

## Connect Semrush Advanced

1. Open **Semrush Advanced** from the MCP Store.
2. When prompted for the upstream credential, paste only the Semrush API key.
   Do not add `Bearer`, quotes, or spaces.
3. Choose **Admin shared** for one approved company credential, or **User
   required** when each user must provide a separate Semrush key.
4. Complete the setup and start with the read-only unit-balance request below.

If **Semrush Advanced** is not available in your MCP Store, contact your
QuilrAI administrator.

## Choose Credential Ownership

| Mode | Use when |
|------|----------|
| **Admin shared** | The company has one approved Semrush account or service credential for all authorized QuilrAI users. |
| **User required** | API usage and unit consumption must be attributed to each user's own Semrush account. |

For a shared credential, restrict MCP access to the intended users and agents. A shared key also shares the same Semrush unit balance.

## Verify The Connection

Start with a low-cost, read-only request:

```text
Using Semrush Advanced, check my Semrush API unit balance. This is read-only.
```

Then test a small research request:

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

## Use It Effectively

- Prefer batch tools when researching multiple domains, keywords, projects, or backlink targets.
- Start with small row limits and expand only when the first result is useful.
- Specify the country database when geographic results matter.
- Ask for an estimated upper bound before expensive or multi-target reports.
- Use compound research briefs when you need a summarized answer across related Semrush reports.
- Keep write-capable actions disabled. The current Semrush Advanced tool surface is read only.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `401 Unauthorized` or QuilrAI cannot list tools | Invalid, revoked, or incorrectly supplied Semrush API key | Copy the key again from **Subscription Info** > **API Units**, update the saved Semrush credential, and retry. |
| API unit balance is zero | The account has no remaining API units | Add units or use a different approved Semrush account. |
| Semrush reports an unavailable report or database | The connected plan does not include that API, report, or regional database | Confirm the Semrush subscription and requested database. |
| Traffic or audience tools fail while standard SEO tools work | Trends API access is not enabled for the account | Add the required Semrush Trends API entitlement or disable those tools. |
| A batch partially fails | One or more inputs are invalid, unsupported, or exceed provider limits | Inspect each item result, correct only the failed inputs, and retry those items. |
| Results consume more units than expected | The request uses large limits or several reports | Reduce row limits, target count, and date range before retrying. |

## Rotate Or Remove The Key

When a key is exposed, rotated, or no longer needed:

1. Rotate or replace it in Semrush.
2. Update the saved credential for **Semrush Advanced** in QuilrAI.
3. Re-run the read-only unit-balance test.
4. Revoke or remove the old key according to your organization's credential policy.

## References

- [Semrush: Find your API key](https://www.semrush.com/kb/92-api-key)
- [Semrush API documentation](https://developer.semrush.com/api/)
- [Semrush API authorization](https://developer.semrush.com/api/get-started/authorization/)
