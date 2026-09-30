---
sidebar_position: 5
sidebar_custom_props:
  icon: ListChecks
---

# Troubleshooting

Work down from the symptom you can see. Most issues are access configuration, a runtime version, or a connection that needs re-establishing.

## Common symptoms

| Symptom | Check / next step |
|---|---|
| Local packages unavailable | Your operator checks the capability and deployment settings on the organization's gateway |
| No tools available | Ask your admin to check that tools are enabled, the MCP server is active, and your account has access |
| Pairing rejected | Check the signed-in account, the exact code, its expiry, and that console and terminal use the same gateway |
| Gateway 401 | Credential expired or revoked. Disconnect and sign in again. A console 401 requires browser sign-in |
| Gateway 403 | Ask your admin to resolve access and installation revocation. Do not attempt to bypass controls |
| Python version error | Select Python 3.12+ with the absolute `--python` option |
| Dependency installation fails | Review lockfile hashes, wheel availability, registry access, and supported OS and runtime |
| No tools in AI client | Check connection status, restart or reconnect the client, and ask the admin to verify enabled tools |
| Runtime changed | Repeat setup after updating Node or Python. Regenerate client config if paths moved |
| Package integrity mismatch | Do not edit installed files. Disconnect, then repeat setup from the beginning |
| Missing environment | Provide the named values locally to the process that starts the AI client |
| Gateway unavailable | Calls stop. Restore network access. Local execution does not continue offline |
| No Activity entry | Allow a short delay and recheck. If it still does not appear, contact your administrator. A successful tool result alone does not confirm the call was recorded |

## Diagnosing a specific connection

The connection command prints its private connection state path. Use it explicitly:

```bash
quilr-mcp status --state PATH
quilr-mcp doctor --state PATH --package ID
```

:::warning Always pass `--state`
Without `--state`, these commands may report on a different connection than the one you set up, which makes a working setup look broken.
:::

## A tool call returns "Preparing"

This is expected on a first call, while the package is set up on your computer.

**Preparing means the tool did not execute.** Ask your AI app to check `quilr_connection_status`, then retry when it reports ready. Later calls are fast.

If a package stays in Preparing, the usual causes are a failed dependency install or a missing Node or Python runtime for that package. Run `doctor` and share the output with your administrator.

## A call succeeded locally but shows as Blocked

The local MCP ran, and the gateway blocked the response on its way back to the AI app. Ask your administrator to open the call in **Activity** and check its **Policy evaluation**.

## No tools appear after an admin granted access

Use **Refresh access** in self service. Do not sign in again.

New tools are picked up automatically. AI clients that do not refresh on their own need their native MCP reconnect action, or a restart.

## Starting over cleanly

1. Run `quilr-mcp disconnect --state PATH` and let it confirm with the gateway.
2. Only then uninstall the CLI, if you want it gone.
3. Package files remain under `~/.quilr-mcp`. Remove that directory **only** after confirming no other installation uses it.

Re-enrollment is a new computer connection and is subject to current access policy. A revoked installation cannot restore itself.

## Escalating

Collect before you raise a ticket:

- The output of `quilr-mcp status --state PATH`
- The output of `quilr-mcp doctor --state PATH --package ID`
- Your AI client and its version
- The Node or Python version in use
- The approximate timestamp of the failing call, so an admin can find it in **Activity**

## Related pages

- [Overview](./overview)
- [Administrator setup](./admin-setup)
- [Connect your AI app](./connect-your-ai-app)
