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
  { label: "Platform", items: ["macOS: MDM profiles + CA", "Windows: WinDivert driver", "Certificate store write"] },
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

Deploy the agent with MDM (for example Jamf, Intune, or Kandji) or GPO. See [Deployment and status](../deploy-and-operate/deployment-and-status) for the install recipes.

## Network

The agent makes outbound HTTPS connections on port 443 only. No inbound ports are needed.

| Destination | Purpose |
| --- | --- |
| QuilrAI discovery, backend and DLP hosts for your region | Tenant lookup at install and update, registration and check-ins (including the kill switch), policy sync, and DLP decisions. See [Backend connectivity](../how-it-works/backend-connectivity). Your QuilrAI representative provides the exact hostnames to allow. |
| QuilrAI update hosts | Update checks and package downloads. Included in the list your representative provides. |
| `login.microsoftonline.com` or `oauth2.googleapis.com` | User sign-in that links the device to a person. |

Your tenant uses one backend host and one DLP host from these lists. Ask your QuilrAI representative which ones, or allow all of them. If endpoints go through a corporate proxy, let these destinations pass through without TLS inspection of the agent's own traffic.

## Platform specifics

**macOS**

| Requirement | Details |
| --- | --- |
| **System extension** | Bundle ID `ai.quilr.agent.sentinel.extension`, Team ID `W8FHSH4RM5`. Approve it with the system extension profile supplied with the package, before the package installs. Without MDM, the user approves it in System Settings › Privacy & Security. |
| **Network extension** | Allowed by the same supplied profile. |
| **Full Disk Access** | Granted by the supplied Full Disk Access (privacy preferences) profile. |
| **Root CA trust** | The QuilrAI root and intermediate CA certificates are supplied with the package. Deploy them as an MDM certificate payload before the package; the installer waits and retries until trust is in place. |

**Windows**

| Requirement | Details |
| --- | --- |
| **WinDivert driver** | Bundled with the agent package. |
| **Certificate store write** | Needed to trust the agent's root CA in the local machine store. |
| **Windows service** | `QuilrAIAgent` ("QuilrAI Endpoint Agent"), runs as LocalSystem and starts automatically. |
| **Updater task** | Scheduled task `QuilrAI-Endpoint-Update`, every 30 minutes. |

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
| macOS | `/Applications/QuilrAIProxy.app` | Agent binaries and system extension |
| macOS | `/Library/Application Support/QuilrAI/` | Configuration, tenant ID, uninstaller |
| macOS | `/Library/LaunchDaemons/com.quilrai.agent.plist` | Agent service |
| macOS | `/Library/LaunchDaemons/com.quilrai.endpoint.updater.plist` | Updater, every 30 minutes |
| macOS | `/Library/Logs/QuilrAI/` | Agent logs |
| Windows | `C:\Program Files\QuilrAI\` | Agent binaries (`quilrai.exe` and helpers) |
| Windows | `C:\ProgramData\QuilrAI\` | Tenant ID and service logs |
| Windows | `QuilrAIAgent` | Windows service |

## Security and updates

- **Signed binaries and chain of trust.** A bootstrap process verifies its own signature and the main agent binary before starting it. The agent refuses to run if it was not started by the bootstrap, so a tampered or directly launched binary does not run.
- **Self-update.** The updater checks for a new version every 30 minutes, starts the new version, and waits for it to run stably. If it does not, the updater restores the previous version.
