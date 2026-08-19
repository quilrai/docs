---
sidebar_position: 23
sidebar_custom_props:
  icon: PenTool
---

# SketchIt

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">DIAGRAMS AND CHARTS</span><h2>A description in, a finished render out.</h2><p>Eight read-only tools for deterministic diagrams, charts, and presentation layouts - no server, no credential, no upstream call.</p></div>

<McpDecision
  officialTitle="Choose Excalidraw for a live canvas"
  official="Use Excalidraw when the team needs a shared, hand-drawn-style whiteboard that people and agents keep editing together over time."
  officialPoints={['Editable canvas any client can open', 'Element-level read and write control']}
  quilrTitle="Choose SketchIt for a zero-setup render"
  quilr="Use SketchIt when the job is a finished diagram or chart handed back in the reply, with nothing to self-host and nothing to authorize."
  quilrPoints={['No server, OAuth, or API key at all', 'Deterministic SVG, PNG, Mermaid, and JSON output']}
  verdict="Choose Excalidraw when the diagram must stay a shared, editable artifact. Choose SketchIt when the goal is a fast, disposable, ready-to-use render."
/>

| Capability | Excalidraw | SketchIt |
|---|:---:|:---:|
| Zero setup - nothing to self-host or authorize | - | ✅ |
| Live, multi-agent editable canvas | ✅ | - |
| Deterministic - same input always renders the same | - | ✅ |
| Diagram generation from a text description | Partial - `create_from_mermaid` only | ✅ |
| Presentation-style layouts (hub, chevron, pyramid, and more) | - | ✅ 15 layouts |
| Chart rendering (bar, line, pie, and more) | - | ✅ |
| Element-level read and write editing | ✅ | - |
| Export formats | PNG, SVG, `.excalidraw` | SVG, PNG, Mermaid, JSON |

Choose Excalidraw when the diagram is shared state that people and agents keep changing. Choose SketchIt when an agent just needs to hand back a finished visual. See [SketchIt setup](../mcp-gateway/mcp-provider-setup/sketchit) - there's nothing to configure, just enable it.
