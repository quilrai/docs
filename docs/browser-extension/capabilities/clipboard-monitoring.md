---
sidebar_position: 1
sidebar_label: "Clipboard monitoring"
sidebar_custom_props:
  icon: Rocket
---

# Clipboard monitoring

Clipboard monitoring catches sensitive data at the copy step. The QuilrAI agent on the endpoint watches clipboard events, sends them to the Browser Extension for a DLP decision, and then allows the copy, clears the clipboard, or asks the user for a justification.

<StepFlow steps={[
  { label: "Detect", items: ["OS clipboard hook", "Debounce + type gates", "Payload size cap"] },
  { label: "Inspect", items: ["Sent to the extension", "DLP rules evaluated", "User identity context"] },
  { label: "Enforce", items: ["Allow: logged", "Block: clipboard cleared", "Prompt: justification"] },
]} />

## Set it up

The clipboard monitor is part of the QuilrAI agent that you deploy with the extension (see [Prerequisites](../get-started/prerequisites)). It starts automatically after deployment.

| Platform | Requirement |
| --- | --- |
| **macOS** | Grant **Accessibility** permission to the QuilrAI agent process in System Settings › Privacy & Security. |
| **Windows** | No additional permissions. |

## Settings

Clipboard settings are managed with your QuilrAI representative and pushed to the agent. They take effect on the next agent restart.

| Setting | Default | Description |
| --- | --- | --- |
| **Monitor text** | On | Plain-text and rich-text copies. |
| **Monitor files** | Off | File-path clipboard events. |
| **Monitor images** | Off | Image clipboard events. |
| **Debounce window** | 100 ms | Repeated events inside this window are suppressed. |
| **Max payload size** | 10 KB | Content sent to the extension is capped at this size. |

## Policy actions

The extension evaluates its DLP rules against the clipboard content (by content category, size, or custom regex). Clipboard rules are browser controls: open **Govern › Policy Engine › Browser Extension** and add or edit a control whose use case is **A user is copying to clipboard** (see [Browser controls](../configure/browser-controls)). The same rule set applies to text, files, and images.

| Action | What happens |
| --- | --- |
| **Allow** | The copy completes and the event is logged. |
| **Block** | The agent clears the clipboard and notifies the user. |
| **Prompt** | A native dialog asks the user for a justification before continuing. The justification is logged. |

## How it works

1. **OS hook.** The agent listens for clipboard changes: NSPasteboard change-count polling on macOS, WinAPI clipboard-change notifications on Windows.
2. **Filter.** Events inside the debounce window, disabled content types, and oversized payloads are dropped or trimmed.
3. **Forward.** Content metadata and a size-capped payload go to the Browser Extension over the Native Messaging pipe.
4. **Evaluate.** The extension applies its DLP rules with the user's identity and returns Allow, Block, or Prompt.
5. **Enforce.** The agent carries out the decision on the endpoint. The justification dialog is a native Cocoa dialog on macOS and a native dialog on Windows.

## Monitor activity

Every clipboard event is logged with its content type, policy decision, and enforcement outcome. Clipboard events appear in [Findings and interactions](../../console/observe/findings-and-interactions) (**Observe › Findings & Interactions**). Check there that events are flowing and policies are enforced, including user justifications for prompted copies.

To pause clipboard monitoring together with the agent's other services, use the [agent kill switch](./agent-kill-switch).
