---
sidebar_position: 3
sidebar_label: "Build a package"
sidebar_custom_props:
  icon: Wrench
description: "Package definition schema for bundled MCP source, a complete runnable Python example with a bundling and checking script, generating Python and Node dependency locks, package rules and limits (source, tools, Python requirements.lock, Node lockfile v3, environment names, immutable versioning), environment variable handling, Playwright and CLI-wrapper guidance, and designing for serialized execution."
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
  "files": [{ "path": "server.py", "content": "<file text>" }],
  "tools": [{ "name": "example", "description": "", "inputSchema": { "type": "object" } }],
  "description": "",
  "arguments": [],
  "environment": [],
  "elicitationOrigins": [],
  "dependencyLock": null
}
```

| Field | Required | Rules |
|---|---|---|
| `name` | Yes | 1-100 characters |
| `version` | Yes | 1-64 of `A-Z a-z 0-9 _ . -` |
| `runtime` | Yes | `python` or `node` |
| `entrypoint` | Yes | The `path` of one of the `files` |
| `files` | Yes | 1-256 `{path, content}` objects. `content` is the file's text inline (up to 1,000,000 characters). Paths use `A-Z a-z 0-9 _ . - /`, with no empty, `.` or `..` segments |
| `tools` | Yes | 1-128 tools with unique `name` (1-128 of `A-Z a-z 0-9 _ . -`), `inputSchema` (JSON Schema), optional `description` and `annotations` |
| `description` | No | Up to 4096 characters |
| `arguments` | No | Up to 32 command-line arguments passed to the entrypoint |
| `environment` | No | Up to 32 variable names (see [Environment variables](#environment-variables)) |
| `elicitationOrigins` | No | Up to 16 bare `https://host` origins, with no path, query or credentials |
| `dependencyLock` | No | `null` when there are no dependencies. Otherwise the string `"requirements.lock"` (Python) or `"package-lock.json"` (Node), and that file must be in `files` |

Unknown properties are rejected.

## A complete example

This is the console's **Python Echo** package, built from a folder. It has no dependencies, so it runs anywhere Python 3 is installed.

```text
echo/
  server.py     the MCP server (stdio, one JSON-RPC message per line)
  tools.json    the tool declaration, copied into "tools"
```

```python title="echo/server.py"
import json
import sys

TOOL = {"name": "echo_text", "description": "Return the supplied text.", "inputSchema": {"type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]}}
for line in sys.stdin:
    request = json.loads(line)
    if "id" not in request:
        continue
    method = request.get("method")
    if method == "initialize":
        result = {"protocolVersion": "2025-03-26", "capabilities": {"tools": {}}, "serverInfo": {"name": "python-echo-example", "version": "1.0.0"}}
    elif method == "tools/list":
        result = {"tools": [TOOL]}
    elif method == "tools/call" and request.get("params", {}).get("name") == "echo_text":
        result = {"content": [{"type": "text", "text": str(request["params"].get("arguments", {}).get("text", ""))}]}
    elif method == "ping":
        result = {}
    else:
        print(json.dumps({"jsonrpc": "2.0", "id": request["id"], "error": {"code": -32601, "message": "Method not supported"}}), flush=True)
        continue
    print(json.dumps({"jsonrpc": "2.0", "id": request["id"], "result": result}), flush=True)
```

```json title="echo/tools.json"
[
  {
    "name": "echo_text",
    "description": "Return the supplied text.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "text": {
          "type": "string"
        }
      },
      "required": [
        "text"
      ]
    }
  }
]
```

Run the server once before you package it. Each line of output is one response:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"echo_text","arguments":{"text":"hi"}}}' \
  | python3 echo/server.py
```

The `tools/list` result must match `tools.json` exactly, or review fails.

### Bundle and check the definition

There is no QuilrAI command for building definitions. This script bundles a folder into a definition and applies the same file, size and lock checks the gateway and connector apply, so you catch errors before review:

```python title="build_definition.py"
"""Bundle a folder into a local MCP package definition and check it."""
import json, pathlib, re, sys

LOCK_LINE = re.compile(
    r"^[A-Za-z0-9][A-Za-z0-9_.-]*(?:\[[A-Za-z0-9_,.-]+\])?==[A-Za-z0-9_.+!-]+"
    r"(?:\s+--hash=sha256:[a-f0-9]{64})+$"
)

