---
sidebar_position: 10
sidebar_custom_props:
  icon: FlaskConical
---

# BrowserStack Advanced

**BrowserStack Advanced** is a QuilrAI-built MCP for BrowserStack account discovery, browser and device inventories, Automate and App Automate sessions, diagnostic data, app uploads, and Test Management workflows. It uses a BrowserStack username and access key instead of an OAuth Client ID and Client Secret.

Use this guide when you add **BrowserStack Advanced** from the MCP library or register its hosted transport URL manually.

## What This MCP Can Do

| Capability | Examples | Access |
|------------|----------|--------|
| Account and environments | Discover enabled products, browsers, operating systems, and real devices | Read only |
| Automate and App Automate | List builds, read sessions, retrieve logs and screenshot metadata, create diagnostic briefs | Read only |
| Build and session lifecycle | Update or delete builds and sessions | Write or destructive |
| App uploads | Upload an HTTPS-hosted app for App Automate | Write |
| Test Management | Projects, folders, templates, cases, histories, runs, results, plans, and sub-test plans | Read and write |
| Bulk operations | Edit, move, archive, create, update, read, or record results for multiple items | Read, write, or destructive |

The MCP provides 48 tools. It favors native BrowserStack bulk endpoints when available and otherwise runs bounded batches with ordered, per-item outcomes.

:::note
The hosted MCP does not run BrowserStack Local tunnels or access files and processes on a user's computer. Local Testing requires an agent-side BrowserStack Local process and is intentionally outside this remote MCP.
:::

## Before You Start

You need:

- A BrowserStack account with access to the products you plan to use.
- The BrowserStack **Username** and **Access Key** from account settings.
- Permission to store those credentials in QuilrAI.

For a company-wide integration, use a BrowserStack service account where your plan supports it. This avoids tying the shared MCP connection to an employee's personal access key.

### Get The BrowserStack Credentials

1. Sign in to BrowserStack.
2. Open **Account** > **Settings**.
3. Find the account credentials or **Local Testing** credentials section.
4. Copy both **Username** and **Access Key**.

The username may not be the account email address. Use the exact BrowserStack username shown next to the access key.

## Credential Format

Enter the username and access key as one value separated by a colon:

```text
YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY
```

For example:

```text
company_service_user_abc123:replace-with-access-key
```

Do not add spaces, quotes, `Basic`, or `Bearer` to the value.

:::tip
You do not need to Base64-encode this value. BrowserStack Advanced accepts the raw `username:access-key` value, separates the two fields, and constructs BrowserStack HTTP Basic authentication inside the MCP.
:::

The MCP also accepts Base64-encoded `username:access-key` for clients that cannot safely submit a colon in a credential field. Base64 is encoding, not encryption, and must still be handled as a secret.

<details>
<summary>Optional Base64 compatibility format</summary>

On macOS or Linux:

```bash
printf '%s' 'YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY' | base64 | tr -d '\n'
```

On PowerShell:

```powershell
[Convert]::ToBase64String(
  [Text.Encoding]::UTF8.GetBytes(
    "YOUR_BROWSERSTACK_USERNAME:YOUR_BROWSERSTACK_ACCESS_KEY"
  )
)
```

Paste only the encoded output into the **Upstream API Key** field. Do not set a value prefix.

</details>

## Register BrowserStack Advanced

If BrowserStack Advanced is already present in the MCP library, install it from there. To register it manually:

1. In QuilrAI, open **MCP Gateway** and click **Add MCP**.
2. Enter these values:

| Field | Value |
|-------|-------|
| Name | `BrowserStack Advanced` |
| Slug | `browserstack-advanced` |
| Transport URL | `https://browserstack.mcp.quilr.ai/mcp` |
| Description | `Advanced BrowserStack automation, diagnostics, device inventory, and Test Management` |
| Auth mode | **Upstream API Key** |

If **Auto-detect** identifies an upstream API key, continue with the detected option.

3. On the upstream credential screen, configure:

