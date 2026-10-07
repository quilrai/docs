---
sidebar_position: 10
sidebar_custom_props:
  icon: LayoutGrid
---

# Google Workspace

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">GMAIL + CALENDAR + DRIVE + DIRECTORY</span><h2>Four Workspace surfaces. One governed connection.</h2><p>Forty-two tools for communication, scheduling, file operations, and people lookups with customer-owned Google OAuth.</p></div>

Google Workspace is a Quilr-built MCP in the Library for Gmail, Google Calendar, Google Drive and Workspace directory lookups. There is no shared Quilr-owned Google client: each tenant connects with its own Google OAuth client.

## Tools

**42 tools** are offered by default. One more, `share_google_drive_file`, is registered but disabled until a Quilr operator turns it on.

### Gmail

| Capability | Tools | Access |
|------------|-------|--------|
| Search and read messages | `search_gmail_messages`, `get_gmail_messages`, `get_gmail_thread` | Read only |
| Read attachments | `read_gmail_attachment` | Read only |
| List and inspect drafts | `list_gmail_drafts`, `get_gmail_draft` | Read only |
| List labels | `list_gmail_labels` | Read only |
| Track changes incrementally | `sync_gmail_messages` | Read only |
| Create and update drafts | `save_gmail_draft` | Write |
| Create and rename labels | `save_gmail_label` | Write |
| Apply and remove labels in bulk | `update_gmail_messages` | Write |
| Send mail | `send_gmail_message` | Destructive, cannot be revoked |
| Move messages to trash | `trash_gmail_messages` | Destructive |
| Delete a label or a draft | `delete_gmail_label`, `delete_gmail_draft` | Destructive |

### Calendar

| Capability | Tools | Access |
|------------|-------|--------|
| List calendars | `list_google_calendars` | Read only |
| Read events | `list_google_calendar_events`, `get_google_calendar_event`, `list_google_calendar_event_instances` | Read only |
| Check availability | `get_google_calendar_availability` | Read only |
| Track changes incrementally | `sync_google_calendar_events` | Read only |
| Create and update events | `save_google_calendar_event` | Write |
| Create and rename calendars | `save_google_calendar` | Write |
| RSVP to an invitation | `respond_to_google_calendar_event` | Write |
| Delete an event | `delete_google_calendar_event` | Destructive |
| Delete a calendar | `delete_google_calendar` | Destructive |

### Drive

| Capability | Tools | Access |
|------------|-------|--------|
| Find files and shared drives | `list_google_drive_files`, `get_google_drive_file`, `list_google_shared_drives` | Read only |
| Read and export file content | `read_google_drive_file`, `export_google_drive_file` | Read only |
| Read comments and revisions | `list_google_drive_comments`, `list_google_drive_revisions` | Read only |
| See who a file is shared with | `list_google_drive_permissions` | Read only |
| Track changes incrementally | `sync_google_drive_changes` | Read only |
| Create files and folders | `create_google_drive_file` | Write |
| Update metadata, copy and move | `save_google_drive_file` | Write |
| Add a comment | `create_google_drive_comment` | Write |
| Move a file to trash | `trash_google_drive_file` | Destructive |
| Change who can reach a file | `share_google_drive_file` | Destructive, **disabled by default** |

### Directory

| Capability | Tools | Access |
|------------|-------|--------|
| Read the connected user's profile | `get_google_user_profile` | Read only |
| Look up people in your Workspace domain | `search_google_directory`, `list_google_directory_people` | Read only |

Directory tools use the People API and read only the signed-in user's own Workspace domain. They carry no administrator capability and do not use the Admin SDK. They return nothing useful for a consumer Gmail account.

### Destructive tools

Seven destructive tools are enabled by default, each with the `destructive` annotation and tag, so you can hide them or require [human approval](../protect/human-approval) as a class: `send_gmail_message`, `trash_gmail_messages`, `delete_gmail_label`, `delete_gmail_draft`, `delete_google_calendar_event`, `delete_google_calendar`, `trash_google_drive_file`.

Sending mail is irreversible. Trashing is recoverable until Google purges the item. Nothing in this MCP permanently deletes mail or files. Even when Drive sharing is enabled, a grant to `anyone` is refused unless the call explicitly confirms it.

## Setup

### 1. Create the Google OAuth client

