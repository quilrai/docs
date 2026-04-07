---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Get up and running with Network Monitoring in 4 steps.

<StepFlow steps={[
  {
    label: "Install Agent",
    items: [
      "Platform: macOS / Windows",
      "Service: background daemon",
      "Deploy: MDM / GPO",
    ],
  },
  {
    label: "Enable Interception",
    items: [
      "Mode: Explicit or Transparent",
      "Ports: :8080 / :8443",
      "TLS: MITM certificate",
    ],
  },
  {
    label: "Configure DLP",
    items: [
      "Detection: Heuristic / AI / API",
      "Enforcement: Log or Block",
      "Upload limits: configurable",
    ],
  },
  {
    label: "Monitor",
    items: [
      "Request volume: per-host",
      "DLP detections: real-time",
      "Health: circuit breakers",
    ],
  },
]} />

## 1. Install the Sentinel Agent

Deploy the Sentinel endpoint agent to your fleet. Installs automatically and runs as a background service.

| Platform | Agent Binary | Service |
|----------|-------------|---------|
| **macOS** | `sentinel-proxy` | LaunchDaemon with Network Extension |
| **Windows** | `sentinel-proxy.exe` | Windows Service with WinDivert driver |


## 2. Enable Traffic Interception

| Mode | How It Works | Best For |
|------|-------------|----------|
| **Explicit Proxy** | Route HTTP/HTTPS through `:8080` / `:8443` | Managed browsers, targeted monitoring |
| **Transparent Redirect** | Packet Redirector intercepts at the OS network layer | Full endpoint coverage, unmanaged apps |

Enable transparent redirection from the dashboard under **Interception Policy under Network Monitoring**. Configuration is pushed via SSE.

## 3. Configure DLP Policies

| Setting | Description |
|---------|-------------|
| **Detection Mode** | Heuristic (regex + keywords), AI model (local inference), or remote API |
| **Enforcement Mode** | `Log Only` or `Enforce` (block or prompt for justification) |
| **Content Extraction** | Domain-specific extraction rules (JSONPath, regex selectors) |
| **File Upload Limits** | Buffer thresholds: small (≤ 1 MB in-memory), medium (≤ 10 MB disk-spilled), large (> 10 MB partial) |

Policies are pushed to agents in real-time. No restart required.

## 4. Monitor Activity

Every request is logged with full metadata. Check **Logs under Network Monitoring** to verify traffic.

- **Request volume** : total, per-host, per-process breakdowns
- **DLP detections** : findings with category, confidence, and matched entities
- **Enforcement actions** : allow, block, justify decisions with justification text
- **Health status** : proxy state (Healthy / Degraded / Unhealthy / Critical) with circuit breaker states

