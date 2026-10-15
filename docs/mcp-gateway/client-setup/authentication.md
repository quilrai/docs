---
title: "Authentication reference"
sidebar_label: "Authentication reference"
sidebar_position: 2
sidebar_custom_props:
  icon: KeyRound
description: "Exact MCP and OAuth URLs, client registration, scopes, callback ownership, API-token headers, and current gateway limitations."
---

# Authentication reference

Use this reference when a client asks for authorization-server details. First identify the exact MCP endpoint. A valid token for one endpoint family is not automatically valid for another.

## Separate the three connections

1. **Client to Quilr:** Copilot, Claude, Cursor, or another client obtains a gateway token or uses an approved direct API token.
2. **User to platform SSO:** Quilr identifies the employee through the platform's configured login provider.
3. **Quilr to upstream service:** Quilr uses the user's saved OAuth connection, a personal API key, or an administrator-configured shared credential.

An upstream OAuth app's client secret belongs in the gateway's provider setup. It is not the OAuth client secret to paste into Copilot or Claude. The user may need to sign in twice: once to Quilr, then to an upstream service.

## URL reference

In the following table, `G` is the exact gateway base URL without a trailing slash, such as `https://mcpgateway.quilr.ai`. `T` is the Quilr tenant ID and `B` is a backend ID or unambiguous slug. Substitute values before use.

| Field | Tenantless OneMCP | Tenant-scoped OneMCP |
| --- | --- | --- |
| MCP URL | `G/quilrone/mcp` | `G/quilrone/T/mcp` |
| Issuer / authorization server | `G/quilrone` | `G/quilrone/T` |
| Protected-resource metadata | `G/.well-known/oauth-protected-resource/quilrone/mcp` | `G/.well-known/oauth-protected-resource/quilrone/T/mcp` |
| Authorization-server metadata | `G/.well-known/oauth-authorization-server/quilrone` | `G/.well-known/oauth-authorization-server/quilrone/T` |
| Authorization URL | `G/quilrone/oauth/authorize` | `G/quilrone/T/oauth/authorize` |
| Token URL | `G/quilrone/oauth/token` | `G/quilrone/T/oauth/token` |
| Registration URL | `G/quilrone/oauth/register` | `G/quilrone/T/oauth/register` |
| Registration response client ID | `gateway-onemcp` | `gateway-onemcp-T` |
| Registration response token authentication | `none` | `none` |
| Issued client secret | None | None |

For **direct MCP**, start at `G/B/mcp` and follow its challenge and metadata. Gateway-managed flows generally use `G/B/oauth/authorize`, `G/B/oauth/token`, and `G/B/oauth/register`. OAuth-passthrough servers can advertise upstream issuer URLs and credentials instead. Do not construct manual values without inspecting that server's discovery response.

### Recommended client registration

Choose **OAuth with discovery / dynamic client registration (DCR)** when the client offers it. Registration supplies a public client ID; the OneMCP flow does not issue a confidential-client secret. Do not invent a secret or reuse a gateway administrator token as a client secret.

Clients that offer published client identity / Client ID Metadata Documents (CIMD) should use DCR for this gateway unless that deployment's support for CIMD has been explicitly validated. The presence of discovery endpoints alone does not establish support for every registration method.

### Scopes, refresh, and token format

| Question | Current OneMCP behavior |
| --- | --- |
| Which grant is provided? | Authorization code |
| Is a client secret required? | DCR returns `token_endpoint_auth_method: none` |
| Is a refresh token issued? | No. The downstream token endpoint is code-based and does not implement a refresh-token grant |
| Can I set a refresh URL equal to the token URL? | Do not advertise it as a working refresh grant. A client requiring refresh tokens needs a separately validated integration |
| Which scopes should I enter? | Prefer discovery. OIDC-compatible metadata advertises `openid email profile`; these are identity compatibility labels, not per-tool permission grants |
| Should I request `offline_access`? | It does not enable downstream refresh support. Do not add it as a workaround |
| Is the access token a JWT? | Gateway proxy tokens are opaque; do not configure JWT signature/audience validation for them |
| Is a signed ID token returned? | No |
| How long is the token valid? | The response reports `expires_in: 31536000`; proxy-token storage currently treats tokens as valid until revoked. A client can enforce the advertised expiry and require another sign-in |

Upstream OAuth refresh is separate: the gateway can refresh an upstream provider's token without giving the MCP client a refresh token.

