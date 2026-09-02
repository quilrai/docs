---
sidebar_position: 20
sidebar_custom_props:
  icon: TrendingUp
---

# PitchBook

PitchBook's Premium Connector exposes private capital markets data - companies, investors, funds, and deals - to an agent over MCP.

PitchBook appears in the [MCP Library](../features/mcp-library) as a credential-gated entry. Access is entitlement-gated on the PitchBook side, which makes this integration unusual: the licensing constraint matters more than the configuration.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://premium.mcp.pitchbook.com/mcp` |
| Transport | Streamable HTTP |
| Authorization server | `https://premium.mcp.pitchbook.com/` |
| Grants | `authorization_code`, `refresh_token` |
| PKCE | Required, `S256` |
| Scopes advertised | `openid`, `offline_access`, `claudeai` |
| Auth | OAuth 2.1, browser sign-in with PitchBook-issued client credentials |
| Entitlement | PitchBook Premium Connector, a licensed add-on |

:::danger PitchBook's Dynamic Client Registration is allowlisted
PitchBook publishes a `registration_endpoint`, so an automated probe reports that DCR is available. It is not available to QuilrAI. The endpoint accepts registrations only from redirect URIs on PitchBook's partner allowlist, and registering any other callback returns:

```json
{"error": "invalid_redirect_uri",
 "error_description": "None of the provided redirect URIs are allowed by the server's whitelist"}
```

PitchBook's partner allowlist covers the AI vendors it names in its connector programme. A QuilrAI callback is rejected. Until PitchBook either allowlists your gateway callback or issues you an OAuth application, install PitchBook with **manual OAuth credentials** supplied by your PitchBook account team. Do not plan a rollout around DCR.
:::

:::danger PitchBook seats are licensed individually, and a gateway can fan data out
PitchBook data is licensed per named seat. Behind a shared gateway, an agent authorized by one licensed user can answer questions for colleagues who hold no PitchBook licence. That is a licence-compliance exposure, not a technical fault, and it is the most important thing to settle before rollout.

Use [Access Control](../features/access-control) to restrict the server to the smart group that actually holds PitchBook seats, and confirm the arrangement with your PitchBook account team before going live.
:::

## Prerequisites

- An active PitchBook subscription.
- The Premium Connector entitlement. The MCP endpoint sits behind it, and it is not included with every PitchBook seat. Confirm entitlement before you register the server.
- A QuilrAI administrator to register the server, restrict access, and set tool scope before rollout.

## Add PitchBook To QuilrAI

PitchBook is listed in the [MCP Library](../features/mcp-library) as a credential-gated entry, so start there rather than registering the URL by hand.

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.

2. Open the **MCP Library** and select **PitchBook**. Because the entry is credential-gated, QuilrAI asks for OAuth credentials before it installs anything.

3. Copy the callback URL that QuilrAI displays on this screen and send it to your PitchBook account team so they can register it against an OAuth application for your organization.

4. Paste the **Client ID** and **Client Secret** that PitchBook issues, then install the MCP.

   Do not switch the entry to Dynamic Client Registration even if the probe offers it. See the allowlist note above.

5. Click **Connect**, sign in to PitchBook, review the requested permissions, and approve access.

6. Refresh capabilities and record the tool count in your rollout notes.

### If The Library Tile Is Not Available

Register the server manually with the same credentials:

1. Click **Add MCP** and enter the following values:

| Field | Value |
|-------|-------|
| Name | `PitchBook` |
| Slug | A unique value such as `pitchbook` |
| Transport URL | `https://premium.mcp.pitchbook.com/mcp` |
| Description | Optional, for example `PitchBook private capital markets data` |
| Auth mode | **OAuth credentials** |
| Client ID | The Client ID issued by PitchBook |
| Client Secret | The Client Secret issued by PitchBook |

2. Create the MCP connection, then **Connect** and refresh capabilities as above.

:::tip Do not trust the probe's DCR verdict here
PitchBook advertises a `registration_endpoint`, so **Auto-detect** reports that DCR is available. Registration still fails for a QuilrAI callback because of the allowlist described above. Select **OAuth credentials** and supply the Client ID and Client Secret from your PitchBook account team.
:::

## The Callback URL