1. In the [Google Cloud Console](https://console.cloud.google.com/), create or select a project for the integration.
2. In **APIs & Services** > **Library**, enable the **Gmail API**, **Google Calendar API**, **Google Drive API** and **People API**. Without the People API the directory tools fail.
3. In **APIs & Services** > **OAuth consent screen**, choose **Internal** if every user is in your Workspace organization (no Google verification needed), or **External** for any Google account (restricted Gmail and Drive scopes then require Google verification and a security assessment).
4. Add the fifteen scopes below.
5. In **APIs & Services** > **Credentials**, click **Create Credentials** > **OAuth client ID** and choose **Web application**. Other client types do not work with the gateway callback.
6. Under **Authorized redirect URIs**, add the **OAuth callback URL** shown on the Google Workspace setup screen in QuilrAI. It must match exactly; use a separate client per environment with a different callback.
7. Click **Create** and copy the **Client ID** and **Client Secret**.

| Scope | Why it is needed | Google class |
|-------|------------------|--------------|
| `openid` | **Mandatory.** Without it Google returns no user identifier (`sub`) and the MCP rejects the token. | Basic |
| `.../auth/userinfo.email` | Identify the connected user. | Basic |
| `.../auth/userinfo.profile` | Read the user's own name and photo. | Basic |
| `.../auth/gmail.readonly` | Search and read messages, threads and attachments. | Restricted |
| `.../auth/gmail.compose` | Create and update drafts, and send mail. | Restricted |
| `.../auth/gmail.modify` | Apply and remove labels on messages, and trash them. | Restricted |
| `.../auth/gmail.labels` | Create, rename and delete labels. | Sensitive |
| `.../auth/calendar.calendarlist.readonly` | List the user's calendars. | Sensitive |
| `.../auth/calendar.events` | Read, create, update and delete events, and RSVP. | Sensitive |
| `.../auth/calendar.freebusy` | Check availability. | Sensitive |
| `.../auth/calendar.calendars` | Create, rename and delete calendars. | Sensitive |
| `.../auth/drive.metadata.readonly` | Read file and shared-drive metadata. | Restricted |
| `.../auth/drive.readonly` | Read and export file content. | Restricted |
| `.../auth/drive` | Create, update, copy, move, trash and comment on files, and read permissions. | Restricted |
| `.../auth/directory.readonly` | Look up people in the user's own Workspace domain. | Sensitive |

Each scope is prefixed `https://www.googleapis.com`. Google's [OAuth 2.0 scopes](https://developers.google.com/identity/protocols/oauth2/scopes) page is authoritative for the classification.

:::warning Scope footprint grew
Earlier releases requested eight read-leaning scopes. The MCP now requests fifteen, including the restricted `drive` and `gmail.modify` scopes. A connection made with the old set keeps working for the tools its token covers and returns `insufficient_scope` for the rest until the user reconnects.
:::

### 2. Install from the Library

1. Go to **Settings > AI Gateway > MCP Gateway**, click **Library** and find **Google Workspace**.
2. Click **Set up**, enter the **OAuth client ID** and **OAuth client secret**, and click **Install**.
3. [Connect OAuth once as an administrator](../servers-and-connections/adding-mcp-servers#connect-an-oauth-server-as-an-administrator). At Google's consent screen, grant every scope, including **openid**.
4. Enable the tools you need in [Tool visibility](../protect/tool-visibility).

For an **External** app that is not yet verified, add users under **Test users** on the consent screen so they can authorize.

### Troubleshooting

Tool failures return a JSON error with a `code`, the HTTP `status`, whether it is `retryable`, and a `next_action`.

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The redirect URI in Google Cloud differs from the QuilrAI callback URL. | Add the exact callback URL under **Authorized redirect URIs** and retry. |
| `invalid_client` | Wrong client ID or secret, or a deleted secret. | Copy both values again and update QuilrAI. |
| `Access blocked: app has not been verified` | An External app uses restricted scopes before verification. | Add the user as a test user, complete verification, or use an Internal app. |
| Consent succeeds but every call returns 401 | `openid` was not granted. | Reconnect and grant all scopes. |
| `insufficient_scope` from one product | A scope is missing from the consent screen, or the connection predates it. | Add the scope named in the error and reconnect. |
| `insufficient_scope` on every directory tool | People API not enabled, or `directory.readonly` not granted. | Enable the API, confirm the scope and reconnect. |
| `not_found` on a directory search | The account is not in a Workspace domain. | Directory lookups need a Workspace account. |
| `sync_expired` from a `sync_*` tool | The sync marker is older than Google's retention window. | Start a fresh sync without a marker. |
| `invalid_cursor` when paging | The cursor was altered or reused by another user. | Re-run the query without a cursor. |
| `share_google_drive_file` is not listed | The tool is disabled by default. | Ask Quilr to enable Drive sharing for your deployment. |

References: [Create an OAuth client ID](https://support.google.com/cloud/answer/6158849), [OAuth API verification FAQ](https://support.google.com/cloud/answer/9110914), [People API](https://developers.google.com/people).

## Compared with the official server

<McpDecision
  officialTitle="Choose official for product-native breadth"
  official="Use Google's separate preview endpoints when the agent needs first-party product depth or a Workspace surface this MCP does not cover, such as Chat."
  officialPoints={['Provider-native endpoints', 'Google Chat coverage']}
  quilrTitle="Choose one combined connection"
  quilr="Use Quilr when Gmail, Calendar, Drive, and directory lookups should share customer-owned OAuth, one gateway boundary, and forty-two consistent tools."
  quilrPoints={['Four surfaces, one connection', 'Governed writes, sync, and destructive controls']}
  verdict="Official endpoints reach Chat; Quilr minimizes connection and policy sprawl across the four surfaces agents use most."
/>

| Capability | Gmail | Calendar | Drive | Directory |
|---|:---:|:---:|:---:|:---:|
| Search and read | ✅ | ✅ | ✅ | ✅ |
| Multi-item and thread reads | ✅ | ✅ | ✅ | ✅ |
| Attachment and file-content reads | ✅ | - | ✅ | - |
| Incremental sync | ✅ | ✅ | ✅ | - |
| Create | Drafts, labels | Events, calendars | Files, folders, comments | - |
| Update | Message labels, drafts | Events, calendars, RSVP | Metadata, copy, move | - |
| Availability lookup | - | ✅ | - | - |
| Permission visibility | - | - | ✅ | - |
| Move to trash, recoverable | ✅ | - | ✅ | - |
| Permanent delete | Labels, drafts | Events, calendars | - | - |
| Irreversible send | Send email | - | - | - |
| Change who can reach a file | - | - | Opt-in | - |

Google's official Workspace MCPs are separate product endpoints in Developer Preview and also cover Google Chat. Quilr is the combined, gateway-managed option for Gmail, Calendar, Drive and directory lookups.
