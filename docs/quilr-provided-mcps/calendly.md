---
sidebar_position: 12
sidebar_custom_props:
  icon: CalendarDays
---

# Calendly

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">SCHEDULING OPERATIONS</span><h2>Enterprise-owned OAuth for the full scheduling lifecycle.</h2><p>Forty tools across event types, availability, meetings, routing, webhooks, organizations, and compliance.</p></div>

<McpDecision
  officialTitle="Choose official for DCR clients"
  official="Use Calendly's hosted server when your MCP client supports Dynamic Client Registration and provider-managed onboarding fits your environment."
  officialPoints={['Provider-hosted remote MCP', 'Modern DCR-native onboarding']}
  quilrTitle="Choose Quilr for owned credentials"
  quilr="Use Quilr when the enterprise must own the OAuth application or the client depends on pre-registered credentials."
  quilrPoints={['Customer-owned OAuth app', 'Forty lifecycle tools behind gateway policy']}
  verdict="The deciding factor is credential ownership and client compatibility-not scheduling feature coverage."
/>

| Capability | Calendly Official MCP | Quilr Calendly |
|---|:---:|:---:|
| Hosted remote MCP | ✅ | ✅ |
| Dynamic Client Registration | ✅ Required | - |
| Customer-owned OAuth application | - | ✅ |
| Pre-registered client credentials | - | ✅ |
| Scheduling read/write | ✅ | ✅ |
| Routing and availability | ✅ | ✅ |
| Webhook and organization workflows | ✅ | ✅ |
| Gateway guardrails and audit | Via gateway | ✅ Native deployment model |

Use Calendly's official server for modern DCR-compatible clients. Use Quilr when the organization must own the OAuth application or the client requires pre-registered credentials.

See [Calendly setup](../mcp-gateway/mcp-provider-setup/calendly) for the complete tool and scope matrix.