def build(folder, name, version, runtime, entrypoint):
    root = pathlib.Path(folder)
    files = [
        {"path": p.relative_to(root).as_posix(), "content": p.read_text()}
        for p in sorted(root.rglob("*"))
        if p.is_file() and p.name != "tools.json"
        and not {".venv", "node_modules", "__pycache__"} & set(p.parts)
    ]
    paths = {f["path"] for f in files}
    lock = "requirements.lock" if runtime == "python" else "package-lock.json"
    definition = {
        "name": name,
        "version": version,
        "runtime": runtime,
        "entrypoint": entrypoint,
        "files": files,
        "tools": json.loads((root / "tools.json").read_text()),
        "dependencyLock": lock if lock in paths else None,
    }
    check(definition, paths)
    return definition

def check(d, paths):
    assert d["entrypoint"] in paths, "entrypoint is not one of the files"
    assert 1 <= len(d["files"]) <= 256, "1-256 files"
    assert sum(len(f["content"].encode()) for f in d["files"]) <= 2_000_000, "source over 2 MB"
    assert 1 <= len(d["tools"]) <= 128, "1-128 tools"
    if d["dependencyLock"] == "requirements.lock":
        text = next(f["content"] for f in d["files"] if f["path"] == "requirements.lock")
        lines = [l.strip() for l in re.sub(r"\\\r?\n", " ", text).splitlines()]
        lines = [l for l in lines if l and not l.startswith("#")]
        bad = [l for l in lines if not LOCK_LINE.match(l)]
        assert lines and len(lines) <= 256 and not bad, f"unhashed or unpinned lines: {bad[:3]}"
    if d["dependencyLock"] == "package-lock.json":
        assert "package.json" in paths, "package.json is required"
        lock = json.loads(next(f["content"] for f in d["files"] if f["path"] == "package-lock.json"))
        assert lock.get("lockfileVersion") == 3, "npm lockfile v3 required"
        for key, pkg in lock["packages"].items():
            if key:
                assert pkg.get("resolved", "").startswith("https://registry.npmjs.org/"), key
                assert re.match(r"^sha(256|512)-", pkg.get("integrity", "")), key

if __name__ == "__main__":
    folder, name, version, runtime, entrypoint = sys.argv[1:6]
    print(json.dumps(build(folder, name, version, runtime, entrypoint), indent=2))
```

```bash
python3 build_definition.py echo "Python Echo" 1.0.0 python server.py > echo-definition.json
```

In **Add MCP server**, choose **Local package (CLI MCP)** and import or paste `echo-definition.json` (see [Administrator setup](./admin-setup)). Review still checks the discovered tools against the declaration.

## Add dependencies

### Python

List direct dependencies in `requirements.in`, then generate a hashed lock with pip-tools and put it in the folder as `requirements.lock`:

```bash
pip install pip-tools
pip-compile --generate-hashes --output-file requirements.lock requirements.in
```

After joining `\` continuations and skipping `#` comment lines, every line must read `name==version --hash=sha256:<64 hex>` (one or more hashes), for example `anyio==4.4.0 --hash=sha256:...`. Environment markers (`; python_version ...`), ranges, URLs and options such as `--index-url` are rejected. The connector installs with `pip install --require-hashes --only-binary=:all:` from public PyPI into a private `.venv`, so every package needs a wheel for the user's platform. Do not bundle `.venv`.

### Node

Add `package.json` with exact versions, then generate an npm lockfile v3 (npm 9 or later) and bundle both:

```json title="package.json"
{
  "name": "my-local-mcp",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/server-memory": "2026.8.31"
  }
}
```

```bash
npm install --package-lock-only
```

Every entry in `package-lock.json` must resolve to `https://registry.npmjs.org/` with an `integrity` hash; `link`, git and private-registry entries are rejected. The connector runs `npm ci --ignore-scripts --bin-links=false`, so packages that need install scripts do not work. A common pattern is a short `server.mjs` entrypoint that imports a published MCP server from `node_modules`. Do not bundle `node_modules` or `.npmrc`.

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
| Environment | Approved names only, matching `[A-Z][A-Z0-9_]*` (up to 128 characters). Not allowed: `PATH`, `HOME`, `TMP`, `TEMP`, `TMPDIR`, `BASH_ENV`, `ENV`, `SHELLOPTS`, `CDPATH` and names starting `LD_`, `DYLD_`, `NODE_`, `PYTHON`, `NPM_`, `QUILR_` or `XDG_` |
| Reserved paths | `.venv/`, `node_modules/` and `.npmrc` cannot be bundled |
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
