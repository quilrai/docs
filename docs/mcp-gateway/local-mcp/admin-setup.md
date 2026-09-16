---
sidebar_position: 2
sidebar_custom_props:
  icon: UserCog
---

# Administrator Setup

Approve a local package version, then decide who can use which of its tools. Approval registers a version. It does not install software on anyone's computer and it does not enable tools automatically.

<StepFlow steps={[
  {
    label: "Import",
    items: [
      "Add MCP server",
      "Local package (CLI)",
      "Python Echo example",
    ],
  },
  {
    label: "Review",
    items: [
      "Source + runtime",
      "Tool schemas",
      "Dependency lock",
    ],
  },
  {
    label: "Approve",
    items: [
      "✓ Version registered",
      "✗ Nothing installed",
      "✗ No tools on yet",
    ],
  },
  {
    label: "Configure",
    items: [
      "Enable tools",
      "Guardrails + access",
      "Preview effective",
    ],
  },
]} />

## Walk through it

<VideoEmbed
  src="https://www.youtube.com/embed/EXEuECE3mg0"
  poster="/img/mcp-gateway/video/local-admin.jpg"
  title="Local MCP: administrator setup"
  duration="2:03"
  description="Importing a local package, reviewing its source and tool schemas, approving the version, then enabling tools and access."
/>

Or step through it below.

<Walkthrough
  title="Approve a local package"
  audio="/audio/local-mcp/admin-narration.mp3"
  steps={[
    {
      label: "Import",
      image: "/img/local-mcp/admin-import.jpg",
      alt: "Add MCP panel with Local package selected, showing the Import, Review and approve, and Configure access steps",
      caption: "Choose Local package, then load the Python Echo example",
      body: "In Settings -> AI Gateway -> MCP Gateway, select Add MCP server. Under 'Where does this MCP run?', choose Local package (CLI MCP). For a first test, select Use Python Echo example; it needs no external account or dependencies.",
      note: "Note the banner: tools start disabled, and local execution needs an online gateway connection.",
    },
    {
      label: "Review",
      image: "/img/local-mcp/admin-review.jpg",
      alt: "Review before approval summary listing name, version, runtime, entrypoint, source files, dependency lockfile and declared tools",
      caption: "Review before approval",
      body: "Check the runtime, entrypoint, source files, dependency lockfile, the provider sign-in destinations and the tools the package declares. Expand Inspect included source files to read the code itself. Review it the way you would review a dependency you are about to ship.",
    },
    {
      label: "Approve",
      image: "/img/local-mcp/admin-python-echo-card.jpg",
      alt: "Python Echo listed in configured servers with an Available badge and a Local package badge",
      caption: "The approved package appears in Configured servers",
      body: "It carries a Local package badge and its own Local package setup button. Approval registers the version only: nothing is installed on anyone's computer and no tools are switched on yet.",
    },
    {
      label: "Enable tools",
      image: "/img/local-mcp/admin-tools.jpg",
      alt: "Tools settings for Python Echo showing echo_text with Enabled and Require confirmation toggles",
      caption: "Enable only the tools you intend",
      body: "Open Settings -> Tools. Every tool starts disabled, so nothing is callable until you turn it on and save. Require confirmation asks the user to confirm each call for that tool.",
    },
    {
      label: "Set access",
      image: "/img/local-mcp/admin-access-control.jpg",
      alt: "Access control settings showing allowed agents, allowed and denied smart groups, and allowed and denied users",
      caption: "Decide who can reach it",
      body: "Under General, set allowed agents, smart groups and users. Denied users take precedence, and an explicitly allowed user can override a denied smart group. Preview the effective settings for a real user before you share setup instructions.",
    },
  ]}
/>


## 1. Add the package

1. Open **Settings -> AI Gateway -> MCP Gateway**, then select **Add MCP server**.
2. Under **Where does this MCP run?**, choose **Local package (CLI MCP)**. The panel switches to **Approve a local MCP package**, a three-step flow: **1. Import**, **2. Review & approve**, **3. Configure access**.
3. For a first test, select **Use Python Echo example**. It returns text, and needs no external account and no third-party Python dependencies. For your own MCP, import or paste its JSON definition. See [Build your own package](./build-a-package).

