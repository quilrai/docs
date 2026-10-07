---
sidebar_position: 23
sidebar_custom_props:
  icon: PenTool
---

# SketchIt

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">DIAGRAMS AND CHARTS</span><h2>A description in, a finished render out.</h2><p>Eight read-only tools for deterministic diagrams, charts, and presentation layouts - no server, no credential, no upstream call.</p></div>

SketchIt is a Quilr-built MCP that turns a description of a process, structure or dataset into a rendered diagram or chart. It has no upstream service and no credential: it makes no API calls, no LLM calls and fetches no external assets. Every render is deterministic, so the same input always produces the same output.

## Tools

The MCP provides 8 read-only tools. It never claims a diagram was created unless a render succeeded, and never guesses a title, icon or design the user has not asked for.

| Capability | Examples |
|------------|----------|
| Diagram rendering | Flowcharts, architecture and hierarchy diagrams, mind maps, sequence diagrams, timelines, cycles, matrices, funnels, comparisons |
| Chart rendering | Bar, grouped bar, stacked bar, line, area, scatter, pie, donut, table |
| Presentation compositions | 15 layouts (journey, chevron steps, priority hub, pyramid, problem vs. solution and more) inferred from the shape of the content |
| Design selection | An inline panel for style, composition, title, text alignment, font and icons before rendering |
| Visual variations | Several genuinely different layouts with rendered previews to pick from |
| Icon assignment | Icons from a bundled, offline Tabler gallery; only when asked |
| Themes and fonts | 6 style packs (Professional, Editorial, Sketch Notes, Colorful Blocks, Minimal Contrast, Soft Pastel), plus 6 fonts selectable on their own |
| Export formats | SVG, PNG (including transparent background), Mermaid source and the diagram spec as JSON, returned together |

A linear sequence renders as chevron steps, paired items as a two-column comparison, and related items around a theme as a hub:

![SketchIt chevron steps render of a new-hire onboarding sequence](/img/sketchit-chevron-steps.png)

![SketchIt problem-and-solution render pairing support pain points with their fixes](/img/sketchit-problem-solution.png)

![SketchIt priority hub render with four spokes around a shared-priorities center](/img/sketchit-priority-hub.png)

## Setup

There is nothing to prepare: no account, no API key and no OAuth consent.

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **SketchIt**.
2. Click **Install**. There is no credential prompt.
3. Make sure the tools are enabled in [Tool visibility](../protect/tool-visibility).

If **SketchIt** is not in your Library, contact Quilr.

### Verify

```text
Using SketchIt, render a flowchart for: draft a proposal, get manager approval,
send to the client.
```

```text
Using SketchIt, walk me through how a new hire gets set up: complete paperwork,
provision laptop and accounts, grant system access, team introduction, first-week
check-in. Don't tell me what design to use - let SketchIt suggest a few.
```

The first should return a rendered image in the reply, not a text description. The second should offer more than one genuinely different layout.

### Use it effectively

- Describe content and structure, not layout. SketchIt picks fitting designs from the shape of the content.
- Ask for the design panel when visual preferences matter.
- Request `transparent_background: true` for diagrams that sit on a slide or document.
- Ask for the diagram "as code" or "as data" to get the Mermaid source or JSON spec, both included with every render.
- If a diagram reports dropped items, ask for the plain flowchart layout or split the content.

### Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| A diagram is described but no image appears | The agent summarized instead of showing the image | Ask it to show the rendered image. |
| `INVALID_VISUAL_SPEC` | The content could not be structured into a valid diagram | Simplify or re-describe the content; check the returned validation details. |
| `COMPOSITION_CAPACITY_EXCEEDED` | The composition cannot hold every item legibly | Use the plain flowchart layout or split the content. |
| `ICON_ASSIGNMENT_INCOMPLETE` | Not every item has an icon yet | Ask the agent to assign the rest and render again. |
| Design panel or picker does not appear inline | The client does not support inline MCP Apps UI | Ask for the same choices as plain text. |
| Icons look generic | No good match in the offline gallery | Ask for a specific Tabler icon by name, or the neutral fallback marker. |

## Compared with Excalidraw

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

To set up Excalidraw instead, see [Excalidraw](../provider-setup/excalidraw).
