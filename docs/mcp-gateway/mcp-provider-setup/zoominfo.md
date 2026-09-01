---
sidebar_position: 20
sidebar_custom_props:
  icon: Building2
---

# ZoomInfo

ZoomInfo's official MCP server gives an agent access to B2B company and contact intelligence - firmographic search, contact discovery, buyer-intent signals, business-event scoops, and GTM Studio audiences.

ZoomInfo supports Dynamic Client Registration, so there is no ZoomInfo application to create and no Client ID or Client Secret to store. Install it from the [MCP Library](../features/mcp-library) and each user authorizes their own ZoomInfo account through [OAuth Connect](../features/oauth-connect).

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://mcp.zoominfo.com/mcp` |
| Library entry | `ZoomInfo` |
| Transport | Streamable HTTP |
| Auth | OAuth 2.0 with Dynamic Client Registration |
| Client ID and Secret | Not required |

:::tip Install from the library, do not add it by URL
ZoomInfo is already catalogued. Installing from the library keeps the transport URL and auth mode under catalogue control, so a future upstream change reaches every tenant. Adding the same URL manually creates a second, unmanaged copy.
:::

:::warning Do not select OAuth credentials
Because ZoomInfo advertises DCR, the gateway registers itself as an OAuth client automatically. There is no redirect URI to register anywhere in ZoomInfo. Selecting **OAuth credentials** on the Add MCP screen will ask you for values that do not exist.
:::

## Prerequisites

- A ZoomInfo GTM.ai self-serve or Enterprise licence. MCP is not a separate SKU, but it is gated on holding one of these.
- Sufficient credits. Several tools consume Bulk Data or AI Action credits against the plan's existing allowance.
- Model training disabled on every client that will reach ZoomInfo through the gateway. See the compliance note below.
- A QuilrAI administrator to install the entry and set tool scope before rollout.

:::danger ZoomInfo prohibits MCP data from being used for AI model training
This is a contractual restriction from ZoomInfo, not a QuilrAI setting. Confirm that model training is disabled on connecting clients before you connect, and record the confirmation. The gateway cannot verify a downstream client's training setting on your behalf.
:::

## How Authorization Resolves

ZoomInfo's authorization server is Okta-backed and its endpoints are split across two hosts. This matters when reading gateway logs or debugging a failed consent.

| Endpoint | Host |
|----------|------|
| Issuer | `okta-login.zoominfo.com/oauth2/default` |
| Authorize | Proxied through `mcp.zoominfo.com` |
| Dynamic client registration | Proxied through `mcp.zoominfo.com` |
| Token, JWKS, revocation | `okta-login.zoominfo.com` |

Scopes are ZoomInfo-specific: `zi_mcp` and `api:data:mcp`. The gateway requests them during registration. You do not select them by hand.

:::warning Allowlist both hosts
If your network policy restricts outbound traffic, the gateway needs `mcp.zoominfo.com` **and** `okta-login.zoominfo.com`. Allowing only the MCP host produces a confusing failure: the authorize redirect completes, then token exchange fails.
:::

## Install ZoomInfo

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.
2. Click **Library**.
3. Search for `ZoomInfo` and open the entry.
4. Install it. No credential prompt appears.
5. On the installed server, click **Connect** and sign in with your ZoomInfo credentials or your organization's SSO.
6. Approve the requested permissions.
7. Refresh capabilities and confirm the tool list populates.

Each additional user repeats steps 5 and 6 for their own account. Until a user connects, they see the server but no tools, and results reflect only that user's own ZoomInfo permissions.

## Tools And Credit Consumption

Every tool in the data group is read-only against ZoomInfo, but they are not all free. Plan for the credit cost before enabling, not after.

### Data tools, no credit cost

| Tool | What it does |
|------|--------------|
| Search Companies | Find companies by firmographic criteria |
| Search Contacts | Find contacts by role, company, or signal |
| Lookup | Return valid filter values such as industries, regions, job functions |
| Find Similar Companies | Identify companies with comparable profiles |
| Find Similar Contacts | Identify contacts with comparable profiles |
| Find Recommended Contacts | Find outreach-ready contacts for a specific account |
| Search Intent | Discover companies showing buyer-intent signals |
| Search Scoops | Discover companies based on real-world business events |
| Browse Audiences | List and search your GTM Studio audiences |
| Get Audience | View an audience's columns and preview its rows |
| GTM Context | Retrieve the user's role and GTM context for the organization |

