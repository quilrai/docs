---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How the QuilrAI Network Monitor processes every request, from the client application through the proxy to the origin server and back.

<ArchitectureDiagram
  source={{
    label: "Client Application",
    code: `# Explicit proxy mode
export HTTPS_PROXY=http://localhost:8443
export HTTP_PROXY=http://localhost:8080

# Or transparent redirect mode
# (no app config needed, packet redirector
#  intercepts at the OS network layer)`,
  }}
  gateway={{
    label: "QuilrAI Network Monitor",
    phases: [
      {
        label: "Intercept",
        stages: [
          { label: "Explicit Proxy", items: ["HTTP :8080", "HTTPS :8443", "Browser / app configured"] },
          { label: "Transparent Redirect", items: ["Packet Redirector", "Network Extension (macOS)", "WinDivert (Windows)"] },
        ],
      },
      {
        label: "Inspect",
        stages: [
          { label: "TLS MITM", items: ["Dynamic cert generation", "SNI-based host matching", "Per-host bypass list"] },
          { label: "WebSocket", items: ["Upgrade detection", "Bidirectional proxying", "Frame inspection"] },
        ],
      },
      {
        label: "Scan",
        stages: [
          { label: "DLP Engine", items: ["Contextual detection", "Exact data matching", "Block / redact / prompt"] },
          { label: "Analyzers", items: ["Remote API", "Local AI model", "Heuristic (regex + keywords)"] },
        ],
      },
      {
        label: "Enforce",
        stages: [
          { label: "Policy Decision", items: ["Allow: forward request", "Block: reject with 403", "Prompt: justification UI"] },
          { label: "Health Monitoring", items: ["Per-host circuit breakers", "Passive failure tracking", "Active probe checks"] },
        ],
      },
    ],
    footer: "Traffic Logging  ·  Process Attribution  ·  Health Metrics  ·  Kill Switch",
  }}
  destination={{
    label: "Origin Servers",
    items: ["HTTPS Endpoints", "HTTP Endpoints", "WebSocket Servers", "API Services", "SaaS Platforms", "Internal Services"],
  }}
/>

## Pipeline Stages

Every intercepted request flows through these stages in order. Each stage is independently configurable from the dashboard.

| Stage | Description |
|-------|-------------|
| **Explicit Proxy** | Accepts HTTP on port 8080 and TLS on port 8443. |
| **Transparent Redirect** | OS-level traffic interception via Network Extension (macOS) or WinDivert (Windows). No app config needed. |
| **TLS MITM** | TLS handshake with dynamic certificate generation and SNI extraction for HTTPS inspection. |
| **WebSocket** | Detects Upgrade headers and proxies WebSocket connections bidirectionally. |
| **DLP Engine** | Pluggable analyzer pipeline (remote API, local AI model, or heuristic regex) with content extraction rules. |
| **Policy Decision** | Allow, block, or prompt for justification based on DLP findings. Native or Tauri-based justification UI. |
| **Health Monitoring** | Per-host health states (Healthy / Degraded / Unhealthy / Critical) with circuit breakers. |

## Response Path

Responses from origin servers pass back through the **DLP engine** for output scanning before returning to the client. The same detection categories and actions (block, redact, prompt) apply to both directions.

## Platform Support

| Platform | Packet Redirector | Justification UI | Process Attribution |
|----------|------------------|-------------------|---------------------|
| **macOS** | Network Extension (kernel-level, Unix Socket IPC with SCM_RIGHTS) | Cocoa native dialog | Audit tokens (~5 ms) |
| **Windows** | WinDivert kernel driver (packet interception + rewrite) | Windows message-based dialog | SocketLayer events + GetExtendedUdpTable |
| **Cross-platform** | - | Tauri WebView (default) | - |

## Observability

Every request is logged with host, process attribution, DLP findings, and policy actions. Exposes `GET /health` (JSON) and `GET /metrics` (Prometheus). Remote **kill switch** disables the proxy via IPC; new connections get 503 while in-flight requests drain.
