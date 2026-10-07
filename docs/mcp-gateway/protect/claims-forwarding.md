---
sidebar_position: 8
sidebar_label: "Claims forwarding"
sidebar_custom_props:
  icon: Fingerprint
---

# Claims forwarding

Forward the caller's identity to a trusted MCP server. The gateway adds the signed-in person's identity to every request it forwards, so the server can apply its own per-user permissions, filtering or audit trail.

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="General"
/>

Turn on **Forward user claims** ("Send a trusted X-User-Claims header to this MCP"). Click **Save settings** in the footer.

![General section of a server's settings with the Backend card showing Name, Slug, Upstream server, Auth type, Available tools and Created](/img/mcp-gateway/ui/settings-general.png)

The setting is off by default. It is shown for servers that sign in with an upstream API key or no authentication. It is not shown for OAuth or OAuth passthrough servers, which already receive each person's own token, or for local packages.

## What the server receives

The gateway adds an `X-User-Claims` header with compact JSON, on direct calls to the server and on calls routed through [OneMCP](../get-started/onemcp):

```http
X-User-Claims: {"v":1,"iss":"quilr-gateway","email":"user@example.com","preferred_username":"user@example.com","sub":"user_123","quilr_tenant_id":"tenant_abc","auth_method":"sso"}
```

| Claim | Always sent | Description |
|-------|-------------|-------------|
| `v` | Yes | Claims format version. Currently `1`. |
| `iss` | Yes | Issuer. Always `quilr-gateway`. |
| `email` | Yes | The person's email, in lowercase. |
| `preferred_username` | Yes | Same as `email`. |
| `sub` | When available | The person's Quilr user ID. |
| `quilr_tenant_id` | When available | Your Quilr tenant ID. |
| `auth_method` | When available | How the person signed in, for example `sso`. |
| `oid` | When available | The person's object ID from your identity provider. |
| `tid` | When available | Your identity provider's tenant ID. |
| `name` | When available | The person's display name. |

Claims with no value are left out. New claims may be added later, so check `v` and ignore unused claims.

## Trust

- The gateway always removes any `X-User-Claims` header a client sends, and adds its own only after the person has passed sign-in and [server access](./server-access) checks.
- Custom headers on the server cannot set `X-User-Claims`.
- The value is plain JSON, not a signed token. Make sure your server only accepts traffic from the gateway, for example over a private network, before trusting it.
- The header contains personal data. Turn it on only for servers approved to receive it.

## Backend example

```python
import json

def authenticated_user(request):
    # Only trust this header on traffic that arrived from the gateway.
    raw_claims = request.headers.get("X-User-Claims")
    if not raw_claims:
        return None

    claims = json.loads(raw_claims)
    if claims.get("v") != 1 or claims.get("iss") != "quilr-gateway":
        raise ValueError("Unsupported user claims")
    return claims
```

## Going further with the Policy Engine

The **Claims Forwarding** card (stage 1, Session) in **Govern > Policy Engine > MCP Gateway** decides per session whether claims are forwarded, with the **forward user claims** effect. Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

Scenarios the card supports beyond the server switch:

- **Forward for some people only.** Match **smart groups** or **user email**, for example forward claims for employees but not for contractors.
- **Forward on one route.** Match **route kind** to forward claims on direct connections but not through OneMCP, or the reverse.
- **Shape the whole session in one rule.** Combine claims forwarding with the OneMCP dynamic tools and memory effects for the same group.

<PolicyCard
  name="contractor_session_posture"
  stage="session"
  priority={800}
  when={[{ field: "Smart groups", op: "includes (ignoring case)", value: "Contractors" }]}
  then={[
    { effect: "OneMCP dynamic tools", value: "false" },
    { effect: "OneMCP memory", value: "deny" },
    { effect: "forward user claims", value: "false" },
  ]}
/>

## Related

- [Server access](./server-access) - decide who may call the server.
- [API Tokens](../servers-and-connections/api-tokens) - the `mcpuser` header sets the person for token calls.
- [OneMCP](../get-started/onemcp) - claims are forwarded on OneMCP calls too.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
