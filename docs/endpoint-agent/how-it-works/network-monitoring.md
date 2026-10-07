---
sidebar_position: 1
sidebar_label: "Network monitoring"
sidebar_custom_props:
  icon: Rocket
---

# Network monitoring

The Endpoint Agent's network monitor is a local proxy that inspects AI traffic leaving the device. It decrypts HTTPS with a locally trusted certificate, runs DLP on requests and responses, and allows, blocks, or asks the user to justify each request.

<StepFlow steps={[
  { label: "Intercept", items: ["Explicit proxy :8080 / :8443", "Transparent redirect"] },
  { label: "Inspect", items: ["TLS inspection", "SNI host matching", "WebSocket frames"] },
  { label: "Scan", items: ["DLP engine", "Heuristic / local AI / API"] },
  { label: "Enforce", items: ["Allow", "Block (403)", "Prompt for justification"] },
]} />

## Components

| Platform | Binary | Runs as |
| --- | --- | --- |
| **macOS** | Transparent proxy system extension in `QuilrAIProxy.app` | macOS system extension (network extension), alongside the `com.quilrai.agent` LaunchDaemon |
| **Windows** | `quilrai-proxy.exe` | Child process of the `QuilrAIAgent` service, with the WinDivert driver |

The network monitor installs with the agent. See [Requirements](../get-started/requirements) for the certificate trust and driver prerequisites.

## Interception modes

| Mode | How it works | Best for |
| --- | --- | --- |
| **Explicit proxy** | Apps send HTTP to `:8080` and HTTPS to `:8443` (for example via `HTTP_PROXY` / `HTTPS_PROXY`). | Managed browsers and targeted monitoring. |
| **Transparent redirect** | A packet redirector captures traffic at the OS network layer: Network Extension on macOS, WinDivert on Windows. No app configuration needed. | Full endpoint coverage, including unmanaged apps. |

To point an app at the explicit proxy, set the proxy variables in its environment:

```bash
export HTTPS_PROXY=http://localhost:8443
export HTTP_PROXY=http://localhost:8080
```

Transparent redirection is turned on from the QuilrAI dashboard; configuration reaches the agent in real time.

## DLP settings

| Setting | Description |
| --- | --- |
| **Detection mode** | Heuristic (regex and keywords), local AI model, or remote API. |
| **Enforcement mode** | **Log only**, or **Enforce** (block or prompt for justification). |
| **Content extraction** | Domain-specific rules (JSONPath, regex selectors) that pull the prompt text out of each app's traffic. |
| **File upload limits** | Small uploads (up to 1 MB) are buffered in memory, medium (up to 10 MB) spill to disk, large (over 10 MB) are scanned partially. |

Policy changes reach agents in real time; no restart is needed. App-level policies are set in [App policies](../configure/app-policies).

## How a request is processed

| Stage | What happens |
| --- | --- |
| **TLS inspection** | The proxy completes the TLS handshake with a dynamically generated certificate and matches the host by SNI. Hosts on the per-host bypass list are not decrypted. |
| **WebSocket** | Upgrade requests are detected and WebSocket connections are proxied in both directions with frame inspection. |
| **DLP engine** | The configured analyzer checks the extracted content for sensitive data. |
| **Policy decision** | Allow forwards the request. Block rejects it with HTTP 403. Prompt shows a justification dialog (native Cocoa on macOS, native dialog on Windows, or a cross-platform web view). |
| **Response path** | Responses pass back through the DLP engine before reaching the app. The same categories and actions (block, redact, prompt) apply in both directions. |

Each request is attributed to the process that made it (audit tokens on macOS, socket-layer events on Windows), so findings show which app sent the data.

## Health and observability

- Every request is logged with host, process, DLP findings, and the action taken.
- Each host has a health state (Healthy, Degraded, Unhealthy, Critical) with circuit breakers driven by passive failure tracking and active probes.
- The proxy exposes `GET /health` (JSON) and `GET /metrics` (Prometheus) locally.
- A remote kill switch can disable the proxy. New connections then get HTTP 503 while in-flight requests finish. See [Agent kill switch](../deploy-and-operate/agent-kill-switch).

DLP findings and enforcement outcomes appear in [Findings and interactions](../../console/observe/findings-and-interactions).
