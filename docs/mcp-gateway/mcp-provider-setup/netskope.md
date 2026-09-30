---
sidebar_position: 18
sidebar_custom_props:
  icon: ShieldCheck
---

# Netskope

Netskope hosts its own remote MCP server, currently a **technology preview**. Like Zoho and Datadog, you do **not** create an OAuth app or supply a Client ID and Client Secret. Unlike them, the connection needs two separate secrets: a tenant-specific **access code** that goes in the URL path, and a **REST API v2 bearer token** that goes in the request header.

:::warning Preview service, not for production
The Netskope MCP server is an experimental test service offered under a signed **Test Evaluation Agreement**. Netskope provides it "AS IS" with no warranties and states it is **not intended for production use**. You cannot self-serve access; Netskope issues your access code only after the agreement is in place. Treat anything you connect through it as evaluation-only, and expect the endpoint, tool names, and tool count to change without notice.
:::

## How Netskope Differs

- **No OAuth at all.** Authentication is a static bearer token, not an authorization flow. There is no consent screen, no callback URL, and nothing to register on the Netskope side beyond generating the token.
- **Two secrets, in two places.** The 6-character access code is embedded in the URL path, and the API token is sent in the `Authorization` header. Both are required. A valid token with a wrong access code fails, and vice versa.
- **Access is gated by agreement, not by plan.** Your Netskope representative provides the access code after a signed Test Evaluation Agreement. There is no console page that generates one.
- **You must allowlist Netskope's own egress IPs.** The MCP server calls your tenant's REST API on your behalf from its own cloud infrastructure, so those source IPs have to be trusted by your token. This catches almost everyone. See [Allowlist The Egress IPs](#3-allowlist-the-mcp-server-egress-ips).
- **The tool surface is large and write-capable.** Roughly 77 tools spanning events, incidents, policy, users, IPsec, and DNS security. Several of them change enforcement configuration in a security product. See [Available Tools](#available-tools).

## Before You Start

Have these ready:

| Value | Where to get it |
|-------|-----------------|
| Signed Test Evaluation Agreement | Required before Netskope will issue access. Contact your Netskope representative. |
| Access code | A 6-character code tied to your tenant URL, provided by Netskope. Not self-serve. |
| Tenant identifier | Derived from your tenant hostname. See [Format The Tenant Identifier](#4-build-the-mcp-url). |
| REST API v2 token | Generated in the Netskope console under **Settings** > **Tools** > **REST API v2**. |
| API privileges | Scoped to the endpoints backing the tools you intend to use. |
| Ability to edit IP allowlists | On the token, and on the tenant if global IP allowlisting is enabled. |

:::warning
The API token and the access code are both secrets. A Netskope REST API v2 token can read incident and DLP data and, depending on its privileges, change policy. Never commit either to Git or paste them into documentation, tickets, or chat. Note that the access code sits in the URL path, so the MCP URL itself is sensitive and should not be shared or logged in plain text.
:::

## Connect Netskope

### 1. Request access from Netskope

Contact your Netskope representative to execute the Test Evaluation Agreement. Netskope then provides the 6-character access code for your tenant. Access without the agreement is not permitted.

### 2. Generate a REST API v2 token

1. Sign in to your Netskope tenant console.
2. Go to **Settings** > **Tools** > **REST API v2**.
3. Create a new token and grant it only the endpoint privileges the tools you plan to use require.
4. Copy the token value. Netskope shows it once.

Grant privileges deliberately rather than granting everything. Some toolsets need specific RBAC groups:

| Toolset | Privileges needed |
|---------|-------------------|
| DEM and ADEM tools | RBAC API groups `dem_user`, `dem_alerts`, and `dem_advanced_diagnostics` |
| Destination Profiles | `/api/v2/profiles/destinations` access, via the `url_list` or `object_destination` RBAC groups |

### 3. Allowlist the MCP server egress IPs

The MCP server makes downstream REST API v2 calls to your tenant from its own infrastructure. If your token has an IP allowlist, those calls are rejected with `403` until you trust both static egress IPs:

| IP | Availability zone |
|----|-------------------|
| `184.32.255.197/32` | `us-west-2a` |
| `52.89.242.156/32` | `us-west-2b` |

Add both `/32` entries in both places that apply:

- The token's own IP allowlist, under **Settings** > **Tools** > **REST API v2**.
- The tenant global allowlist, under **Settings** > **Administration** > **IP Allowlisting**, if global allowlisting is enabled.

:::note
Both IPs are required, not one. They are separate NAT gateways and either can serve a given request. IPv6 is not supported.
:::

### 4. Build the MCP URL

The endpoint follows this template:

```text
https://mcp-preview.goskope.com/<tenant-identifier>/<access-code>/mcp
```

Derive the tenant identifier from your tenant hostname by dropping `.goskope.com` and replacing any remaining dots with underscores:

| Tenant hostname | Tenant identifier |
|-----------------|-------------------|
| `mytenant.goskope.com` | `mytenant` |
| `eurocorp.eu.goskope.com` | `eurocorp_eu` |

So a tenant at `mytenant.goskope.com` with access code `ABC123` uses:

```text
https://mcp-preview.goskope.com/mytenant/ABC123/mcp
```

:::warning
Multi-region tenants are the common mistake here. A four-level hostname such as `eurocorp.eu.goskope.com` becomes `eurocorp_eu`, with an underscore. Using `eurocorp` or `eurocorp.eu` will not resolve to your tenant.
:::

### 5. Add Netskope MCP to QuilrAI

1. In QuilrAI, go to **MCP Gateway** and click **Add MCP**.
2. Paste the full MCP URL, including the tenant identifier and access code.
3. Supply the Netskope REST API v2 token as the bearer credential. Paste only the token value, with no `Bearer` prefix, quotes, or surrounding spaces.
4. Save, then let QuilrAI fetch the tool list.
5. Before enabling the MCP broadly, restrict it to the intended users and agents, and review the write-capable tools below.

If the tool list comes back empty or the connection fails, work through [Troubleshooting](#troubleshooting) starting with the egress IPs.

## Available Tools

The preview publishes roughly 77 tools. A few of them are multi-action tools that expose many operations behind one tool name, so a raw count of tool names does not match the count of available operations.

| Category | Tools | Access |
|----------|-------|--------|
| JQL helpers | 6, including `get_field_details`, `get_all_fields`, `get_sample_queries`, `get_query_guidelines` | Read only |
| Events API | 13, including `search_alert_events`, `search_incident_events`, `search_application_events`, `export_incident_events` | Read only |
| Incidents | 5, including `get_dlp_incident_forensics`, `update_incident_status`, `get_user_uci_impact`, `get_uba_anomalies` | Read **and write** |
| Services | 9, including `get_cci_app_info`, `create_tag`, `list_tags`, `update_tag`, `delete_tag` | Read **and write** |
| Policy | 6, including `create_url_list`, `update_url_list`, `delete_url_list`, `list_url_lists`, `deploy_policy` | Read **and write** |
| Users | 9, including `query_users`, `query_user_groups`, `get_group_members`, `create_scim_user`, `update_scim_user` | Read **and write** |
| IPsec | 5, including `list_ipsec_pops`, `list_ipsec_tunnels`, `create_ipsec_tunnel`, `modify_ipsec_tunnel` | Read **and write** |
| DNS security | 15, including `get_dns_profiles`, `create_dns_profile`, `update_dns_profile`, `deploy_dns_profiles` | Read **and write** |
| DEM | 1 multi-action tool covering 10 actions such as `query_metrics`, `search_alerts`, `list_monitored_apps` | Read only |
| ADEM | 1 multi-action tool covering 20 actions such as `get_user_info`, `get_device_list`, `get_rca`, `get_traceroute` | Read only |
| Destination profiles | 1 multi-action tool covering 11 actions including `create`, `update`, `append_values`, `deploy`, `delete` | Read **and write** |
| Documentation | 1, `search_netskope_documentation`, which searches the public Netskope Knowledge Portal | Read only |

The preview also ships 8 prepared prompts for multi-step workflows, including Security Posture Report, Incident Analysis, Insider Risk Analysis, User Activity Report, and ADEM Troubleshooting.

:::warning Write tools change your security posture
This is not a read-only integration, and the write tools are not low-stakes. `deploy_policy`, `deploy_dns_profiles`, `delete_url_list`, `create_ipsec_tunnel`, and `create_scim_user` modify enforcement configuration and identity data in the product that polices your traffic. An agent with these tools can weaken your security controls.

Scope the API token to read-only privileges unless a specific workflow genuinely needs to write. The token's privileges, not QuilrAI, are the real boundary here.
:::

Because the tool set is a moving preview, treat the [live tools list](https://mcp-preview.goskope.com/#tools) as authoritative over any snapshot, including this table.

## Verify The Connection

Start with a request that reads nothing from your tenant:

```text
Using Netskope, search the Netskope documentation for how DLP incident severity is
assigned. Do not query my tenant.
```

Then a read-only tenant query:

```text
Using Netskope, list the available query fields, then return the 5 most recent alert
events. Read only - do not create, update, deploy, or delete anything.
```

If both succeed, the access code, token, and IP allowlisting are all correct. Keep every write tool unused until you have deliberately decided to enable it.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `403 Forbidden` on every tool call | The MCP server's egress IPs are not allowlisted | Add `184.32.255.197/32` and `52.89.242.156/32` to the token allowlist and, if enabled, the tenant global allowlist. |
| `401 Unauthorized` | Invalid, expired, or malformed token | Regenerate the token under **Settings** > **Tools** > **REST API v2** and re-enter it with no `Bearer` prefix. |
| Connection fails, or the tenant is not found | Wrong tenant identifier format | For multi-region tenants, replace dots with underscores, for example `eurocorp_eu`. |
| Connection is refused despite a valid token | Wrong or mistyped access code | Confirm the 6-character code with your Netskope representative. It is tied to your specific tenant URL. |
| Some tools work, others return permission errors | The token lacks privileges for those endpoints | Grant the specific RBAC groups those toolsets need, such as `dem_user` for DEM and ADEM. |
| Tools disappeared or were renamed | The preview changed | Re-fetch capabilities in QuilrAI and compare against the [live tools list](https://mcp-preview.goskope.com/#tools). |
| No access, or the access code was never issued | No signed Test Evaluation Agreement | Contact your Netskope representative or `support@netskope.com`. |

## Rotate Or Remove The Credentials

When a token is exposed, rotated, or no longer needed:

1. Revoke the old token in **Settings** > **Tools** > **REST API v2**.
2. Generate a replacement with the same, or narrower, privileges and allowlist entries.
3. Update the saved credential for the Netskope MCP in QuilrAI.
4. Re-run the read-only verification above.

If the MCP URL itself leaked, treat the access code as exposed too and ask Netskope to reissue it. Rotating only the token is not enough, since the URL is half the credential.

## References

- [Netskope MCP Server technical user guide](https://mcp-preview.goskope.com/)
- [Netskope MCP Server tools list](https://mcp-preview.goskope.com/#tools)
- [Netskope: Introducing the Netskope MCP Server (hosted technology preview)](https://community.netskope.com/blogs-21/introducing-the-netskope-mcp-server-netskope-hosted-technology-preview-the-evolution-of-context-aware-security-8328)
- [Netskope: REST API v2 overview](https://docs.netskope.com/en/rest-api-v2-overview-312207)