### Data tools that consume Bulk Data credits

| Tool | What it does |
|------|--------------|
| Enrich Companies | Detailed firmographics for up to 25 companies per call |
| Enrich Contacts | Detailed contact records for up to 25 contacts per call |
| Enrich Intent | Intent signals for a specific company |
| Enrich Scoops | Business-event scoops for a specific company |
| Enrich News | Categorized news coverage for a specific company |

### Agentic tools that consume AI Action credits

| Tool | What it does | Read-only |
|------|--------------|-----------|
| Account Research | Generate an intelligence briefing for a company | Yes |
| Contact Research | Generate an intelligence briefing for a contact | Yes |
| Update GTM Context | Synthesize unstructured content into structured configuration | No, this writes |

## Recommended Read-Only Rollout

Use [Tools Management](../features/tools-management) to narrow the surface before the first agent reaches the server.

1. Disable **Update GTM Context**. It is the only tool in the set that changes ZoomInfo state.
2. Decide on the enrich tools separately from the search tools. Search is free, enrich is metered, and an agent looping over search results calling enrich per row can spend a large amount of Bulk Data credit in a single conversation.
3. Keep **Account Research** and **Contact Research** disabled until someone owns the AI Action budget. They are read-only but expensive.
4. Set a rate limit on the server if agents will run unattended.

:::warning The enrich tools return bulk personal data
Enrich Contacts returns work email addresses, phone numbers, and job history for up to 25 people per call. Apply the [security guardrails](../features/security-guardrails) you would apply to a CRM export, and review the audit log after the first week.
:::

## Verify The Connection

Start with a free, read-only request:

```
Use the ZoomInfo MCP. Return my GTM context, then search for up to five
software companies in the United Kingdom with more than 500 employees. Do not
enrich anything, do not run account or contact research, and do not update GTM
context.
```

Confirm that:

- the returned GTM context names the user and organization you intended to authorize;
- company results come back without a scope error;
- no Bulk Data or AI Action credit was consumed;
- the MCP client reports the expected tools instead of remaining at **Loading tools**.

## Reconnecting

- Users reconnect after revoking the ZoomInfo grant, after the latest refresh token is lost, or after the gateway connection is deleted.
- A ZoomInfo licence change does not require a reconnect, but it changes what the same token can retrieve. A user downgraded off GTM.ai starts seeing empty results rather than an authorization error.
- Because registration is dynamic, there is no client secret to rotate.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| Consent screen appears, then token exchange fails | Only `mcp.zoominfo.com` is allowlisted outbound, not `okta-login.zoominfo.com` | Allow both hosts, then reconnect |
| `invalid_scope` during registration | The upstream advertised scope set changed | Refresh capabilities, then reconnect. Do not add scopes by hand, the entry uses DCR |
| Connected but zero tools | The user signed in to a ZoomInfo account without a GTM.ai or Enterprise licence | Confirm the licence in ZoomInfo, then reconnect |
| Search works, enrich returns an error | Bulk Data credit is exhausted, or the plan excludes that data type | Check the credit balance in ZoomInfo. This is a plan limit, not a gateway fault |
| Account Research is unavailable | AI Action credits are not provisioned on the plan | Confirm entitlement with ZoomInfo before enabling the tool |
| Results differ between two users | Expected. Each token carries its own ZoomInfo entitlements | No action needed. Use Group and User Rules to normalize the surface |
| A second ZoomInfo server appears in the estate | The URL was also added manually alongside the library install | Uninstall the manual copy and keep the library entry |

## Security Notes

- There is no ZoomInfo client secret in this integration. If someone asks you to paste one, the server was registered with the wrong auth mode.
- Keep **Update GTM Context** disabled unless a named owner has approved write access.
- Treat enrich output as personal data. It is exactly the payload DLP guardrails exist to inspect.
- Confirm and record that model training is disabled on connecting clients, since ZoomInfo's terms prohibit that use.
- Restrict the server with [Access Control](../features/access-control) if only part of the organization is licensed.

## References

- [ZoomInfo: Connect to ZoomInfo MCP](https://docs.zoominfo.com/docs/connect-to-zoominfo-mcp)
- [ZoomInfo: Available MCP tools](https://docs.zoominfo.com/docs/available-mcp-tools)
- [QuilrAI: OAuth Connect](../features/oauth-connect)
- [QuilrAI: MCP Library](../features/mcp-library)
- [QuilrAI: Tools Management](../features/tools-management)
