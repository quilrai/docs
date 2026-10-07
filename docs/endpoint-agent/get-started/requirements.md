---
sidebar_position: 2
sidebar_label: "Requirements"
sidebar_custom_props:
  icon: Rocket
---

# Requirements

Check that your endpoints meet these requirements before you deploy the QuilrAI Endpoint Agent.

<StepFlow steps={[
  { label: "OS", items: ["macOS 13+ (Ventura)", "Windows 10 1903+ / Server 2019+", "64-bit only"] },
  { label: "Access", items: ["macOS: root (LaunchDaemon)", "Windows: SYSTEM (service)", "MDM / GPO deployment"] },
  { label: "Network", items: ["Outbound 443 only", "No inbound ports", "Proxy passthrough if needed"] },
  { label: "Platform", items: ["macOS: System Extension approval", "Windows: WinDivert driver", "Certificate store write"] },
]} />

## Operating system

| Platform | Minimum version | Notes |
| --- | --- | --- |
| **macOS** | 13.0 (Ventura) | The Network Extension requires Ventura or later. |
| **Windows** | 10 (1903+) or Server 2019 | 64-bit only; the WinDivert driver requires 64-bit. |

## Access

| Platform | Required access | Used for |
| --- | --- | --- |
| **macOS** | `root` | LaunchDaemon, system extension install, keychain write. |
| **Windows** | `SYSTEM` / Administrator | Windows service, WinDivert driver, certificate store write. UAC is needed for the first install; later updates run as SYSTEM. |

Deploy the agent with MDM (for example Jamf, Intune, or Kandji) or GPO. When run with `--trust-cert --register-as-service`, the installer registers the service and trusts the agent's certificate automatically.

## Network

The agent makes outbound connections only. No inbound ports are needed.

| Destination | Port | Purpose |
| --- | --- | --- |
| `api.quilr.ai` | 443 (HTTPS) | Backend sync: discovery, governance, activity. See [Backend connectivity](../how-it-works/backend-connectivity). |
| QuilrAI CDN | 443 (HTTPS) | Auto-update version check and package download. |

If endpoints go through a corporate proxy, let these destinations pass through without TLS inspection of the agent's own traffic.

## Platform specifics

**macOS**

| Requirement | Details |
| --- | --- |
| **System Extension approval** | Approve in System Settings › Privacy & Security after the first install. |
| **Network Extension entitlement** | Bundled with the agent's proxy component. |
| **Keychain write** | Needed to trust the agent's root CA for TLS inspection. |
| **File descriptor limit** | Raised to 10,240 by the installer. |

**Windows**

| Requirement | Details |
| --- | --- |
| **WinDivert driver** | Bundled with the agent package. |
| **Certificate store write** | Needed to trust the agent's root CA in the local machine store. |
| **Windows service** | Registered as `SentinelAgent` and runs as SYSTEM. |

## Disk space

| Component | Approximate size |
| --- | --- |
| Agent binaries | ~50 MB |
| Certificate and key | < 1 KB |
| Configuration and templates | < 5 MB |
| Logs (rolling) | Configurable; 100 MB cap by default |

## What gets installed

| Platform | Path | Contents |
| --- | --- | --- |
| macOS | `/Applications/SentinelProxy.app/Contents/MacOS/` | Agent binaries |
| macOS | `/Library/Application Support/Sentinel/` | Configuration, certificates, templates, logs |
| macOS | `/Library/LaunchDaemons/com.sentinel.agent.plist` | Service definition |
| Windows | `C:\Program Files\Sentinel\` | Agent binaries and root CA (`cert`) |
| Windows | `SentinelAgent` | Windows service |

## Security and updates

- **Signed binaries and chain of trust.** A bootstrap process verifies its own signature and the main agent binary before starting it. The agent refuses to run if it was not started by the bootstrap, so a tampered or directly launched binary does not run.
- **Self-update.** The agent checks for a new version every 30 minutes, verifies the package signature in a staging area before stopping the running agent, starts the new version, and runs a 30-second health check. If the check fails, it rolls back automatically.
