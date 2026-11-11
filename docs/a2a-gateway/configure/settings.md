---
sidebar_position: 3
sidebar_label: "Gateway settings"
sidebar_custom_props:
  icon: ShieldCheck
description: "A2A Gateway settings for your organization: the gateway address, default hop depth, signed cards, push relay, the public catalog, data protection actions and card signing keys."
console_path: /settings/a2a-gateway/settings
aliases: [a2a settings, a2a data protection, a2a dlp, a2a signing keys, push notifications, public agent catalog, tenant handle]
---

# Gateway settings

Updated on 11 November 2026.

These settings apply to every agent and caller in your organization. Go to **Settings > AI Gateway > A2A Gateway** and open the **Settings** tab. **Summary** at the top shows what is in effect.

## Gateway address

**Gateway address** shows the URL every agent URL starts with: `https://<gateway-host>/a2a/<tenant-handle>/<agent-slug>`. The tenant handle identifies your organization; it is fixed. Copy the full URL of an agent from its **Endpoints** box.

![Summary and Gateway address sections with the tenant handle, gateway URL and base path](/img/a2a-gateway/settings-address.png)

## Defaults

![Defaults: max hop depth, signed cards, push relay, public catalog, data protection actions and category overrides](/img/a2a-gateway/settings-defaults.png)

| Setting | What it does |
|---|---|
| **Default max hop depth** | The deepest delegation chain allowed, 1 to 16 (default 5). An agent can set its own. Loop detection is always on. |
| **Require signed agent cards by default** | Agents that do not set their own rule accept only cards with a verified signature. |
| **Relay push notifications** | Agents can send task updates to callers' push endpoints through the gateway, with data protection applied. Off removes push support from every agent card the gateway serves. |
| **Public agent catalog** | Anyone can list the agents marked with a public card. Calls still need a caller key. |

Click **Save settings** to apply changes.

## Data protection

The gateway scans requests, responses, streams and push updates with your organization's detection categories.

- **Requests to agents** and **Responses to callers** each take an action: **Allow**, **Flag**, **Redact** or **Block**.
- **Category overrides** set a different action for one category. Click **Add override** and pick the category and action.

A blocked call returns `-31451`. Redaction rewrites text and data values in place; file contents are never rewritten.

If a scan cannot finish (for example, it times out or a file type is not supported), the message goes through and the log records why.

## Card signing keys

The gateway signs the agent cards it serves, so callers can check that a card came from your gateway. The public keys are published at `/a2a/<tenant-handle>/.well-known/jwks.json`.

Click **Rotate** to start signing with a new key. The previous key stays published for 30 days, so cards signed with it keep verifying.

## Who can read message content

A2A logs store full message content. Who can read it is set by the **A2A message content** permission in your console roles. How long logs are kept follows your data retention settings.
