---
sidebar_position: 2
sidebar_label: "Callers and keys"
sidebar_custom_props:
  icon: KeyRound
description: "Create A2A callers, issue and revoke their keys, grant them agents, skills and methods, and set end-user tokens, chain tokens, source IPs and limits."
console_path: /settings/a2a-gateway/callers
aliases: [a2a callers, a2a keys, caller key, a2a grants, a2a access, end-user token, user token, source ip allowlist, a2a rate limit]
---

# Callers and keys

Updated on 11 November 2026.

A caller is anything that calls agents through the gateway: one of your agents, an app or a partner. Each caller has its own keys and its own grants. Go to **Settings > AI Gateway > A2A Gateway** and open the **Callers** tab.

## Create a caller

1. Click **Create caller**.
2. Enter a **Name** and pick a **Type**: Agent, App or Partner. **Description**, **Owner** and **Tags** are optional.
3. Keep **Create a first key** on and click **Create caller**.
4. Copy the key. **It is shown only once.**

![Create caller dialog](/img/a2a-gateway/create-caller.jpg)

## Keys

Keys look like `sk-quilr-a2a-...`. The caller sends one on every request, as `Authorization: Bearer <key>` or in the `X-Quilr-A2A-Key` header.

On the caller's page, under **Keys**:

- **Create key** adds another key, with an optional expiry date. Use it to rotate keys without downtime.
- **Disable** stops a key until you turn it back on.
- **Revoke** stops a key for good.

Deleting a caller revokes all its keys.

## Access

**Access** decides which agents the caller reaches, which skills and which methods. Grants are the only way to allow access: an agent with no grant does not exist for this caller.

1. Choose an agent from **Add an agent**.
2. Keep **All current and future skills**, or turn it off and tick the skills this caller needs. Picking skills needs a skill-routed agent.
3. Turn methods on or off. All are on by default.
4. Click **Save access**.

![Access section with Order Support Agent granted the Order status skill and all methods](/img/a2a-gateway/caller-access.png)

| Method | Allows |
|---|---|
| **send** | Send a message |
| **stream** | Send a message and stream the reply |
| **tasks** | Read, list, cancel and follow tasks |
| **push** | Manage push notification settings |
| **extended card** | Read the extended agent card |

**All current and future skills** includes skills the agent adds later, once you approve its new card. A list of skills does not grow on its own.

## Identity, network and limits

![Identity, network and limits section with Acts as agent, End-user token, Require chain token, Allowed source IPs and limits](/img/a2a-gateway/caller-identity.png)

| Setting | What it does |
|---|---|
| **Acts as agent** | Set this when the caller is itself an agent registered here. Its calls then count as hops in the same [delegation chain](../get-started/a2a-gateway#chain-limits). |
| **Enabled** | A disabled caller's keys are refused. |
| **End-user token** | Whether requests carry the identity of the person the caller acts for. See below. |
| **Require chain token** | Requests must carry the chain token from the previous hop. Use it for callers that act as agents. |
| **Allowed source IPs** | IP ranges (CIDR), one per line. Blank allows any source. |
| **Requests per minute**, **Max concurrent**, **Max open tasks** | Limits for this caller. Blank means no limit. Over a limit, calls are refused with `-31429` and a `Retry-After` header. |

### End-user token

A caller can pass the person it acts for as a signed JWT in the `X-Quilr-User-Token` header. The gateway checks it, records the user's email in the logs and ties tasks to that user. The token itself is never logged, and it reaches the agent only through the on-behalf-of or forward [outbound auth](./agents#outbound-auth) options.

| Option | Effect |
|---|---|
| **Off: requests don't carry a user token** | The header is ignored. |
| **Optional: verified when present** | A token is checked when sent. |
| **Required: refused without a valid user token** | Requests without a valid token are refused with `-31401`. |

For **Optional** and **Required**, click **Add issuer** for each identity provider you trust and enter:

- **Issuer**: the token's `iss` value.
- **Signing keys**: a **JWKS URL**, or **Paste a JWKS**.
- **Audiences**: the `aud` values to accept.
- **Email claim** and **Groups claim**, if your tokens use other names.
