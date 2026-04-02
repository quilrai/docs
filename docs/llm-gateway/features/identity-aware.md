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

### Enforce Identity

When enabled, requests without valid identity (header or JWT) are **rejected at the gateway** - bare API key access is blocked.

### Allowed User Domains

Restrict access to specific email domains (e.g., `company.com`). Applies to both `X-User-Email` header and JWT email claims.
