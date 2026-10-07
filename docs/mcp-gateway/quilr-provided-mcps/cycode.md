---
sidebar_position: 21
sidebar_custom_props:
  icon: ShieldCheck
---

# Cycode

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">CODE SECURITY</span><h2>Secret scanning without a general-purpose shell.</h2><p>A remotely operated wrapper around the Cycode CLI MCP capability.</p></div>

<McpDecision
  officialTitle="Choose the provider CLI locally"
  official="Use Cycode's packaged CLI capability when local execution is desired and the client environment can safely operate the provider tooling."
  officialPoints={['Provider-packaged capability', 'Local execution model']}
  quilrTitle="Choose a remote governed wrapper"
  quilr="Use Quilr when teams need the same focused scan capability through HTTPS with health monitoring, gateway policy, and no general-purpose shell."
  quilrPoints={['Remote production operation', 'Only status and secret-scan tools']}
  verdict="The security result is similar; the meaningful choice is local CLI control versus a centrally operated, tightly bounded service."
/>

| Capability | Available |
|---|:---:|
| Cycode service status | ✅ |
| Secret scan | ✅ |
| Arbitrary shell execution | - |
| Remote HTTPS MCP | ✅ |
| Production health monitoring | ✅ |
| Gateway policy and audit | ✅ |

Repository content selected for scanning may be sent to the configured Cycode service. Apply your organization's source-code handling policy before enabling this integration.
