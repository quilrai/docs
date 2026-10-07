---
sidebar_position: 2
sidebar_label: "MCP Threat Detection"
sidebar_custom_props:
  icon: Network
---

# MCP Threat Detection

Vet any MCP server before you trust it. MCP Threat Detection is a supply-chain check: it scans an MCP server's code and dependencies and enumerates what the server exposes, then builds a threat model from the results.

<ConsolePath console="QuilrAI console" path={['Assessments', 'Red Teaming', 'MCP Threat Detection']} />

## What a scan does

| Check | Input | What happens |
|-------|-------|--------------|
| **Static and dependency scan** | A public repository URL | The repository is cloned and analyzed, never executed. Dependencies are checked for known vulnerabilities (CVEs). |
| **Live tool-surface enumeration** | A live MCP server | A read-only enumeration of the tools the server exposes. |
| **Threat model** | Results of the checks above | Assesses how the server could be abused, for example attacks through its tools, denial-of-wallet, injection, and data exfiltration. |

You can give a repository, a live server, or both.

## Run a scan

1. Open the **MCP Threat Detection** tab.
2. Enter a **public repository URL**, a **live MCP server**, or both.
3. Tick the acknowledgement checkbox.
4. Click **Run deep scan**.

## Recent scans

Completed and in-progress scans are listed under **Recent scans**, with their findings and coverage. Open a scan to review its findings.

:::tip
Use MCP Threat Detection before you add a server to the [MCP Gateway](../../mcp-gateway/servers-and-connections/adding-mcp-servers) or approve it for your users. For an agent that already uses MCP tools, follow up with [Agentic Red Teaming](./agentic-red-teaming) to test how the agent behaves under attack.
:::
