---
sidebar_position: 2
sidebar_custom_props:
  icon: Layers
---

# Architecture

How system requirements map to agent components, and what each platform dependency is used for.

<ArchitectureDiagram
  source={{
    label: "Endpoint",
    code: `# macOS
macOS 13+, root access
Network Extension approved
Keychain write access

# Windows
Windows 10 64-bit, SYSTEM
WinDivert driver installed
Cert store write access`,
  }}
  gateway={{
    label: "Requirements by Component",
    phases: [
      {
        label: "Agent Core",
        stages: [
          { label: "LaunchDaemon / Service", items: ["macOS: LaunchDaemon plist", "Windows: SentinelAgent service", "Runs as root / SYSTEM"] },
          { label: "Bootstrap", items: ["Chain-of-trust validation", "Signed binary verification", "Spawns sentinel with --spawned-by-bootstrap"] },
        ],
      },
      {
        label: "Network Monitor",
        stages: [
          { label: "macOS", items: ["Network Extension (kernel)", "NETransparentProxyManager", "System Extension approval required"] },
          { label: "Windows", items: ["WinDivert driver", "Packet-level interception", "Bundled in agent package"] },
        ],
      },
      {
        label: "Certificate",
        stages: [
          { label: "macOS", items: ["Self-signed root CA", "security add-trusted-cert", "System Keychain write"] },
          { label: "Windows", items: ["Self-signed root CA", "Cert:\\LocalMachine\\Root", "Admin cert store write"] },
        ],
      },
    ],
    footer: "Signed Binaries  ·  Chain of Trust  ·  Platform-native Auth  ·  MDM / GPO Deployment",
  }}
  destination={{
    label: "Operational State",
    items: ["LaunchDaemon running", "System Extension active", "Root CA trusted", "Backend sync connected", "WinDivert driver loaded", "Service registered"],
  }}
/>

## Component Dependency Map

| Agent Component | macOS Requirement | Windows Requirement |
|----------------|-------------------|---------------------|
| **sentinel** (main agent) | root, signed binary | SYSTEM, Authenticode signed |
| **bootstrap** | root, signed binary | SYSTEM, Authenticode signed |
| **sentinel-proxy** | Network Extension entitlement, signed | WinDivert driver, signed |
| **SentinelProxyExtension** | System Extension approval | n/a |
| **ipc-light-broker** | Unix socket access | Named pipe access |
| **sentinel-diagnostics** | No special requirements | No special requirements |

## Security Model

The agent enforces a chain-of-trust before starting:

1. **Bootstrap** verifies its own code signature using OS APIs
2. **Bootstrap** verifies the `sentinel` agent binary against the manifest
3. **Bootstrap** spawns `sentinel` with `--spawned-by-bootstrap` and passes its PID via `SENTINEL_BOOTSTRAP_PID`
4. **sentinel** rejects startup if not spawned by bootstrap (exits with code 1)

This prevents the agent from running if tampered with or launched directly.

## Installation Paths

| Platform | Path | Contents |
|----------|------|----------|
| **macOS app bundle** | `/Applications/SentinelProxy.app/Contents/MacOS/` | All binaries |
| **macOS support dir** | `/Library/Application Support/Sentinel/` | Configs, certs, templates, logs |
| **macOS daemon** | `/Library/LaunchDaemons/com.sentinel.agent` | Service definition |
| **Windows binaries** | `C:\Program Files\Sentinel\` | All binaries |
| **Windows cert** | `C:\Program Files\Sentinel\cert` | Root CA |
| **Windows service** | `SentinelAgent` | Registered Windows Service |

## Update Flow

The agent self-updates via `sentinel-updater`, which the installer registers as a scheduled task or LaunchDaemon:

1. Checks the CDN for a new version every 30 minutes
2. Downloads and verifies the package (RSA-PSS + SHA-256)
3. Validates signatures in staging before stopping the running agent
4. Deploys from staging, starts the agent, runs a 30-second health check
5. Rolls back automatically on failure

The agent is never stopped until the staged package passes all verification checks.