| Field | Value |
|-------|-------|
| Upstream API Key | Paste raw `username:access-key` |
| Credential ownership | **Admin shared** for a service account, or **User required** when each user supplies personal BrowserStack credentials |
| Credential placement | **Bearer token** |
| Value prefix | Leave empty |
| Extra upstream headers | None |
| Extra upstream query parameters | None |

4. Click **Create**.
5. Confirm that QuilrAI can list the BrowserStack tools.
6. Enable read-only tools first. Enable write and destructive tools only for approved users and agents.

The **Bearer token** selection describes how the gateway securely transports the composite secret to the hosted MCP. The MCP then converts it to the HTTP Basic authentication format required by BrowserStack. Do not enter `Basic` or `Bearer` in **Value prefix**.

## Choose Credential Ownership

| Mode | Use when |
|------|----------|
| **Admin shared** | The organization has a BrowserStack service account or another approved shared credential. |
| **User required** | Each user's BrowserStack permissions and activity must remain separate. |

For **Admin shared**, prefer a BrowserStack service account scoped to the required team or organization. Limit access in both BrowserStack and QuilrAI.

## Verify The Connection

Start with a read-only capability request:

```text
Using BrowserStack Advanced, show the BrowserStack products and capabilities
available to this account. This is strictly read-only.
```

Then verify environment discovery:

```text
Using BrowserStack Advanced, list five available desktop browser environments
and five real mobile devices. Do not start a session or change anything.
```

To verify batch reads:

```text
Using BrowserStack Advanced, retrieve details for these BrowserStack session IDs
in one batch. Preserve the input order and report per-session errors. This is
read-only: <session-id-1>, <session-id-2>.
```

## Use It Effectively

- Prefer batch and bulk tools for multiple builds, sessions, cases, runs, or results.
- Use account capability discovery before requesting a product-specific operation.
- Use the session diagnostic brief for a bounded summary of metadata, logs, and failure context.
- Keep destructive tools disabled unless the workflow explicitly needs deletion or archival.
- Require user confirmation before deleting builds, sessions, test runs, or test cases.
- Use HTTPS URLs for app uploads. The hosted MCP cannot upload a file from a user's local disk.
- Expect product and plan permissions to affect which tools succeed even when the credential is valid.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `401 Unauthorized` or QuilrAI cannot list tools | Wrong username, wrong access key, malformed composite value, or a rotated key | Copy both values from BrowserStack again and enter exactly `username:access-key`. Leave **Value prefix** empty. |
| Raw composite is rejected before reaching the MCP | A client or intermediary does not accept a colon in the credential field | Use the optional Base64 compatibility format above. |
| `403 Forbidden` while credentials are valid | The account authenticated but lacks the required product, role, team, or API entitlement | Check BrowserStack product access and role assignments. Contact BrowserStack support for restricted APIs. |
| Some tool groups are missing | The connected account does not have the corresponding BrowserStack product | Enable the product for the user or service account, then refresh MCP tools. |
| Local Testing request cannot run | BrowserStack Local requires a process and network tunnel near the target application | Run BrowserStack Local through an approved agent-side deployment; it is not provided by this hosted MCP. |
| A batch partially fails | Individual IDs are invalid, inaccessible, or in a different product | Inspect the per-item outcomes and retry only corrected inputs. |
| Requests are throttled | BrowserStack rate limits were reached | Reduce batch size or request frequency and retry after the reported delay. |

## Rotate The Access Key

Rotating a BrowserStack access key invalidates the old credential.

1. Rotate or reset the access key in BrowserStack.
2. Update the composite upstream credential in QuilrAI using the same username and new key.
3. Re-run the read-only capability test.
4. Remove any old encoded copies from local notes, shell history, or secret stores.

If a credential appears in a screenshot, chat, ticket, or repository, rotate it immediately.

## References

- [BrowserStack: API authentication](https://www.browserstack.com/docs/enterprise/api-reference/authentication)
- [BrowserStack: Reset an access key](https://www.browserstack.com/docs/automate/selenium/reset-access-key)
- [BrowserStack: Service accounts](https://www.browserstack.com/docs/references/service-accounts)
