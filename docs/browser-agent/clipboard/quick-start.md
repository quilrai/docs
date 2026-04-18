---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with Clipboard Monitoring in 4 steps.

<StepFlow steps={[
  {
    label: "Enable Monitor",
    items: [
      "Platform: macOS / Windows",
      "Content: text enabled",
      "Status: active ✓",
    ],
  },
  {
    label: "Choose Content Types",
    items: [
      "Text: ✓ monitored",
      "Files: — off by default",
      "Images: — off by default",
    ],
  },
  {
    label: "Set DLP Policies",
    items: [
      "PII detected: block",
      "Credentials: block",
      "Custom rules: configurable",
    ],
  },
  {
    label: "Monitor Events",
    items: [
      "Events forwarded: 142",
      "Blocked: 3",
      "Prompted: 1",
    ],
  },
]} />

## 1. Enable the Monitor

The clipboard monitor runs as part of the Sentinel endpoint agent and starts automatically on deployment.

| Platform | Requirement |
|----------|------------|
| **macOS** | Grant **Accessibility permission** to the Sentinel process in System Settings → Privacy & Security |
| **Windows** | No additional permissions required |

Deploy the Sentinel agent via MDM or GPO. The clipboard monitor activates immediately.

## 2. Choose Content Types

Navigate to **Clipboard Monitor → Settings** in the dashboard to configure which clipboard operations to intercept.

| Setting | Default | Description |
|---------|---------|-------------|
| **Monitor text** | On | Captures plain text and rich-text clipboard copies |
| **Monitor files** | Off | Captures file-path clipboard events |
| **Monitor images** | Off | Captures image clipboard events |
| **Debounce window** | 100 ms | Suppresses repeated events within this window |
| **Max payload size** | 10 KB | Payload forwarded to the extension is capped at this size |

Changes are pushed to the endpoint agent and take effect on the next agent restart.

## 3. Set DLP Policies

Define rules in the browser extension under **DLP Policies → Clipboard**. Rules match on content category, size, or custom regex patterns.

| Action | What Happens |
|--------|-------------|
| **Allow** | Clipboard operation completes silently; event is logged |
| **Block** | Endpoint clears the clipboard; user is notified |
| **Prompt** | Native OS dialog asks the user for a justification before continuing |

## 4. Monitor Events

Check **Logs under Clipboard Monitor** to verify events are flowing and policies are being enforced.

- **Event volume**: clipboard events detected and forwarded per hour
- **Policy decisions**: allow, block, and prompt counts by content type
- **Justification text**: user responses to prompted events
- **Enforcement outcomes**: confirmation of block and clear actions on the endpoint

---

**Next step:** See the [Architecture](./architecture) for the full detection and enforcement pipeline.
