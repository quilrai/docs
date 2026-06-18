---
sidebar_position: 5
sidebar_custom_props:
  icon: LayoutGrid
---

# Google Workspace

**Google Workspace** is a QuilrAI-built MCP available in the MCP Store. It exposes Gmail and Google Calendar tools. The MCP is multi-tenant and does not ship a shared Google OAuth client, so each connection must use its own Google OAuth Client ID and Client Secret created in Google Cloud.

Use this guide when you install **Google Workspace** from the MCP Store and the QuilrAI setup screen asks for a Google Client ID and Client Secret.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## What This MCP Can Do

| Capability | Tools | Access |
|------------|-------|--------|
| Search and read Gmail | `search_gmail_messages`, `get_gmail_message` | Read only |
| Draft and send Gmail | `create_gmail_draft`, `send_gmail_message` | Write (send is destructive and cannot be revoked) |
| List calendars | `list_google_calendars` | Read only |
| Read, create, and update events | `list_google_calendar_events`, `get_google_calendar_event`, `create_google_calendar_event`, `update_google_calendar_event` | Read and write |

Delete-event tools are intentionally not included. `send_gmail_message` is the only destructive tool.

## Required OAuth Scopes

Add all of these to the OAuth consent screen. The MCP rejects tokens that are missing any of them.

| Scope | Why it is needed |
|-------|------------------|
| `openid` | **Mandatory.** Google only returns the user identifier (`sub`) when `openid` is granted, and the MCP silently rejects any token without it. |
| `https://www.googleapis.com/auth/userinfo.email` | Identify the connected user. |
| `https://www.googleapis.com/auth/gmail.readonly` | Search and read messages. Restricted scope. |
| `https://www.googleapis.com/auth/gmail.compose` | Create drafts and send mail. Restricted scope. |
| `https://www.googleapis.com/auth/calendar.calendarlist.readonly` | List the user's calendars. Sensitive scope. |
| `https://www.googleapis.com/auth/calendar.events` | Read, create, and update calendar events. Sensitive scope. |

## Create The Google OAuth Client

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project to own the integration.
2. Open **APIs & Services** > **Library** and enable both the **Gmail API** and the **Google Calendar API**.
3. Open **APIs & Services** > **OAuth consent screen** and configure it:
   - Choose **Internal** if every user is in your Google Workspace organization. Internal apps skip Google verification.
   - Choose **External** if users sign in with any Google account, including consumer Gmail. External apps that use the restricted Gmail scopes require Google verification before general availability (see [Keep In Mind](#keep-in-mind)).
4. Add the six scopes from [Required OAuth Scopes](#required-oauth-scopes).
5. Open **APIs & Services** > **Credentials**, click **Create Credentials** > **OAuth client ID**, and choose application type **Web application**.
6. Under **Authorized redirect URIs**, click **Add URI** and paste the QuilrAI callback URL shown on the **Google Workspace** MCP setup screen. It must match exactly.
7. Click **Create**, then copy the **Client ID** and **Client Secret**.
8. Paste the Client ID and Client Secret into the QuilrAI manual OAuth setup screen, click **Connect**, and authorize Google. At the consent screen, grant every requested scope, including **openid**.

## Keep In Mind

- **`openid` is not optional.** If a user clears the `openid` permission at consent, authorization appears to succeed but every Google call fails because the token has no `sub` claim. Re-authorize and grant all scopes.
- **Application type must be Web application.** Desktop and other client types do not work with the QuilrAI gateway callback.
- **Restricted-scope verification.** `gmail.readonly` and `gmail.compose` are restricted scopes and the Calendar scopes are sensitive. An **External** app must complete Google's OAuth verification, including an annual CASA security assessment, before it can serve users outside its test-user list. Until then, add users under **Test users** on the consent screen to authorize without verification. An **Internal** Workspace app does not need verification.
- **One redirect URI per environment.** Google matches the redirect URI exactly. Create a separate OAuth client for each QuilrAI environment whose callback URL differs.
- **Each tenant brings its own credentials.** This MCP is multi-tenant by design. There is no shared QuilrAI-owned Google client, so isolation comes from each connection using its own Google OAuth client.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| `redirect_uri_mismatch` | The redirect URI in Google Cloud does not match the QuilrAI callback URL. | Copy the callback URL from the MCP setup screen again, add it under **Authorized redirect URIs**, save, and retry. |
| `invalid_client` | Wrong Client ID, wrong secret, or a deleted secret. | Copy the Google Client ID and Client Secret again, update QuilrAI, and retry. |
| `Access blocked: app has not been verified` | An External app is using restricted or sensitive scopes before completing Google verification. | Add the user under **Test users**, or complete Google OAuth verification, or switch to an Internal Workspace app. |
| Consent succeeds but every call returns 401 or tools fail | The `openid` scope was not granted, so the token has no `sub` claim. | Reconnect and grant all requested scopes, including **openid**. |
| `invalid_scope` or `403` from Gmail or Calendar | The consent screen is missing a required scope, or an API is not enabled. | Confirm the Gmail API and Google Calendar API are enabled and all six scopes are present, then reconnect. |

## References

- [Google: Create an OAuth client ID](https://support.google.com/cloud/answer/6158849)
- [Google: OAuth 2.0 scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Google: OAuth API verification FAQ](https://support.google.com/cloud/answer/9110914)
- [Gmail API](https://developers.google.com/gmail/api)
- [Google Calendar API](https://developers.google.com/calendar/api)
