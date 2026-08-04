---
sidebar_position: 19
sidebar_custom_props:
  badge: safety-first
  icon: ShieldCheck
---

# Athenahealth

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">CLINICAL SYSTEM SAFETY</span><h2>An MCP designed around what must never leak.</h2><p>Nine tools over athenaOne and FHIR with capability packs, confirmation, idempotency, and PHI-safe operations.</p></div>

| Safety control | Quilr Athenahealth |
|---|:---:|
| Customer-owned Athena system application | ✅ |
| Operator allowlists and capability packs | ✅ Disabled by default |
| Separate athenaOne and FHIR batch reads | ✅ |
| Confirmed writes with unique idempotency keys | ✅ |
| Automatic write retry | - Never |
| Separately enabled and strongly confirmed deletes | ✅ |
| FHIR bulk-export job start/status without PHI download | ✅ |
| PHI in app state, logs, traces, or persistent audit | - Prohibited |

Athenahealth publishes athenaOne and FHIR APIs but no official MCP was identified. Quilr supplies the MCP boundary and its clinical safety model.