If **Local package (CLI MCP)** is unavailable, your platform operator must enable the capability on your organization's gateway.

## 2. Review the package

Select **Review package**. The **Review before approval** summary lists:

- **Name** and **Version**
- **Runtime** and **Entrypoint**
- **Source files** - expand **Inspect included source files** to read them
- **Dependency lockfile**
- **Provider sign-in destinations**
- **Local environment** - the variable names the package asks for
- **Declared tools**

Review this the way you would review a dependency you are about to ship. The MCP's discovered tool names and schemas must match what is declared here.

:::warning Approve variable names, not values
Administrators approve environment variable **names** only. Actual secret values stay on the user's computer and are never stored in the package definition. Never paste secrets into a package definition or into a chat window.
:::

## 3. Approve

Select **Approve package**.

The console states this plainly: approval makes the version available for access configuration, and it does not enable any tools or install anything on a user's computer. Nothing reaches a user until you complete step 4.

## 4. Configure tools and access

Open the new MCP's **Settings -> Tools**, enable only the intended tools, and save. Then configure:

- **General** - access controls
- **Guardrails** - the standard gateway guardrail flow
- **Group & User Rules** - scoped overrides

Precedence runs base settings first, then group overrides, then user overrides. Turning off a scoped rule restores inheritance; it does not create a denial.

Use the **effective-settings preview** for a real permitted user before you share setup instructions with anyone. Installation is only eligible when current membership, package status and effective access all permit it.

### When Policy Engine is enabled

If your organization uses Policy Engine, the published **Policy Engine -> MCP Gateway** revision controls live tool access, guardrails, confirmation and token-saving effects.

In this mode the older per-MCP settings screens stay editable, but **saving them does not change live behavior**. The MCP settings screen tells you when this applies and links to MCP policies. To change what users can actually do: edit a policy draft, validate it, inspect its effect for the intended user and MCP, then publish.

Package approval and computer enrollment still use the screens described above.

## 5. Verify before you roll out

Confirm the whole path works before sharing instructions broadly:

1. Have a permitted user complete [the connect flow](./connect-your-ai-app) and call a tool.
2. Open the MCP's **Activity -> Tool calls** and confirm the call appears for the correct user and tool.
3. Disable the tool or deny access, and confirm the next call is blocked.
4. Repeat with a **second user on their own account**. Never copy connector credentials between users or computers.

## Adding more packages later

An administrator can add another permitted MCP without any user repeating client setup. Users pick up the new tools automatically. AI clients that do not refresh on their own may need their native MCP reconnect action, or a restart.

Definitions are immutable in this UI. To ship a change, approve a **new version as a new MCP**, configure its access, and eligible users discover it automatically.

## Revoking access

| Action | Effect |
|---|---|
| **General -> Revoke installation** | Stops that package on the selected connector. Other package installations keep their permissions |
| Disable a tool or the MCP server, or change access | The new rules apply to every request after that |

A revoked installation cannot restore itself by reporting setup again. Re-enrollment is a new computer connection, subject to current access policy.

## Reading Activity

Open **Activity -> Tool calls** and select a row to see the user, client, request, response, DLP findings and **Policy evaluation**.

Local MCP calls appear here exactly like remote ones, so your existing monitoring applies unchanged.

- A call can show as **Blocked** even when the local MCP itself succeeded. That means the gateway blocked the response on its way back to the AI app.
- **Interactions** includes ordinary calls. **Findings** narrows the feed to flagged or blocked activity.
- Token savings are measured against the gateway's own counts, so they will not line up exactly with a provider's billing.

A tool call that succeeded locally does not appear in Activity instantly. Allow a short delay, then confirm the matching record.

## Next steps

- [Connect your AI app](./connect-your-ai-app) - what your users do
- [Build your own package](./build-a-package)
- [Troubleshooting](./troubleshooting)
