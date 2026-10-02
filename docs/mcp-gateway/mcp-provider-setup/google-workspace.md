---
sidebar_position: 5
sidebar_custom_props:
  icon: LayoutGrid
---

# Google Workspace

**Google Workspace** is a QuilrAI-built MCP available in the MCP Store. It exposes Gmail, Google Calendar, Google Drive, and Workspace directory tools. The MCP is multi-tenant and does not ship a shared Google OAuth client, so each connection must use its own Google OAuth Client ID and Client Secret created in Google Cloud.

Use this guide when you install **Google Workspace** from the MCP Store and the QuilrAI setup screen asks for a Google Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## What This MCP Can Do

**42 tools** are offered by default across four products. One more, `share_google_drive_file`, is registered but disabled until an operator turns it on.

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
| Update metadata, copy, and move | `save_google_drive_file` | Write |
| Add a comment | `create_google_drive_comment` | Write |
| Move a file to trash | `trash_google_drive_file` | Destructive |
| Change who can reach a file | `share_google_drive_file` | Destructive, **disabled by default** |

### Directory

| Capability | Tools | Access |
|------------|-------|--------|
| Read the connected user's profile | `get_google_user_profile` | Read only |
| Look up people in your Workspace domain | `search_google_directory`, `list_google_directory_people` | Read only |

Directory tools are backed by the People API and read only the signed-in user's own Workspace domain. They confer no administrator capability and do not use the Admin SDK.

### Destructive Tools

Seven tools are destructive and enabled by default. Each one carries the `destructive` annotation and tag, so an MCP client can refuse or confirm them as a class:

`send_gmail_message`, `trash_gmail_messages`, `delete_gmail_label`, `delete_gmail_draft`, `delete_google_calendar_event`, `delete_google_calendar`, `trash_google_drive_file`

Sending Gmail is irreversible. Trashing is recoverable until Google purges the item.

`share_google_drive_file` is also destructive and is **registered disabled**. An operator must set `GOOGLE_ENABLE_DRIVE_SHARING=true` to offer it. Even when enabled, a grant to `anyone`, which publishes a file to everybody holding the link, is refused unless the call explicitly confirms it.

Permanent deletion is not available in any product. Nothing in this MCP can bypass Google's trash.

## Required OAuth Scopes

Add all fifteen to the OAuth consent screen. The authorization flow requests the complete set. The MCP requires `openid` and `userinfo.email` to accept a token; individual tools return a structured `insufficient_scope` error if their product scope was not granted.

| Scope | Why it is needed | Google class |
|-------|------------------|--------------|
| `openid` | **Mandatory.** Google only returns the user identifier (`sub`) when `openid` is granted, and the MCP rejects any token without it. | Basic |
| `.../auth/userinfo.email` | Identify the connected user. | Basic |
| `.../auth/userinfo.profile` | Read the connected user's own name and photo. | Basic |
| `.../auth/gmail.readonly` | Search and read messages, threads, and attachments. | Restricted |
| `.../auth/gmail.compose` | Create and update drafts, and send mail. | Restricted |
| `.../auth/gmail.modify` | Apply and remove labels on messages, and trash them. `gmail.compose` does not cover either. | Restricted |
| `.../auth/gmail.labels` | Create, rename, and delete label definitions. | Sensitive |
| `.../auth/calendar.calendarlist.readonly` | List the user's calendars. | Sensitive |
| `.../auth/calendar.events` | Read, create, update, and delete events, and RSVP. | Sensitive |
| `.../auth/calendar.freebusy` | Check availability. `calendar.events` does not cover free/busy queries. | Sensitive |
| `.../auth/calendar.calendars` | Create, rename, and delete calendars themselves. | Sensitive |
| `.../auth/drive.metadata.readonly` | Read file and shared-drive metadata. | Restricted |
| `.../auth/drive.readonly` | Read and export file content. | Restricted |
| `.../auth/drive` | Create files and folders, update metadata, copy, move, trash, comment, and read permissions. | Restricted |
| `.../auth/directory.readonly` | Look up people in the signed-in user's own Workspace domain. | Sensitive |

Each scope above is prefixed `https://www.googleapis.com`. Google's [OAuth 2.0 scopes](https://developers.google.com/identity/protocols/oauth2/scopes) page is authoritative for the restricted and sensitive classification, and the consent screen shows the classification it applies to your project.

:::warning Scope footprint grew
Earlier releases of this MCP requested eight read-leaning scopes. It now requests fifteen, including the full `.../auth/drive` scope and `gmail.modify`, because the tool surface covers writes, label changes, trash, and calendar management. Both are **restricted** scopes.

