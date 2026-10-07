---
sidebar_position: 5
sidebar_label: "Identity and network trust"
sidebar_custom_props:
  icon: Fingerprint
---

# Identity and network trust

Identify the user behind every gateway call, require identity or a conversation ID where you need it, verify caller JWTs, and limit which networks may call the gateway.

## Turn it on for an app

Identity is configured per app. Open the app from **Settings > AI Gateway > LLM Gateway** and choose any **Configure** option to open the app workspace's **Settings** tab, then select **Identity Aware** under **Identity & content**. Apps with it on show an **Identity aware** chip in the app list.

New apps have every control off: identity optional, conversation ID optional, any user domain, JWT not verified. Network limits are set separately under [Source IP restrictions](./security-guardrails#source-ip-restrictions) in the Guardrails tab.

![Identity Aware section with Identity header mode, Enforce identity and Enforce conversation ID switches, Allowed user domains, and JWT authentication with Allowed issuers, Allowed client IDs and Signing key source](/img/llm-gateway/ui/app-identity-aware.png)

## How it works

<StepFlow steps={[
  {
    label: "Request Arrives",
    items: [
      "Authorization: Bearer sk-quilr-•••",
      "X-User-Email: alice@acme.com",
    ],
  },
  {
    label: "QuilrAI Identifies",
    items: [
      "User: alice@acme.com",
      "Domain: acme.com ✓",
    ],
  },
  {
    label: "Per-User Tracking",
    items: [
      "Logs and findings per user",
      "Per-user analytics ✓",
    ],
  },
]} />

1. **Request Arrives** - App sends an API call with identity info
2. **Gateway Identifies User** - Extracts identity via header or JWT token
3. **Per-User Tracking** - Logs, findings and usage are attributed to the user

## Authentication modes

### Header based (trusted clients)

Uses the `X-User-Email` header to identify users. If your app handles user login and makes LLM calls from your own backend, this is the easiest and recommended approach - just pass the logged-in user's email as a header.

```
X-User-Email: user@company.com
```

### JWT with a JWKS URL (untrusted clients)

Turn on **JWT authentication** and set **Signing key source** to **JWKS URL**. The gateway validates caller JWTs against the keys at that URL, which supports key rotation. Ideal for production OAuth/OIDC flows with providers like Auth0, Okta, or Google.

```
https://your-provider/.well-known/jwks.json
```

### JWT with a public key (PEM)

Set **Signing key source** to **Public key PEM** to validate JWTs with a static RSA public key. Suitable for environments with fixed signing keys where JWKS isn't available.

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqh...
-----END PUBLIC KEY-----
```

## JWT claims validation

| Claim | Description |
|-------|-------------|
| **Allowed issuers** (`iss`) | Only tokens from trusted identity providers are accepted |
| **Allowed client IDs** (`azp` / `client_id`) | Restricts which OAuth clients can access the gateway |

## Access controls

Each app has three independent identity controls, plus [Enforce conversation ID](../monitor/conversation-grouping). They compose: turn on header identity to accept the `X-User-Email` header, turn on enforced identity to make identity mandatory, and list allowed domains to whitelist who counts as identity.

### Identity header mode

Controls whether the gateway reads the `X-User-Email` header at all.

| Mode | Behavior |
|------|----------|
| **Enabled** | Gateway reads `X-User-Email` from every request, attaches it to logs and per-user analytics, and (when Enforce Identity is on) accepts it as valid identity. |
| **Disabled** (default) | `X-User-Email` is ignored even if sent. JWT is still the only identity source. |

Leave it off for apps using JWT only. Turn it on for trusted backends that pass the logged-in user's email to the gateway.

### Enforce identity

Makes identity mandatory. After auth succeeds, the request is only accepted if identity was also provided.

| Mode | Behavior |
|------|----------|
| **Enabled** | Request must carry either a valid JWT or a valid `X-User-Email` (when Identity Header Mode is on). Requests with only a Quilr key are rejected with *"This API key requires identity context."* |
| **Disabled** (default) | Identity is logged if present but never required. |

JWT auth always satisfies Enforce Identity - the JWT itself is the identity. The `X-User-Email` header only satisfies it when Identity Header Mode is also enabled.

### Allowed user domains

A list of email domains permitted as identity.

| Setting | Behavior |
|---------|----------|
| Empty (default) | Any email domain is accepted. |
| Specific domains (e.g. `company.com`, `partner.com`) | Only emails in these domains are accepted. |

The check runs on both the `X-User-Email` header and the `email` claim extracted from JWTs. Requests from disallowed domains are rejected even if the JWT signature is otherwise valid.

:::tip Restrict by network
To accept calls only from known IP ranges, use [Source IP restrictions](./security-guardrails#source-ip-restrictions).
:::

:::tip Group requests by conversation
Pair `X-User-Email` with [`X-Conversation-Id`](../monitor/conversation-grouping) to view per-user activity grouped into individual conversations in the dashboard.
:::

## Going further with the Policy Engine {#identity-aware-in-the-policy-engine-v2-console}

The **Identity & Network Trust** card in **Policy Engine > LLM Gateway** sets who must prove identity, who must send a conversation ID, and which networks may call. When the engine is on for the LLM Gateway, the app's identity requirements freeze and the card applies instead (see [Switching from classic settings](../../console/govern/switching-from-classic-settings)). How identity is verified (header mode, JWT, JWKS or PEM, allowed domains) stays in the app settings.

![Identity and Network Trust card showing Require identity required for 5 applications, Require conversation ID not set, and Allowed source IPs not set](/img/llm-gateway/ui/policy-identity-network-trust-card.png)

Every add button (**Require identity**, **Require conversation ID**, **Add ranges**) opens one dialog:

| Setting | Options | Notes |
|---|---|---|
| Require identity | Not set, Required, Not required | Satisfied by a verified JWT, an `X-User-Email` header, or a supported identity-token header. **Not required** waives a broader requirement. |
| Require conversation ID | Not set, Required, Not required | Checks the `X-Conversation-Id` header. |
| Calls may come from | Any IP, Listed ranges only | CIDR or single IPv4/IPv6 addresses. |
| Severity | Not set to Very critical | Reported only. Never changes the outcome. |

Scenarios the card supports:

- **Require identity tenant-wide, waive it for one service app.** Scope **Required** to Everyone and **Not required** to one Application or App tag. The highest-priority match wins.
- **Production only.** Require identity and a conversation ID, and limit source ranges, when request metadata marks the environment as production.
- **Per-group network limits.** Scope by People, Smart group, API surface, Environment, Tool or Source network. Requested model and Provider are not offered.

<PolicyCard
  name="govern_production_identity_network"
  stage="request"
  priority={850}
  when={[{ field: "Request metadata . environment", op: "is", value: "production" }]}
  then={[
    { effect: "Require identity", value: "true" },
    { effect: "Require conversation ID", value: "true" },
    { effect: "Allowed source IP ranges", values: ["10.0.0.0/8", "2001:db8:1200::/48"], tone: "info" },
  ]}
/>

:::warning Check overlapping IP lists
Source IP ranges ignore priority: every matching configuration narrows the list, and ranges that do not overlap are dropped. Two configurations with disjoint ranges (for example one app's office range and a tenant-wide VPN range) leave no allowed address, so the matching traffic is blocked.
:::

## Related

- [Conversation grouping](../monitor/conversation-grouping) - the `X-Conversation-Id` header.
- [Security guardrails](./security-guardrails#source-ip-restrictions) - per-app source IP restrictions.
- [Policy Engine overview](../../console/govern/policy-engine)
