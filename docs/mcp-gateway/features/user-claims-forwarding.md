---
sidebar_position: 10
sidebar_custom_props:
  icon: Fingerprint
---

# User Claims Forwarding

Forward the authenticated Quilr user identity to a trusted non-OAuth MCP backend. This is useful for internal or multi-user MCP servers that need to apply their own per-user authorization, filtering, or audit attribution while the gateway manages client authentication.

## How It Works

<StepFlow steps={[
  {
    label: "Authenticate",
    items: [
      "Client authenticates to QuilrAI",
      "Gateway resolves the end user",
      "Tenant and access checks pass",
    ],
  },
  {
    label: "Create Claims",
    items: [
      "Client-supplied claims are removed",
      "Gateway builds versioned JSON",
      "Available identity fields are added",
    ],
  },
  {
    label: "Forward",
    items: [
      "X-User-Claims is added upstream",
      "Direct MCP and OneMCP supported",
      "Backend applies user-aware policy",
    ],
  },
]} />

The feature is disabled by default and is available only for non-OAuth MCPs, including no-auth and static-key backends. OAuth backends use the upstream provider's user token and do not receive this header.

## Configure the Setting

1. Open **MCP Gateway** and select the MCP.
2. Open **Settings → General**.
3. Enable **Send user claims to backend**.
4. Save the MCP settings.

The setting is not shown for gateway-managed OAuth or OAuth passthrough MCPs.

## Header Format

The upstream MCP receives compact JSON in the `X-User-Claims` request header:

```http
X-User-Claims: {"v":1,"iss":"quilr-gateway","email":"user@example.com","preferred_username":"user@example.com","sub":"user_123","quilr_tenant_id":"tenant_abc","auth_method":"sso"}
```

| Claim | Required | Description |
|-------|----------|-------------|
| `v` | Yes | Claims schema version. The current value is `1`. |
| `iss` | Yes | Claims issuer. The current value is `quilr-gateway`. |
| `email` | Yes | Authenticated user's normalized lowercase email. |
| `preferred_username` | Yes | Normalized email, provided for identity compatibility. |
| `sub` | When available | Quilr user ID associated with the authenticated request. |
| `quilr_tenant_id` | When available | Quilr tenant ID for the request. |
| `auth_method` | When available | Authentication method resolved by the gateway, such as `sso`. |

Optional fields are omitted when the gateway does not have a value. Backends should tolerate new claims being added in later schema versions and should use `v` when parsing version-specific behavior.

## Security and Trust

- The gateway removes every client-supplied case variant of `X-User-Claims`. When forwarding is enabled, it replaces that value with claims derived from the authenticated request. When forwarding is disabled, the header remains removed.
- Static upstream extra-header configuration cannot set `X-User-Claims`; it is reserved for the gateway.
- The header is redacted from gateway request-header logs.
- The value is JSON, not a signed JWT. Configure the upstream MCP to accept traffic only through a trusted gateway-to-backend channel, such as a private network or an authenticated transport, before using these claims for authorization.
- The header contains user identity data. Enable it only for a backend that is approved to receive that data.
- Shared capability caching is disabled for the MCP while forwarding is enabled so user-specific upstream responses are not reused across users.

:::note
This header carries the identity authenticated by QuilrAI. It does not forward arbitrary identity claims supplied by the MCP client.
:::

## Backend Example

The upstream server parses the header as JSON and then applies its own authorization rules:

```python
import json

def authenticated_user(request):
    # Parse this only after the server verifies that the request arrived
    # through its trusted gateway-to-backend channel.
    raw_claims = request.headers.get("X-User-Claims")
    if not raw_claims:
        return None

    claims = json.loads(raw_claims)
    if claims.get("v") != 1 or claims.get("iss") != "quilr-gateway":
        raise ValueError("Unsupported user claims")
    return claims
```

The gateway adds the header to both direct per-MCP traffic and live upstream calls routed through OneMCP after its normal identity and access-control checks succeed.
