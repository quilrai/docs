---
sidebar_position: 8
---

# Web Search Policy

Filter web search domains using enterprise security gateway rules.

## How It Works

1. **Connect Gateway** — Link your enterprise security gateway
2. **Sync Rules** — Cache groups, users, and URL filter rules
3. **Enforce** — Domain checks run on every web search tool call

## Supported Security Gateways

| Gateway | Required Credentials |
|---------|---------------------|
| **Zscaler Internet Access (ZIA)** | Base URL, API Key, Username, Password |
| **Palo Alto Prisma Access** | API URL, API Key |
| **Fortinet FortiGate** | API URL, API Key |
| **Cisco Umbrella** | API URL, Org ID, API Key, API Secret |

## Synced Data

Once connected, the gateway caches the following from your security gateway:

| Data | Description |
|------|-------------|
| **Groups** | Security groups |
| **Departments** | Org departments |
| **Users** | User accounts |
| **Rules** | URL filter rules |

## Check Timeout

Configure the **ZIA Check Timeout** to set the maximum seconds the gateway waits for domain validation before allowing the request through. This prevents slow security gateway responses from blocking web search tool calls.

## Scope

:::caution Web Search MCP Only
This policy applies exclusively to the system **Web Search MCP**. It does not affect other MCP servers registered in the gateway.
:::
