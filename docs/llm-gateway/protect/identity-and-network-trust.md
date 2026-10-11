---
sidebar_position: 5
sidebar_label: "Identity and network trust"
sidebar_custom_props:
  icon: Fingerprint
description: "Where the LLM Gateway takes user identity from, how to require identity and conversation IDs, verify JWTs, restrict domains and limit source networks."
---

# Identity and network trust

Identify the user behind every gateway call, require identity or a conversation ID where you need it, verify caller JWTs, and limit which networks may call the gateway.

## Turn it on for an app

Identity is configured per app. Open the app from **Settings > AI Gateway > LLM Gateway** and choose any **Configure** option to open the app workspace's **Settings** tab, then select **Identity Aware** under **Identity & content**. Apps with it on show an **Identity aware** chip in the app list.

New apps start with identity optional, conversation ID optional, any user domain and JWT not verified. The `X-User-Email` header is always captured. Network limits are set separately under [Source IP restrictions](./security-guardrails#source-ip-restrictions) in the Guardrails tab.

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

Uses the `X-User-Email` header to identify users. The gateway always reads it. If your app handles user login and makes LLM calls from your own backend, this is the easiest and recommended approach - just pass the logged-in user's email as a header.

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

## Where identity comes from

The gateway takes a person's identity from the first source present, in this order:

| Order | Source | Notes |
|---|---|---|
| 1 | Verified JWT | Only when **JWT authentication** is on. The `email` claim names the person. |
| 2 | Self-service key | A key issued to one person through [Self-service](../self-service/overview). |
| 3 | `X-User-Email` header | Always captured, never verified. Send it only from a backend you trust. |
| 4 | Forwarded identity-token headers | Identity tokens forwarded by supported clients. |

**Allowed user domains** apply to every source. Email matching ignores case, so `Ana@Example.com` and `ana@example.com` are the same person in logs, policies and per-person budgets.

Identity drives per-user analytics and every per-person control. [Per-person budgets and rate limits](../cost-and-traffic/budgets-and-limits-how-to#give-each-person-in-an-app-their-own-budget) skip requests with no identified person, so turn on **Enforce identity** for apps that must always name one.

## Access controls

The **Identity enforcement** section of each app has the controls below, plus [Enforce conversation ID](../monitor/conversation-grouping).

![Identity enforcement section with the locked Identity header mode switch reading The X-User-Email header is always captured, the Enforce identity and Enforce conversation ID switches, and Allowed user domains](/img/policy/identity-enforcement.png)

### Identity header mode

Always on and not editable. The gateway reads the `X-User-Email` header from every request and attaches it to logs and per-user analytics, whatever value older app settings stored.

### Enforce identity

Makes identity mandatory. After auth succeeds, the request is only accepted if identity was also provided.

| Mode | Behavior |
|------|----------|
| **Enabled** | The request must carry identity from one of the sources above. Requests with only a Quilr key are rejected with *"This API key requires identity context."* |
| **Disabled** (default) | Identity is logged if present but never required. |

### Allowed user domains

A list of email domains permitted as identity.

| Setting | Behavior |
|---------|----------|
| Empty (default) | Any email domain is accepted. |
| Specific domains (e.g. `company.com`, `partner.com`) | Only emails in these domains are accepted. |

The check runs on every identity source. Requests from disallowed domains are rejected even if the JWT signature is otherwise valid.

:::tip Restrict by network
To accept calls only from known IP ranges, use [Source IP restrictions](./security-guardrails#source-ip-restrictions).
:::

:::tip Group requests by conversation
Pair `X-User-Email` with [`X-Conversation-Id`](../monitor/conversation-grouping) to view per-user activity grouped into individual conversations in the dashboard.
:::

## Going further with the Policy Engine {#identity-aware-in-the-policy-engine-v2-console}

The **Identity & Network Trust** card in **Policy Engine > LLM Gateway** sets who must prove identity, who must send a conversation ID, and which networks may call. When the engine is on for the LLM Gateway, the app's identity requirements freeze and the card applies instead (see [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings)). How identity is verified (JWT, JWKS or PEM, allowed domains) stays in the app settings.

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
