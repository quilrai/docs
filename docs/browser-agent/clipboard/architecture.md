---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI Clipboard Monitor intercepts clipboard events on the endpoint, enforces DLP policies from the browser extension, and takes action without interrupting the user.

<ArchitectureDiagram
  source={{
    label: "Endpoint Clipboard",
    code: `# Clipboard monitoring settings
Monitor text:   ✓ enabled
Monitor files:  — disabled
Monitor images: — disabled
Debounce:       100 ms
Max payload:    10 KB`,
  }}
  gateway={{
    label: "QuilrAI Clipboard Monitor",
    phases: [
      {
        label: "Detect",
        stages: [
          { label: "OS Hook", items: ["WinAPI notification (Windows)", "NSPasteboard polling (macOS)", "Text / file / image types"] },
          { label: "Filter", items: ["Debounce window", "Content-type gates", "Payload size cap"] },
        ],
      },
      {
        label: "Inspect",
        stages: [
          { label: "Forward to Extension", items: ["Content metadata + type", "Size-capped payload", "Native Messaging pipe"] },
          { label: "Policy Evaluation", items: ["DLP rule match", "Allow / Block / Prompt", "User identity context"] },
        ],
      },
      {
        label: "Enforce",
        stages: [
          { label: "Allow", items: ["Clipboard operation completes", "Event logged silently"] },
          { label: "Block", items: ["Clipboard cleared on endpoint", "User notified"] },
          { label: "Prompt", items: ["Native OS dialog shown", "Justification captured and logged"] },
        ],
      },
    ],
    footer: "Logging  ·  Debounce  ·  Cross-platform  ·  Native Messaging",
  }}
  destination={{
    label: "Browser Extension",
    items: ["DLP Rule Evaluation", "Allow", "Block", "Prompt", "Audit Logs"],
  }}
/>

## Pipeline Stages

Every clipboard event flows through these stages in order. Each stage is independently configurable from the dashboard.

| Stage | Description |
|-------|-------------|
| **OS Hook** | Intercepts native clipboard-change notifications on Windows and macOS. |
| **Filter** | Suppresses events within the debounce window and applies content-type gates and payload size cap. |
| **Forward to Extension** | Sends content metadata to the browser extension over the Native Messaging pipe for policy evaluation. |
| **Policy Evaluation** | The extension evaluates DLP rules against the clipboard payload and returns Allow, Block, or Prompt. |
| **Enforce** | The endpoint executes the decision — clears clipboard on block, shows a native dialog on prompt. |

## Response Path

Policy decisions from the browser extension flow back through the **enforcement layer** before any action is taken. The same DLP rule set applies to all content types (text, files, images).

## Platform Support

| Platform | Hook Mechanism | Justification UI |
|----------|---------------|-----------------|
| **macOS** | NSPasteboard change-count polling | Native Cocoa dialog |
| **Windows** | WinAPI clipboard-change notification | Windows message-based dialog |

macOS requires **Accessibility permission** for the Sentinel process.

## Observability

Every clipboard event is logged with content type, policy decision, and enforcement outcome. Check **Logs under Clipboard Monitor** to review activity.
