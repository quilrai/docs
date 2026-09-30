---
sidebar_position: 1
sidebar_custom_props:
  icon: BookOpen
---

# Local MCP Overview

Local MCP lets an administrator approve a version of a Python or Node MCP server, and lets a user run that server **on their own computer**. The Quilr MCP Gateway still checks the user's access and every tool call.

No endpoint agent is required.

:::tip Prefer to watch
Both sides are recorded, each on its own page: [administrator setup](./admin-setup) for approving a package, and [connect your AI app](./connect-your-ai-app) for the user side.
:::

## Why run an MCP locally

Some MCP servers cannot run as a shared remote service. They need access to local files, a local browser process, a developer workspace, or credentials that should never leave the user's machine. Local MCP covers those cases without giving up gateway control.

| | OneMCP (remote) | Local MCP |
|---|---|---|
| Where the MCP runs | Quilr-hosted or vendor-hosted service | The user's own computer |
| Best for | Shared SaaS integrations (Slack, GitHub, Jira) | Local files, local browsers, developer workspaces |
| Compute used | Hosted | The user's CPU, memory and browser processes |
| Access checks | Gateway | Gateway (same controls) |
| Setup per user | None | One connection command, once per computer |

Both can be active at the same time. A local connection exposes only local tools, and an existing remote OneMCP entry continues to handle remote services.

To use a local MCP, you install a small Quilr connector on your computer. It links your AI app to the gateway, so local files and local browser processes stay on your machine while the gateway still decides what you are allowed to call.

## The two roles

Setup splits cleanly into two jobs, documented on their own pages:

<StepFlow steps={[
  {
    label: "Administrator",
    items: [
      "Add local package",
      "Review + approve",
      "✓ Enable tools",
    ],
  },
  {
    label: "User",
    items: [
      "Run one command",
      "Approve computer",
      "✓ Use your tools",
    ],
  },
]} />

- **[Administrator setup](./admin-setup)** - approve a package version and configure who can use which tools.
- **[Connect your AI app](./connect-your-ai-app)** - the one-command flow each user runs on their own machine.

## Before you start

| Who | Required |
|---|---|
| Administrator | Existing MCP create permission, then update permission on the created MCP to configure tools, access, rules and revocation |
| User | An eligible organization account, macOS, Linux or Windows, Node 24+ for npm or Python 3.12+ with uv/uvx for PyPI, and network access to the gateway |
| Python MCP user | Python 3.12+. Use an absolute interpreter path when multiple Python versions exist |
| Browser MCP user | A browser installed separately for the approved package |

If **Local package (CLI MCP)** does not appear when adding an MCP server, the capability is not enabled for your organization. Contact your platform operator.

## Current boundaries

Know these before you plan a rollout:

- **The connector runs as one user.** On macOS and Linux its private state is enforced with file ownership and permissions; on Windows it must live inside your user profile, whose default ACL closes it to other standard users. Claude Desktop ships for macOS and Windows only.
- **The connector is not an OS sandbox.** A selected workspace limits where the MCP works by convention, not by kernel enforcement.
- **No offline execution.** If the gateway is unreachable, calls stop. Local execution does not continue on its own.
- **Updates are per computer.** There is no automatic upgrade across every computer at once.
- **Calls run one at a time.** Within a single local MCP session, calls are handled in the order they arrive rather than in parallel, which protects stateful browsers and files from overlapping operations. A call that waits too long is dropped rather than started late.

## Next steps

- [Administrator setup](./admin-setup)
- [Connect your AI app](./connect-your-ai-app)
- [Build your own package](./build-a-package)
- [Troubleshooting](./troubleshooting)
