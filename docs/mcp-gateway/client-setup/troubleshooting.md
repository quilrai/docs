---
title: "Validation and troubleshooting"
sidebar_label: "Validation and troubleshooting"
sidebar_position: 8
sidebar_custom_props:
  icon: Wrench
description: "Validate discovery, sign-in, tool access, and user attribution, and diagnose common MCP client connection failures."
---

# Validation and troubleshooting

Replace `<YOUR_MCP_BASE_URL>` in the examples with your deployment's HTTPS base URL, without a trailing slash. This can be `https://mcpgateway.quilr.ai`, `https://mcpgateway.quilrai.com`, or another exact hostname assigned under `quilrai.com`. Copy the base from your Quilr dashboard; the placeholder includes `https://`.

Run these checks from the actual client execution environment. A successful request from an administrator laptop does not prove that a hosted vendor service can reach the gateway.

## Verify the public authentication surface

These commands do not send credentials or invoke an upstream tool. Replace the URL with the complete dashboard-provided endpoint and its matching metadata path.

```bash
curl --silent --show-error --include \
  '<YOUR_MCP_BASE_URL>/.well-known/oauth-protected-resource/quilrone/mcp'

curl --silent --show-error --include \
  '<YOUR_MCP_BASE_URL>/.well-known/oauth-authorization-server/quilrone'

curl --silent --show-error --include \
  '<YOUR_MCP_BASE_URL>/quilrone/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"quilr-admin-diagnostic","version":"1.0"}}}'
```

Expected results:

- Metadata endpoints return JSON and the intended external HTTPS origin.
- The protected resource matches the MCP URL and identifies the matching issuer.
- The request without credentials returns `401` with a Bearer challenge pointing to resource metadata. This is expected authentication discovery, not a failed login.
- An HTML login page, reverse-proxy redirect, WAF challenge, or unrelated `404` means the client has not reached a usable MCP authentication surface.

For a direct endpoint, follow the actual `WWW-Authenticate` metadata URL rather than assuming the OneMCP issuer.

## Validate through the client

After adding and authenticating the server:

1. Confirm initialization completes and the tool catalog loads. Use the client's server logs/status panel if it fails.
2. Ask for available Quilr connectors. `list_mcp_connections` reports connection state for visible MCPs.
3. With dynamic tool calling on, use `find_relevant_tools` to discover a suitable read-only operation, then `call_tool` with its returned schema. With it off, select the prefixed upstream tool.
4. Complete any upstream sign-in or personal-key connection in the gateway dashboard, connector card, or returned connection flow. Re-run the original request afterwards.
5. Check gateway logs for the expected employee, MCP, tool, policy result, and request time.

A client may show an in-chat connection card, a URL flow, or plain text depending on its capabilities. Use the dashboard as the fallback; do not rely on every client rendering interactive MCP Apps.

For raw authenticated protocol diagnostics, use a real MCP client or Inspector. It must initialize, send the initialized notification, retain returned session IDs, use the negotiated protocol version, and then list/call tools. A standalone `curl tools/list` is not an end-to-end session validation.

## Symptom reference

| Symptom | Likely boundary | Administrator action |
| --- | --- | --- |
| Custom MCP option is absent | Client plan, role, version, or workspace policy | Check the client-specific guide and current vendor documentation; enable the supported organization control |
| `404` or dashboard HTML instead of MCP | Wrong host/path, proxy rewrite, ambiguous slug | Copy the complete dashboard URL; prefer backend UUID where necessary |
| TLS/DNS failure or timeout | Network from the actual runtime | Verify certificate, DNS, egress and hosted-service ingress; laptop VPN access alone is insufficient |
| Metadata points to another hostname | Gateway canonical-origin configuration | Have the operator check `GATEWAY_BASE_URL`; use the configured deployment consistently |
| Initial `401` before login | Normal discovery | Follow the Bearer resource-metadata challenge and sign in |
| Repeated `401` after sign-in | Revoked/wrong token, lost header, endpoint-family mismatch | Check proxy header forwarding; reconnect the exact MCP URL; verify the token's resource and tenant compatibility |
| Form requires client secret | Wrong registration mode or unsupported confidential-client requirement | Choose dynamic registration where available; OneMCP does not issue a secret |
| `Missing authorization code` during renewal | Client attempted refresh-token grant | OneMCP currently has no downstream refresh grant; reconnect and review client compatibility |
| PKCE, ID-token, audience, or scope-validation requirement fails | Unsupported authentication requirement | Capture the exact requirement and escalate; do not disable required verification to force rollout |
| Account has no organization or shows unexpected connectors | Sign-in identity or company-domain mapping | Confirm the company account used for sign-in and its configured email domain or alias in Quilr |
| API token rejected | Wrong backend, missing/invalid `mcpuser`, domain or agent mismatch | Use the issuing server's direct endpoint; verify employee domain and selected agent |
| Sign-in succeeds but tools are missing | Tool visibility, disabled server, user preference, access rule, or smart mode | Check OneMCP discovery tools, user-visible connectors, Allowed Agents and effective policies |
| Tool says connection is needed | Upstream user credentials missing/expired | Connect that provider as the same user; a successful gateway login does not grant upstream access |
| Client refuses a tool before a gateway log appears | Client tool approval or workspace policy | Check vendor tool permissions and managed allowlists |
| Gateway policy denies a tool | Gateway access, tool visibility, guardrail, quota, or published policy | Inspect the denial reason and change only the intended administrative rule |
| Tool schema stays old after configuration change | Client cached catalog or published integration snapshot | Refresh the client integration's metadata and retest in a new conversation |
| Disconnect/reconnect loop | Client session, ingress buffering/timeout, upstream transport failure | Capture timestamps and session-related logs; verify streaming/header handling and use current client version |

## Safe support bundle

Include the exact client product, version, workspace type, gateway origin, endpoint family, timestamp with timezone, HTTP status, and redacted error message. Include non-secret discovery JSON and the stage that fails: discovery, registration, sign-in, code exchange, initialization, listing, or tool invocation.

Remove access tokens, client secrets, cookies, authorization codes, connection tickets, API keys, personal tool arguments, and sensitive results. A screenshot of the configuration form should show field names and non-secret URLs, not credentials.

## Rollout acceptance record

| Check | Record |
| --- | --- |
| Canonical URL and metadata consistent | Pass/fail + date |
| Fresh user sign-in | Client version + result |
| Tool catalog and expected discovery mode | Result |
| Approved read-only operation | Tool name + request time |
| Correct employee attribution | Result |
| Excluded user/tool remains blocked | Result |
| Restart and reconnect | Result |
| Upstream reconnect | Result |
| Client-specific expiry/refresh limitations accepted | Owner + result |

See [administrator checklist](./overview) for distribution and [authentication reference](./authentication) for exact fields.