The QuilrAI callback URL is issued per MCP server, not once per tenant, and it is displayed on that server's own setup screen. Copy the value QuilrAI shows you. Do not reuse a callback from another provider page or another server in the same tenant.

:::warning The callback contains a query parameter
Some identity providers reject a redirect URI with a query string. If PitchBook's OAuth application form refuses the callback for that reason, raise it with your PitchBook account team rather than trimming the parameter. A truncated callback will not route back to the correct server.
:::

## Tools

PitchBook does not publish its MCP tool inventory, so this page cannot state it authoritatively. Discover the surface after connecting:

1. Open the server and click **Show tools**.
2. Record every tool name and description in your rollout notes.
3. Classify each one as read or write before enabling any of them for agents.

Expect the surface to centre on company, investor, fund, and deal lookups. Treat anything that creates a list, a saved search, or an export as a write until you have confirmed otherwise.

## Recommended Read-Only Rollout

1. In [Access Control](../features/access-control), restrict the server to a smart group containing only users who hold a PitchBook seat. Do this before enabling any tools, not after.
2. In [Tools Management](../features/tools-management), disable every tool that is not a plain lookup.
3. Set a rate limit on the server. PitchBook data pulls are metered on most contracts, and an unattended agent iterating over a target list can consume a quarter's allowance in an afternoon.
4. Review the audit log after the first week and compare query volume against your contract terms.

## Verify The Connection

Start with a single bounded, read-only lookup:

```
Use the PitchBook MCP. Look up one company by name and return its profile
summary only. Do not run a screen, do not export, do not save a search, and do
not iterate over a list of companies.
```

Confirm that:

- the profile returned matches the company you asked for;
- the authorizing account is the licensed seat you intended;
- no saved search, list, or export was created;
- the MCP client reports the expected tools instead of remaining at **Loading tools**.

## Reconnecting

- Users reconnect after revoking the PitchBook grant, after the latest refresh token is lost, or after the gateway connection is deleted.
- If the Premium Connector entitlement lapses, existing tokens stop returning data. The symptom is usually empty or forbidden responses rather than a sign-in prompt.
- If PitchBook issued a manual OAuth application, update the stored Client ID and Client Secret in QuilrAI whenever those credentials are rotated.

## Troubleshooting

| Error or symptom | Likely cause | Fix |
|------------------|--------------|-----|
| Probe cannot reach the endpoint | Outbound access to `premium.mcp.pitchbook.com` is not allowed from the gateway | Allow the host outbound, then probe again |
| Sign-in succeeds but every tool returns forbidden | The account holds a PitchBook seat but not the Premium Connector entitlement | Confirm the add-on with your PitchBook account team |
| Redirect URI rejected by PitchBook | The application form does not accept a query string in the callback | Raise it with PitchBook. Do not remove the query parameter |
| Connected but zero tools | OAuth was not completed, or capabilities were never refreshed | Complete **Connect**, refresh capabilities, then restart or toggle the entry in the client |
| Results differ between two users | Expected. Each token carries its own PitchBook entitlements | No action needed. Use Group and User Rules to normalize the surface |
| An unlicensed colleague receives PitchBook data through an agent | Access Control is not restricted to the licensed smart group | Restrict the server immediately, then review the audit log for prior exposure |
| A data-volume alert arrives from PitchBook | An agent iterated over a large target list | Set a rate limit, and disable screening or bulk tools |

## Security Notes

- Restrict this server by smart group. It is the one control that addresses the licence exposure described above.
- If PitchBook issues a Client Secret, keep it in your approved secret manager. Never place it in an MCP client configuration file, source control, chat, or a support ticket.
- Keep export and list-creation tools disabled unless a named owner has approved them.
- PitchBook content is licensed third-party data. Anything an agent summarizes from it inherits those licence terms, including material pasted into internal documents.

## References

- [PitchBook: Getting started with the Premium Connector](https://pitchbook.com/help/getting-started-with-pitchbook-premium-connector)
- [PitchBook: LLM data connectors for enterprise AI tools](https://pitchbook.com/products/premium-connectors)
- [QuilrAI: OAuth Connect](../features/oauth-connect)
- [QuilrAI: Access Control](../features/access-control)
- [QuilrAI: Tools Management](../features/tools-management)
