---
sidebar_position: 5
sidebar_label: "Troubleshooting"
sidebar_custom_props:
  icon: ListChecks
description: "Symptom table for local packages unavailable, pairing rejection, gateway 401/403, Python version and dependency failures, missing tools, integrity mismatch and a package that stops while starting (package_exited with a redacted detail from connector 0.4.1) - plus diagnosing a specific connection with --state, the Preparing response, response-policy blocks, and starting over cleanly."
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
| Package stopped while starting (`package_exited`) | Read the result's `detail`, usually a wrong credential or setting. See [A package stopped while starting](#a-package-stopped-while-starting) |
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

## A package stopped while starting

A package can start and then stop straight away, most often because a credential or setting in its environment is wrong. With connector **0.4.1** or later, the tool result says so and includes the package's own last error:

```json
{"state":"needs_action","code":"package_exited","action":"The package stopped while starting; detail shows its last error. ...","detail":"snowflake.connector.errors.HttpError: 290404 (08001): 404 Not Found: post myorg-my_account.snowflakecomputing.com:443/session/v1/login-request"}
```

`quilr_connection_status` shows the same `detail` for that package. To fix it:

1. Read `detail`. It names what the provider rejected, such as an unknown account, a wrong password or a blocked network.
2. Correct the value in the environment that starts your AI app, then restart the app. Do not paste credentials into chat.
3. Retry the tool. The package starts again on the next call.

`detail` is one line, at most 300 characters. The connector removes the values of variables named like credentials (such as `PASSWORD`, `SECRET`, `TOKEN`, `KEY`, `PAT` and connection strings or URLs), `user:password@` in URLs, and `password=` or `token:` style values. Account, user, host and warehouse names stay visible because they usually explain the failure. If a package crashes during a call rather than at startup, `operation_interrupted` carries the same `detail`.

Connectors before 0.4.1 show only *"Check the connection and package prerequisites, then retry."* To update, re-run the connection command from **Connect your AI app**.

For Snowflake-specific messages, see [Snowflake: When sign-in fails](../provider-setup/snowflake#when-sign-in-fails).

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
