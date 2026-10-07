---
sidebar_position: 18
sidebar_custom_props:
  badge: advanced
  icon: Activity
---

# BrowserStack Advanced

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">TEST OPERATIONS</span><h2>Forty-eight auditable tools for test infrastructure.</h2><p>Automate, App Automate, diagnostics, screenshots, and deep Test Management operations.</p></div>

BrowserStack Advanced is a Quilr-built MCP for BrowserStack account discovery, browser and device inventories, Automate and App Automate sessions, diagnostics, app uploads and Test Management. It signs in with a BrowserStack username and access key, not an OAuth app.

## Tools

The MCP provides 48 tools. It uses native BrowserStack bulk endpoints where they exist and otherwise runs bounded batches with ordered, per-item outcomes.

| Capability | Examples | Access |
|------------|----------|--------|
| Account and environments | Discover enabled products, browsers, operating systems and real devices | Read only |
| Automate and App Automate | List builds, read sessions, retrieve logs and screenshot metadata, create diagnostic briefs | Read only |
| Build and session lifecycle | Update or delete builds and sessions | Write or destructive |
| App uploads | Upload an HTTPS-hosted app for App Automate | Write |
| Test Management | Projects, folders, templates, cases, histories, runs, results, plans and sub-test plans | Read and write |
| Bulk operations | Edit, move, archive, create, update, read or record results for many items | Read, write or destructive |

:::note
The hosted MCP does not run BrowserStack Local tunnels or reach files on a user's computer. Local Testing needs an agent-side BrowserStack Local process and is outside this MCP. App uploads must use an HTTPS URL.
:::

## Setup

You need a BrowserStack account with the products you plan to use, its **Username** and **Access Key**, and permission to store them in QuilrAI. For a company-wide connection, use a BrowserStack service account where your plan supports it, so the connection is not tied to one employee's key.

### 1. Get the credentials

1. Sign in to BrowserStack and open **Account** > **Settings**.
2. In the account or **Local Testing** credentials section, copy the **Username** and **Access Key**. The username may differ from the account email.

Combine them into one value separated by a colon, with no spaces, quotes, `Basic` or `Bearer`:

```text
YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY
```

You do not need to Base64-encode it. The MCP splits the value and builds HTTP Basic authentication itself. It also accepts a Base64-encoded `username:access-key` for clients that cannot submit a colon; Base64 is encoding, not encryption, so treat it as a secret too.

<details>
<summary>Optional Base64 form</summary>

```bash
printf '%s' 'YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY' | base64 | tr -d '\n'
```

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY"))
```

</details>

### 2. Install from the Library

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **BrowserStack Advanced**.
2. Click **Set up** and paste the combined value as the **Upstream API key**.
3. Choose the **Authentication scope**:

   | Scope | Use when |
   |-------|----------|
   | **Shared by the whole tenant** | You have an approved service account or shared credential. Limit access in both BrowserStack and QuilrAI. |
   | **Each user brings their own** | Each user's BrowserStack permissions and activity must stay separate. |

4. Click **Install**, then review [Tool visibility](../protect/tool-visibility) and keep destructive tools off unless a workflow needs deletion or archival.

If **BrowserStack Advanced** is not in your Library, contact Quilr.

### 3. Verify

```text
Using BrowserStack Advanced, show the BrowserStack products and capabilities
available to this account. This is strictly read-only.
```

```text
Using BrowserStack Advanced, list five available desktop browser environments
and five real mobile devices. Do not start a session or change anything.
```

### Use it effectively

- Prefer batch and bulk tools for multiple builds, sessions, cases, runs or results.
- Discover account capabilities before asking for a product-specific operation.
- Use the session diagnostic brief for a bounded summary of metadata, logs and failure context.
- Require [human approval](../protect/human-approval) before deleting builds, sessions, test runs or test cases.
- Product and plan permissions decide which tools succeed even when the credential is valid.

### Rotate the access key

Rotating a BrowserStack access key invalidates the old one. Rotate it in BrowserStack, update the saved credential in QuilrAI with the same username and the new key, re-run the read-only test, and delete old copies from notes, shell history or secret stores. Rotate immediately if the key appears in a screenshot, chat, ticket or repository.

### Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `401 Unauthorized`, or tools cannot be listed | Wrong username or key, malformed value, or a rotated key | Copy both values again and save exactly `username:access-key`. |
| Raw value rejected before reaching the MCP | A client does not accept a colon in the credential field | Use the Base64 form. |
| `403 Forbidden` with valid credentials | The account lacks the product, role, team or API entitlement | Check BrowserStack product access and roles. |
| Some tool groups are missing | The account does not have that BrowserStack product | Enable the product, then refresh tools. |
| A batch partially fails | Some IDs are invalid, inaccessible or in another product | Read the per-item outcomes and retry only corrected inputs. |
| Requests are throttled | BrowserStack rate limits were reached | Reduce batch size or frequency and retry after the reported delay. |

References: [API authentication](https://www.browserstack.com/docs/enterprise/api-reference/authentication), [Reset an access key](https://www.browserstack.com/docs/automate/selenium/reset-access-key), [Service accounts](https://www.browserstack.com/docs/references/service-accounts).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for product breadth"
  official="Use BrowserStack's MCP when the agent needs the widest first-party coverage, including Percy, Accessibility, and BrowserStack AI agents."
  officialPoints={['Broadest BrowserStack portfolio', 'First-party feature velocity']}
  quilrTitle="Choose Quilr for controlled operations"
  quilr="Use Quilr for explicit API-shaped tools, bounded diagnostics, bulk Test Management workflows, and clearly labeled destructive actions."
  quilrPoints={['48 predictable tools', 'Bulk operations with auditable boundaries']}
  verdict="Coverage breadth favors the official MCP. Repeatable test operations and controlled bulk changes favor Quilr Advanced."
/>

| Capability | BrowserStack Official MCP | Quilr Advanced |
|---|:---:|:---:|
| Browser and device inventories | ✅ | ✅ |
| Automate and App Automate | ✅ | ✅ |
| Test Management lifecycle | ✅ | ✅ |
| Accessibility and Percy | ✅ | - |
| BrowserStack AI agents | ✅ | - |
| Bounded logs and screenshot metadata | ✅ | ✅ Explicit limits |
| Session diagnostic brief | - | ✅ |
| Bulk case edit, move, and archive | Limited | ✅ |
| Bulk result submission and ordered assignment | Limited | ✅ |
| Explicit destructive labels | Varies | ✅ |

Use the official MCP for maximum BrowserStack product breadth. Use Quilr Advanced for predictable API automation and controlled bulk Test Management.