If your app is **External**, review [Keep In Mind](#keep-in-mind) before connecting. An existing connection created against the old scope set keeps working for the tools its token covers, and returns `insufficient_scope` for the rest until the user reconnects.
:::

## Create The Google OAuth Client

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project to own the integration.
2. Open **APIs & Services** > **Library** and enable the **Gmail API**, **Google Calendar API**, **Google Drive API**, and **People API**. The People API backs the directory tools; without it those three tools fail.
3. Open **APIs & Services** > **OAuth consent screen** and configure it:
   - Choose **Internal** if every user is in your Google Workspace organization. Internal apps skip Google verification.
   - Choose **External** if users sign in with any Google account, including consumer Gmail. External apps that use restricted Gmail and Drive scopes require Google verification and an annual security assessment before general availability (see [Keep In Mind](#keep-in-mind)).
4. Add the fifteen scopes from [Required OAuth Scopes](#required-oauth-scopes).
5. Open **APIs & Services** > **Credentials**, click **Create Credentials** > **OAuth client ID**, and choose application type **Web application**.
6. Under **Authorized redirect URIs**, click **Add URI** and paste the QuilrAI callback URL shown on the **Google Workspace** MCP setup screen. It must match exactly.
7. Click **Create**, then copy the **Client ID** and **Client Secret**.
8. Paste the Client ID and Client Secret into the QuilrAI manual OAuth setup screen, click **Connect**, and authorize Google. At the consent screen, grant every requested scope, including **openid**.

## Keep In Mind

- **`openid` is not optional.** If a user clears the `openid` permission at consent, authorization appears to succeed but every Google call fails because the token has no `sub` claim. Re-authorize and grant all scopes.
- **Application type must be Web application.** Desktop and other client types do not work with the QuilrAI gateway callback.
- **Restricted-scope verification.** The Gmail scopes and all three Drive scopes are restricted; the Calendar and directory scopes are sensitive. An **External** app must complete Google's OAuth verification, including the CASA security assessment Google requires for restricted scopes, before it can serve users outside its test-user list. Until then, add users under **Test users** on the consent screen to authorize without verification. An **Internal** Workspace app does not need verification, which is the cheaper path when every user is in your own organization.
- **Directory tools need a Workspace domain.** `search_google_directory` and `list_google_directory_people` read your organization's directory. They return nothing useful for a consumer Gmail account that belongs to no Workspace domain.
- **Drive sharing is off unless an operator enables it.** `share_google_drive_file` is not offered by default. If your users need it, ask your QuilrAI operator to enable it for the deployment.
- **One redirect URI per environment.** Google matches the redirect URI exactly. Create a separate OAuth client for each QuilrAI environment whose callback URL differs.
- **Each tenant brings its own credentials.** This MCP is multi-tenant by design. There is no shared QuilrAI-owned Google client, so isolation comes from each connection using its own Google OAuth client.

## Troubleshooting

Failures arrive as a structured tool error carrying a JSON document with a `code`, the HTTP `status`, whether the call is `retryable`, and a `next_action`. The `code` values below are the ones worth acting on.

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The redirect URI in Google Cloud does not match the QuilrAI callback URL. | Copy the callback URL from the MCP setup screen again, add it under **Authorized redirect URIs**, save, and retry. |
| `invalid_client` | Wrong Client ID, wrong secret, or a deleted secret. | Copy the Google Client ID and Client Secret again, update QuilrAI, and retry. |
| `Access blocked: app has not been verified` | An External app is using restricted or sensitive scopes before completing Google verification. | Add the user under **Test users**, or complete Google OAuth verification and the CASA assessment, or switch to an Internal Workspace app. |
| Consent succeeds but every call returns 401 | The `openid` scope was not granted, so the token has no `sub` claim. | Reconnect and grant all requested scopes, including **openid**. |
| `insufficient_scope` from one product | The consent screen is missing a scope, or the connection predates a scope being added. | The error names the required scopes for that product. Confirm the scope is on the consent screen, then reconnect to re-authorize. |
| `insufficient_scope` on every directory tool | The **People API** is not enabled, or `directory.readonly` was not granted. | Enable the People API, confirm the scope, and reconnect. |
| `not_found` on a directory search | The account is not part of a Google Workspace domain. | Directory lookups need a Workspace account. Nothing to fix for consumer Gmail. |
| `sync_expired` from a `sync_*` tool | The stored sync marker is older than Google's retention window. | Start a fresh sync without a marker. The tool returns a new baseline. |
| `invalid_cursor` when paging | A paging cursor was altered, reused by a different user, or the deployment lost its cursor signing secret. | Re-run the original query without a cursor and page forward again. |
| `share_google_drive_file` is not listed | The tool is disabled by default. | Ask your QuilrAI operator to set `GOOGLE_ENABLE_DRIVE_SHARING=true`. |

## References

- [Google: Create an OAuth client ID](https://support.google.com/cloud/answer/6158849)
- [Google: OAuth 2.0 scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google: OAuth API verification FAQ](https://support.google.com/cloud/answer/9110914)
- [Gmail API](https://developers.google.com/gmail/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
- [Google Drive API](https://developers.google.com/drive/api)
- [People API](https://developers.google.com/people)
