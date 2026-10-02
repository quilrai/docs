---
sidebar_position: 5
sidebar_custom_props:
  icon: Fingerprint
---

# Identity & Network Trust

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../authoring-and-publishing) a revision.
:::

Require callers to prove who they are, require a conversation ID, and limit where requests may come from. Runs at the request stage.

## Sections

The card always shows the same three controls.

![Require identity section with per-application configurations marked Required](/img/policy-engine/llm-identity-network-require-identity.jpg)

![Require conversation ID and Allowed source IPs sections, both not configured](/img/policy-engine/llm-identity-network-conversation-ips.jpg)

| Section | Satisfied by | Empty state | Add button |
|---|---|---|---|
| **Require identity** | A verified JWT, an `X-User-Email` header, or a supported identity-token header. | Not set: identity is not required. | **Require identity** |
| **Require conversation ID** | An `X-Conversation-Id` header on every request. | Requests are accepted without a conversation ID. | **Require conversation ID** |
| **Allowed source IPs** | IPv4 or IPv6 ranges in CIDR notation, or single addresses. | Requests are accepted from any IP address. | **Add ranges** |

## Settings

Every add button opens one dialog with all three requirements. The button you clicked pre-selects its own row.

| Setting | Options | Default | Notes |
|---|---|---|---|
| Require identity | Not set, Required, Not required | Not set | **Not required** waives a broader requirement for this scope. |
| Require conversation ID | Not set, Required, Not required | Not set | Same as above. |
| Source IPs | Any IP, Listed ranges only | Any IP | With **Listed ranges only**, add at least one range, for example `10.0.0.0/8`. |
| Severity | Not set, Very low, Low, Medium, High, Critical, Very critical | Not set | Reported only. |

Set at least one requirement. The policy name is generated from the scope.

## Example

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

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, API surface, Environment, Prompt text, Tool, Source network, or **Except...**. Requested model and Provider are not offered.
- **Require identity** and **Require conversation ID**: the highest-priority matching configuration wins.
- **Allowed source IPs** ignore priority. Every matching configuration narrows the list: ranges intersect, the narrower of two overlapping ranges is kept, and ranges that do not overlap are dropped. If nothing survives, every matching request is denied.

:::warning Check overlapping IP lists
Two configurations with disjoint ranges (for example one app's office range and a tenant-wide VPN range) leave no allowed address, so the matching traffic is blocked.
:::

## Legacy app settings

- Source IP lists replace [Source IP restrictions](../../llm-gateway/features/security-guardrails#source-ip-restrictions) in Security Guardrails.
- Require identity overlaps with **Enforce Identity** in the app's [Identity Aware](../../llm-gateway/features/identity-aware) settings. How identity is verified (headers, JWT, JWKS) is still configured per app there.