:::note Compatibility boundary
Current OneMCP metadata advertises `S256`, but the downstream token exchange does not enforce the client's PKCE verifier or client-bound grants. It is not a full OpenID Connect provider. Do not describe this integration as fully OAuth 2.1/PKCE compliant, or promise compatibility with clients requiring those features, signed ID tokens, confidential-client authentication, or refresh grants. Escalate those requirements to the gateway operator before rollout.
:::

## Callback URLs: which direction?

| Callback | Who supplies it? | Where it belongs |
| --- | --- | --- |
| MCP client's OAuth redirect | Copilot, Claude, Cursor, or the client runtime | Client registration with the gateway authorization server; DCR submits it automatically |
| Platform SSO callback | The gateway deployment | The configured platform identity provider's application |
| Upstream connector callback | Gateway/provider setup instructions | The upstream service's OAuth application |

If a client displays a callback URL during manual setup, capture that exact value, including its path. Do not replace it with `G/oauth/callback`; that is a gateway-side upstream callback in applicable provider configurations. Never swap a client redirect with an upstream provider redirect.

## Domain-level issuer and opaque-token UserInfo

Some integration products ask for an **Authorization Server URL**, an **Issues Opaque Tokens** checkbox, and a **UserInfo endpoint**. The gateway also exposes this compatibility surface:

| Field | Value on the primary deployment |
| --- | --- |
| Authorization server | `https://mcpgateway.quilr.ai` |
| Discovery | `https://mcpgateway.quilr.ai/.well-known/oauth-authorization-server` |
| Authorization URL | `https://mcpgateway.quilr.ai/oauth/authorize` |
| Token URL | `https://mcpgateway.quilr.ai/oauth/token` |
| Registration | `https://mcpgateway.quilr.ai/oauth/register` |
| UserInfo | `https://mcpgateway.quilr.ai/oauth/userinfo` |
| Issues opaque tokens | Enabled |
| Supported scopes | `openid email profile` |

Replace the hostname consistently for your assigned `quilrai.com` deployment. Root authorization uses tenantless OneMCP tokens. It is not a substitute for the tenant-scoped or direct token endpoint. Do not mix an authorization code from one namespace with another namespace's token URL.

UserInfo returns the stored user's `sub`, `email`, and `preferred_username`. It does not provide audience, client-ID, or granted-scope claims. Leave required scopes, allowed audiences, and allowed client IDs unset for this compatibility mode; if the consuming product requires those validations, this mode does not meet that requirement. Root discovery intentionally does not advertise signed ID tokens, JWKS, or PKCE support.

## API tokens for direct connections

Use this path only for a direct server that offers API tokens, typically a non-OAuth or static-key MCP. It is not a OneMCP authentication method.

1. Create a token in the server's **Configure > API tokens** section. See [API tokens](../servers-and-connections/api-tokens).
2. Use that server's direct gateway URL.
3. Send both headers on requests:

```http
Authorization: Bearer <gateway-api-token>
mcpuser: employee@customer.example
```

The email must be valid and its domain must be allowed for the persisted Quilr company. Additional configured company-domain aliases may also be accepted. New API tokens require a selected agent; the actual request User-Agent must match that binding. Resolve the correct agent configuration rather than spoofing a User-Agent to evade a restriction.

The token holder supplies `mcpuser`; this is delegated attribution, not proof that the named person completed an interactive login. Distribute tokens only to trusted clients that control that identity value appropriately. The gateway still applies user/server/tool policy and upstream credential rules.

Do not send a dashboard JWT, upstream provider API key, or shared platform/internal-service credential as the client API token. A personal upstream key is saved through the gateway's connection workflow; it is not a replacement for the gateway token.

## Operator configuration

The deployment's canonical base URL must match the external HTTPS origin used by clients. Configuration reads `GATEWAY_BASE_URL`, then `PUBLIC_BASE_URL`, then `BASE_URL` (first non-empty value), before an environment-specific default. Operators should explicitly set `GATEWAY_BASE_URL` for the assigned deployment. The gateway builds OAuth URLs from this setting; merely accepting an alternate hostname at a reverse proxy does not make generated metadata follow that hostname.

For an environment change, update the canonical origin, review affected registered provider callbacks, distribute the new MCP URL, and reconnect clients. Retain the correct tenant and backend paths. Confirm the new metadata before moving users.

To inspect the configured origin without credentials, request `GET /api/mcp_base_url` on the deployment and compare `mcp_base_url` with the discovery documents. This checks advertised configuration; it does not validate user sign-in.
