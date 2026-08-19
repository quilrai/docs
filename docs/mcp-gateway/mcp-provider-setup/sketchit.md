---
sidebar_position: 15
sidebar_custom_props:
  icon: PenTool
---

# SketchIt

**SketchIt** is a QuilrAI-built MCP that turns a description of a process, structure, or dataset into a rendered diagram or chart. Unlike every other guide in this section, there is no OAuth app, Client ID, Client Secret, or API key to create - SketchIt is enabled, not connected. It has no upstream service and no credential to configure: it makes no API calls, no LLM calls, and fetches no external assets. Every render is deterministic - the same input always produces the same output.

See [Quilr-Provided MCPs: SketchIt](../../quilr-provided-mcps/sketchit) for how it compares to [Excalidraw](./excalidraw).

## What This MCP Can Do

| Capability | Examples | Access |
|------------|----------|--------|
| Diagram rendering | Flowcharts, architecture and hierarchy diagrams, mind maps, sequence diagrams, timelines, cycles, matrices, funnels, comparisons | Read only |
| Chart rendering | Bar, grouped bar, stacked bar, line, area, scatter, pie, donut, table | Read only |
| Presentation compositions | 15 non-flowchart layouts (journey, chevron steps, priority hub, pyramid, problem vs. solution, and more) inferred from the shape of the content, not fixed slots | Read only |
| Design selection | An inline design panel for style, composition, title, text alignment, font, and icon choices before rendering | Read only |
| Visual variations | Several genuinely different layout options inferred from content structure (a sequence, a hub, an irregular graph), with rendered previews to pick from | Read only |
| Icon assignment | Search and assign icons from a pinned, offline Tabler icon gallery; never inferred without being asked, never invented | Read only |
| Theme and font control | 6 built-in style packs (Professional, Editorial, Sketch Notes, Colorful Blocks, Minimal Contrast, Soft Pastel), each with its own bundled font, plus 6 fonts selectable independently of the theme's colors | Read only |
| Export formats | SVG, PNG (including transparent-background variants), Mermaid source, and the normalized diagram spec as JSON - all returned together | Read only |

The MCP provides 8 tools. It never claims a diagram was created unless a render actually succeeded, and it never guesses a title, an icon, or a design the user hasn't specified.

:::note
SketchIt does not call an LLM and does not fetch any external URL, image, or font at render time - every asset (icons, fonts, layout logic) is bundled in the service itself. There is nothing to authorize and nothing that varies by which user is asking.
:::

## Example Renders

The same request-and-render loop produces a range of layouts, chosen for the shape of the content rather than defaulted to a plain flowchart.

A linear sequence renders as chevron steps:

![SketchIt chevron steps render of a new-hire onboarding sequence](/img/sketchit-chevron-steps.png)

Paired items render as a two-column comparison:

![SketchIt problem-and-solution render pairing support pain points with their fixes](/img/sketchit-problem-solution.png)

A set of related items around a common theme renders as a hub:

![SketchIt priority hub render with four spokes around a shared-priorities center](/img/sketchit-priority-hub.png)

## Before You Start

There is nothing to prepare. SketchIt needs no account, no API key, and no OAuth consent - if it's available in your MCP Store, it's ready to use.

## Enable SketchIt

1. Open **SketchIt** from the MCP Store.
2. Add it to your agent - there is no credential prompt.
3. Start with the verification request below.

If **SketchIt** is not available in your MCP Store, contact your QuilrAI administrator.

## Verify The Connection

Start with a simple render:

```text
Using SketchIt, render a flowchart for: draft a proposal, get manager approval,
send to the client.
```

Then test the inline design and variation flow:

```text
Using SketchIt, walk me through how a new hire gets set up: complete paperwork,
provision laptop and accounts, grant system access, team introduction, first-week
check-in. Don't tell me what design to use - let SketchIt suggest a few.
```

The first call should return a rendered image directly in the reply, not just a text description. The second should offer more than one genuinely different layout to choose from - SketchIt reads the shape of the content to decide, rather than always defaulting to a plain flowchart.

## Use It Effectively

- Describe content and structure, not layout - SketchIt infers whether a linear sequence, a hub-and-spoke set of related items, or an irregular graph fits best, and offers several fitting designs rather than one guess.
- Ask for the design panel (style, composition, title, alignment, font, icons) whenever visual preferences matter; SketchIt never assumes a title or picks icons on its own unless asked.
- Request `transparent_background: true` when the diagram needs to sit on a slide or document background instead of SketchIt's own canvas.
- Ask for the diagram "as code" or "as data" if Mermaid source or the underlying JSON spec is more useful than the image - both are already included with every render.
- Composition capacity is real but generous and content-driven, not a fixed slot count; if a diagram reports items were dropped, ask for the plain flowchart layout or split the content instead of accepting a partial result.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| A response describes a diagram but no image appears | The agent summarized the result in text instead of showing the returned image | Ask the agent to show the rendered image directly; a successful render always includes one. |
| `INVALID_VISUAL_SPEC` | The content couldn't be structured into a valid diagram spec | Ask the agent to simplify or re-describe the content; check the validation details returned with the error. |
| `COMPOSITION_CAPACITY_EXCEEDED` | The chosen composition can't hold every item at a legible size | Ask for the plain flowchart layout, or split the content into smaller diagrams. |
| `ICON_ASSIGNMENT_INCOMPLETE` | Icons were requested but not every item has one yet | Ask the agent to assign the remaining icons and render again. |
| Design panel or variation picker doesn't appear inline | The connected client doesn't support inline MCP Apps UI | Ask for the same choices as plain text - the structured options are still returned either way. |
| Icons look wrong or generic | An icon was chosen from the offline catalog without a good match | Ask for a different icon by name from the built-in Tabler gallery, or ask SketchIt to use the neutral fallback marker instead. |

## References

- SketchIt's source, full tool list, and theme/font/composition reference live in the `sketchit_mcp` service repository (`docs/mcp-tools.md`, `docs/themes.md`, `docs/visualspec-authoring.md`). Link to those docs directly once this page has a permanent home in this site's nav - the exact path depends on where this repo mounts them.
