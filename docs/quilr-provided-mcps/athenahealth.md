---
sidebar_position: 19
sidebar_custom_props:
  badge: safety-first
  icon: ShieldCheck
---

# Athenahealth

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">CLINICAL SYSTEM SAFETY</span><h2>An MCP designed around what must never leak.</h2><p>Nine tools over athenaOne and FHIR with capability packs, confirmation, idempotency, and PHI-safe operations.</p></div>

<McpDecision
  officialTitle="Build directly on Athena APIs"
  official="Use athenaOne and FHIR APIs directly when your integration team wants full control of the application, workflow, and clinical safeguards."
  officialPoints={['Maximum implementation flexibility', 'Your team owns every safety control']}
  quilrTitle="Add a clinical safety boundary"
  quilr="Use Quilr when an agent needs a deliberately constrained surface with PHI-safe telemetry, gated writes, and idempotent operations."
  quilrPoints={['Capability packs disabled by default', 'Confirmed writes with no automatic retry']}
  verdict="For agent access, the safety model is the product: start with the narrowest capability pack and enable writes only for a validated workflow."
/>

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
