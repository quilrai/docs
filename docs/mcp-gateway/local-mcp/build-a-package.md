---
sidebar_position: 4
sidebar_custom_props:
  icon: Wrench
---

# Build Your Own Package

A local package definition describes **bundled MCP source**, not an arbitrary executable command. You ship reviewed source files, a pinned dependency lock and an explicit tool declaration; the connector runs that source on the user's machine.

## Definition schema

```json
{
  "name": "My reviewed MCP",
  "version": "1.0.0",
  "runtime": "python",
  "entrypoint": "server.py",
  "files": [{ "path": "server.py", "content": "YOUR REVIEWED MCP SOURCE" }],
  "tools": [{ "name": "example", "inputSchema": { "type": "object" } }],
  "arguments": [],
  "environment": [],
  "elicitationOrigins": [],
  "dependencyLock": null
}
```

The snippet above illustrates the shape of the schema. For an example that actually runs, use the downloadable **Python Echo** definition from the console.

:::warning Declared tools must match discovered tools
The MCP's discovered tool names and schemas must match the administrator-reviewed declaration. A mismatch fails review.
:::

## Package rules

| Package content | Rules |
|---|---|
| Source | 1-256 files, safe relative paths, no duplicate or conflicting paths, explicit included entrypoint. Total source at most 2 MB |
| Definition | Serialized validated definition at most 2 MB. No unknown properties |
| Tools | 1-128 unique reviewed tools with JSON input schemas |
| Python | `requirements.lock` with exact versions and SHA-256 hashes for all transitive requirements. Binary wheels from public PyPI |
| Node | `package.json` and npm lockfile v3, exact resolved `registry.npmjs.org` artifacts with integrity. No lifecycle scripts and no bin links |
| Environment | Approved names only. Reserved system and connector variable names are not allowed |
| Versioning | Definitions are immutable in this UI. Approve a new version as a new MCP, configure its access, and eligible users discover it automatically |

## Environment variables

Declare the **names** your MCP needs in `environment`. Administrators approve names, never values. Users supply the actual values locally, to the process that starts their AI client.

A desktop client launched from a dock may not inherit values set in a shell profile. Document clearly for your users where their values need to be set.

## Specific runtimes

### Playwright and browser automation

Bundle a reviewed Node wrapper and a pinned lockfile. Provision the supported browser **separately**: browser downloads do not run through npm lifecycle scripts, which are disallowed in packages.

Users of a browser package need a browser installed explicitly for that approved package.

### Wrapping an existing CLI

Write a narrowly scoped MCP adapter with explicit tools, validated arguments, cancellation handling and deliberate credential handling.

:::warning Do not wrap a shell
Avoid adapters that accept unrestricted shell command strings. They defeat the tool-level review and access control that the gateway provides, because the reviewed tool surface no longer describes what can actually run.
:::

## Design for serialized execution

Calls to one package are handled in the order they arrive rather than in parallel, which protects stateful browsers and files from overlapping operations. A call that waits too long is dropped rather than started late.

Design long-running tools to be cancellable and to report progress, rather than blocking a session for minutes.

## Testing a new package

1. Approve it as described in [Administrator setup](./admin-setup).
2. Enable only its tools, and grant access to yourself first.
3. Connect a test computer using [the connect flow](./connect-your-ai-app).
4. Call each tool and confirm the result and the **Activity** record.
5. Deny access and confirm the next call is blocked.
6. Test with a second user on their own account.

## Next steps

- [Administrator setup](./admin-setup)
- [Troubleshooting](./troubleshooting)
