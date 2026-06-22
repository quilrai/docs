---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Verify your endpoints meet the requirements before deploying the Sentinel agent.

<StepFlow steps={[
  {
    label: "OS",
    items: [
      "macOS 13+ (Ventura or later)",
      "Windows 10 / Server 2019+",
      "64-bit only",
    ],
  },
  {
    label: "Access",
    items: [
      "macOS: root (LaunchDaemon)",
      "Windows: SYSTEM (Service)",
      "MDM / GPO deployment supported",
    ],
  },
  {
    label: "Network",
    items: [
      "api.quilr.ai: 443 outbound",
      "Proxy passthrough (if applicable)",
      "No inbound ports required",
    ],
  },
  {
    label: "Platform",
    items: [
      "macOS: Network Extension approval",
      "Windows: WinDivert driver",
      "Keychain / cert store write access",
    ],
  },
]} />

## OS Requirements

| Platform | Minimum Version | Notes |
|----------|----------------|-------|
| **macOS** | 13.0 (Ventura) | Network Extension requires Ventura+ |
| **Windows** | 10 (1903+) or Server 2019 | WinDivert driver requires 64-bit |

## Access Requirements

| Platform | Required Access | Used For |
|----------|----------------|----------|
| **macOS** | `root` | LaunchDaemon, system extension install, keychain write |
| **Windows** | `SYSTEM` / Administrator | Windows Service, WinDivert driver, cert store write |

The agent is deployed via MDM (Jamf, Intune, Kandji) or GPO. The installer handles service registration and cert trust automatically when run with `--trust-cert --register-as-service`.

## Network Requirements

The agent only makes outbound connections. No inbound ports are required.

| Destination | Port | Purpose |
|-------------|------|---------|
| `api.quilr.ai` | 443 (HTTPS) | Backend sync: discovery, governance, activity |
| CDN (version check) | 443 (HTTPS) | Auto-updater version manifest and package download |

If the endpoint routes through a corporate proxy, configure the proxy to pass through these destinations without TLS inspection of the agent's own traffic.

## Platform-Specific Requirements

### macOS

| Requirement | Details |
|-------------|---------|
| **System Extension** | User must approve in System Settings > Privacy & Security after first install |
| **Network Extension entitlement** | Bundled in `sentinel-proxy` via provisioning profile |
| **Keychain write** | Required to trust the MITM root CA (`security add-trusted-cert`) |
| **File Descriptor limit** | Raised to 10,240 by installer (`ulimit -n`) |

### Windows

| Requirement | Details |
|-------------|---------|
| **WinDivert driver** | Bundled with the agent package |
| **Cert store write** | Required to trust the MITM root CA in the local machine store |
| **Windows Service** | Registered as `SentinelAgent`; runs as SYSTEM |
| **UAC** | Required for initial install; subsequent updates run as SYSTEM |

## Disk Space

| Component | Approximate Size |
|-----------|----------------|
| Agent binaries | ~50 MB |
| Dynamic cert + key | < 1 KB |
| Config and templates | < 5 MB |
| Logs (rolling) | Configurable; defaults to 100 MB cap |
