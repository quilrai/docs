---
sidebar_position: 9.2
sidebar_custom_props:
  icon: Fingerprint
---

# Identity Aware

Identify the user behind every gateway call, require identity where you need it, and verify caller JWTs.

Open the app's **Settings > Identity Aware** (under **Identity & content**). New apps have every control off: identity optional, conversation ID optional, any user domain, JWT not verified. When the Policy Engine is on, identity requirements are set there instead; see [Identity Aware in the Policy Engine](#identity-aware-in-the-policy-engine-v2-console).

![Identity Aware section with Identity header mode, Enforce identity and Enforce conversation ID switches, Allowed user domains, and JWT authentication with Allowed issuers, Allowed client IDs and Signing key source](/img/llm-gateway/ui/app-identity-aware.png)

## How It Works

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

## Authentication Modes

### Header Based - Recommended for trusted clients

Uses the `X-User-Email` header to identify users. If your app handles user login and makes LLM calls from your own backend, this is the easiest and recommended approach - just pass the logged-in user's email as a header.

```
X-User-Email: user@company.com
```

### JWT with a JWKS URL - For untrusted clients

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

## JWT Claims Validation

| Claim | Description |
|-------|-------------|
| **Allowed issuers** (`iss`) | Only tokens from trusted identity providers are accepted |
| **Allowed client IDs** (`azp` / `client_id`) | Restricts which OAuth clients can access the gateway |

## Access Controls

Each app has three independent identity controls, plus [Enforce conversation ID](./conversation-grouping). They compose: turn on header identity to accept the `X-User-Email` header, turn on enforced identity to make identity mandatory, and list allowed domains to whitelist who counts as identity.

### Identity Header Mode

Controls whether the gateway reads the `X-User-Email` header at all.

| Mode | Behavior |
|------|----------|
| **Enabled** | Gateway reads `X-User-Email` from every request, attaches it to logs and per-user analytics, and (when Enforce Identity is on) accepts it as valid identity. |
| **Disabled** (default) | `X-User-Email` is ignored even if sent. JWT is still the only identity source. |

Leave it off for apps using JWT only. Turn it on for trusted backends that pass the logged-in user's email to the gateway.

### Enforce Identity

Makes identity mandatory. After auth succeeds, the request is only accepted if identity was also provided.

| Mode | Behavior |
|------|----------|
| **Enabled** | Request must carry either a valid JWT or a valid `X-User-Email` (when Identity Header Mode is on). Requests with only a Quilr key are rejected with *"This API key requires identity context."* |
| **Disabled** (default) | Identity is logged if present but never required. |

JWT auth always satisfies Enforce Identity - the JWT itself is the identity. The `X-User-Email` header only satisfies it when Identity Header Mode is also enabled.

### Allowed User Domains

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
Pair `X-User-Email` with [`X-Conversation-Id`](./conversation-grouping) to view per-user activity grouped into individual conversations in the dashboard.
:::

## Identity Aware in the Policy Engine (V2 console)

With the Policy Engine on, open **Policy Engine > LLM Gateway** and expand the **Identity & Network Trust** card. It lists every configuration that requires identity, a conversation ID, or approved source IPs.

![Identity and Network Trust card showing Require identity required for 5 applications, Require conversation ID not set, and Allowed source IPs not set](/img/llm-gateway/ui/policy-identity-network-trust-card.png)

Click **Require identity** (or **Edit** on a row) to open a configuration:

| Field | Options |
|-------|---------|
| **Applies to** | Everyone, People, Smart group, Application, App tag, API surface, Environment, Prompt text, Tool, Source network, or Except. Or pick an application directly. |
| **Require identity** | Not set, Required, Not required. Satisfied by a verified JWT, an `X-User-Email` header, or a supported identity-token header. |
| **Require conversation ID** | Not set, Required, Not required. Checks the `X-Conversation-Id` header. |
| **Calls may come from** | Any IP, or Listed ranges only (CIDR or single addresses). |
| **Severity** | Reported on matching requests for dashboards, exports and alerts. Never changes the outcome. |

![Require section of a new Identity and Network Trust configuration with Require identity, Require conversation ID, Calls may come from and Severity](/img/llm-gateway/ui/policy-identity-require-dialog.png)

- For identity and conversation ID, the highest-priority matching configuration wins.
- Source IP ranges from every matching configuration intersect, and priority is ignored.
- **Add to draft** stages the change. Nothing applies until you publish the revision. See [Authoring and Publishing](../../policy-engine/authoring-and-publishing).
