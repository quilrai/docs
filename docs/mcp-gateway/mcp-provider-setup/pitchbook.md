---
sidebar_position: 22
sidebar_custom_props:
  icon: TrendingUp
---

# PitchBook

PitchBook's Premium Connector exposes private capital markets data - companies, investors, funds, and deals - to an agent over MCP.

PitchBook is not in the [MCP Library](../features/mcp-library), so an administrator registers it as a custom MCP by URL. Access is entitlement-gated on the PitchBook side, which makes this integration unusual: the licensing constraint matters more than the configuration.

See [Overview](./overview) for shared prerequisites and secret-handling guidance.

## Connection Details

| Field | Value |
|-------|-------|
| MCP URL | `https://premium.mcp.pitchbook.com/mcp` |
| Transport | Streamable HTTP |
| Auth | OAuth 2.0, browser sign-in. Confirm the exact mode from the probe |
| Entitlement | PitchBook Premium Connector, a licensed add-on |

:::danger PitchBook seats are licensed individually, and a gateway can fan data out
PitchBook data is licensed per named seat. Behind a shared gateway, an agent authorized by one licensed user can answer questions for colleagues who hold no PitchBook licence. That is a licence-compliance exposure, not a technical fault, and it is the most important thing to settle before rollout.

Use [Access Control](../features/access-control) to restrict the server to the smart group that actually holds PitchBook seats, and confirm the arrangement with your PitchBook account team before going live.
:::

## Prerequisites

- An active PitchBook subscription.
- The Premium Connector entitlement. The MCP endpoint sits behind it, and it is not included with every PitchBook seat. Confirm entitlement before you register the server.
- A QuilrAI administrator to register the server, restrict access, and set tool scope before rollout.

## Add PitchBook To QuilrAI

1. In QuilrAI, go to **Settings** > **AI Gateway** > **MCP Gateway**.

2. Click **Add MCP server**.

3. Enter the following values:

| Field | Value |
|-------|-------|
| Name | `PitchBook` |
| Slug | A unique value such as `pitchbook` |
| Transport URL | `https://premium.mcp.pitchbook.com/mcp` |
| Description | Optional, for example `PitchBook private capital markets data` |
| Authentication | **Auto-detect (recommended)** |

4. Click **Probe and continue**. The gateway probes the endpoint and reports what PitchBook requires.

5. Follow whichever path the probe reports:

   - **Dynamic Client Registration available.** Nothing further to configure. Create the connection and continue to step 6.
   - **Manual OAuth credentials required.** Request an OAuth application from your PitchBook account team, register the callback URL that QuilrAI displays on this screen, and paste the Client ID and Client Secret before creating the connection.

6. Create the MCP connection.

7. Click **Connect**, sign in to PitchBook, review the requested permissions, and approve access.

8. Refresh capabilities and record the tool count in your rollout notes.

:::tip Let the probe decide the auth mode
PitchBook documents a browser sign-in flow but does not publish whether the endpoint advertises DCR. Selecting **OAuth credentials** for a server that supports DCR creates unnecessary secret-handling work. Selecting **Auto-detect** for a server that needs manual credentials simply reports that fact so you can supply them.
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
