---
sidebar_position: 9
sidebar_custom_props:
  icon: Fingerprint
---

# Identity Aware

Authenticate and track users behind each API key.

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
      "Requests today: 142",
      "Rate limit: 80% used",
    ],
  },
]} />

1. **Request Arrives** - App sends an API call with identity info
2. **Gateway Identifies User** - Extracts identity via header or JWT token
3. **Per-User Tracking** - Usage tracked per user with rate limits and analytics

## Authentication Modes

### Header Based - Recommended for trusted clients

Uses the `X-User-Email` header to identify users. If your app handles user login and makes LLM calls from your own backend, this is the easiest and recommended approach - just pass the logged-in user's email as a header.

```
X-User-Email: user@company.com
```

### JWKS Endpoint - For untrusted clients

Validates JWT tokens using a JWKS URL for dynamic key rotation. Ideal for production OAuth/OIDC flows with providers like Auth0, Okta, or Google.

```
https://your-provider/.well-known/jwks.json
```

### Public Key (PEM)

Validates JWT tokens using a static RSA public key. Suitable for environments with fixed signing keys where JWKS isn't available.

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqh...
-----END PUBLIC KEY-----
```

## JWT Claims Validation

| Claim | Description |
|-------|-------------|
| **Allowed Issuers** (`iss`) | Only tokens from trusted identity providers are accepted |
| **Authorized Parties** (`azp` / `client_id`) | Restricts which OAuth clients can access the gateway |

## Access Controls

Each API key has three independent identity controls. They compose: turn on header identity to accept the `X-User-Email` header, turn on enforced identity to make identity mandatory, and list allowed domains to whitelist who counts as identity.

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
| **Enabled** | Request must carry either a valid JWT or a valid `X-User-Email` (when Identity Header Mode is on). Bare API-key requests are rejected with *"This API key requires identity context."* |
| **Disabled** (default) | Identity is logged if present but never required. |

JWT auth always satisfies Enforce Identity - the JWT itself is the identity. The `X-User-Email` header only satisfies it when Identity Header Mode is also enabled.

### Allowed User Domains

A list of email domains permitted as identity.

| Setting | Behavior |
|---------|----------|
| Empty (default) | Any email domain is accepted. |
| Specific domains (e.g. `company.com`, `partner.com`) | Only emails in these domains are accepted. |

The check runs on both the `X-User-Email` header and the `email` claim extracted from JWTs. Requests from disallowed domains are rejected even if the JWT signature is otherwise valid.

:::tip Group requests by conversation
Pair `X-User-Email` with [`X-Conversation-Id`](./conversation-grouping) to view per-user activity grouped into individual conversations in the dashboard.
:::
