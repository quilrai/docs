---
sidebar_position: 4
sidebar_label: "Human approval"
sidebar_custom_props:
  icon: Handshake
description: "Require the calling user to confirm a tool call, optionally with a written justification, how that differs from independent approval, and what users see in each AI client."
---

# Human approval

Require user approval for tools that modify data or systems. With confirmation on, the gateway pauses each call to the tool and asks the user to approve it. The call reaches the MCP server only after the user clicks **Approve**.

## Who approves

The approval comes from the **person who made the call**, in their own AI app. It is a confirmation step that slows down risky actions and records a justification. It is **not** an independent approval:

- No administrator, manager or second person reviews the call, and there is no approval queue or delegation.
- A message such as "An administrator requires confirmation for this tool" means an administrator turned the rule on, not that an administrator approves each call.
- By default, anyone who has the **Approve in Quilr** link can decide, and the decision is recorded as the user who made the call. Treat the link like the conversation it came from and don't share it. To require the approver to be signed in as that user, see **Signing in to approve** under [Limits and good to know](#limits-and-good-to-know).

This feature doesn't provide two-person approval. To reduce exposure for sensitive tools, restrict them instead: disable it with [Tool visibility](./tool-visibility), or limit who can reach it with [Group and user rules](./group-and-user-rules) and [Server access](./server-access).

## Configure it on the server

<ConsolePath
  console="QuilrAI console"
  href="https://web.quilr.ai"
  path={['Settings', 'AI Gateway', 'MCP Gateway', 'server card', 'Configure']}
  action="Tools"
/>

Each tool has two switches.

![Tools section with the Require confirmation and Require justification switches beside each tool](/img/mcp-gateway/ui/settings-tools.png)

| Switch | What it does |
|--------|--------------|
| **Require confirmation** | The user must approve each call before the gateway forwards it. |
| **Require justification** | The user must type a justification to approve. Denying a call does not require one. |

- Turning **Require confirmation** on also turns **Require justification** on. Turn justification off per tool if approval without a written reason is sufficient.
- **Require justification** needs confirmation on first.
- The confirmation switches are locked while a tool is disabled.

Click **Save settings** to apply. Good candidates are tools in the **Write tools** and **Destructive tools** groups, such as sending messages, deleting records or merging code.

## Different rules for groups and users

Confirmation can differ by smart group or user. In [Group and user rules](./group-and-user-rules), click **Add rule**, choose **A smart group** or **A single user**, and under **Tool overrides** set **Confirmation** and **Justification** for each tool.

| Value | Meaning |
|-------|---------|
| **Inherit** | Use the server's setting from **Tools**. |
| **On** | Require it for this group or user. |
| **Off** | Don't require it for this group or user. |

Setting **Confirmation** to **On** also sets **Justification** to **On**. If a user is in several groups with rules, a group that requires confirmation takes precedence; a rule for that single user applies last. Use **Effective settings preview** to check one user's effective settings.

## What your users see

The approval request appears in the user's AI app. Each app supports different things, so the gateway picks the best option the app tells it it can handle, in this order:

| How approval appears | What it is | Does the tool run as soon as the user approves? |
|----------------------|------------|-------------------------------------------------|
| **In-chat prompt** | The app pauses the call and shows its own approval form in the chat, with the tool, the arguments, **Approve** or **Deny**, and a justification box. | Yes. The waiting call continues the moment the user answers. |
| **Approval card** | Quilr draws an **Approval required** card inside the conversation, with the server, the tool and its arguments, a **Justification** box, and **Approve** and **Deny** buttons. | Yes. **Approve** runs the tool once and the card shows the result. |
| **Approval link** | The assistant receives an **Approve in Quilr** link. It opens an **Approval required** page in the browser with the server, the tool, the arguments, **Why approval is needed**, a **Justification** box, and **Approve** and **Deny** buttons. Apps that support it open the link for the user from inside the app instead of showing it as text. | No. The approval is recorded, and the tool runs when the assistant calls it again. |

If an in-chat prompt can't be shown or isn't answered, the gateway falls back to an approval link. Cards always come with the **Approve in Quilr** link underneath, in case the card doesn't load. Card and link resolve the same request, so approving in one place is enough.

<!-- TODO-SCREENSHOT: ChatGPT or claude.ai conversation showing the Quilr "Approval required" card with arguments, Justification box, Approve and Deny -->

<!-- TODO-SCREENSHOT: Browser "Approval required" page opened from the Approve in Quilr link, showing Arguments, Why approval is needed, Justification, Approve and Deny -->

### Support by client

Based on what each app reports to the gateway when it connects, as of October 2026. Apps change often, so a newer version may behave differently.

| Client | How approval appears | Runs on approval without the assistant trying again? | What the user does |
|--------|----------------------|------------------------------------------------------|--------------------|
| **claude.ai** (web) and **Claude Desktop** chat, using connectors added in claude.ai | Approval card | Yes | Click **Approve** on the card, then press Enter to send the short follow-up message that claude.ai fills in. |
| **ChatGPT** | Approval card | Yes | Click **Approve** on the card. ChatGPT continues on its own. |
| **VS Code** (GitHub Copilot Chat) | In-chat prompt | Yes | Choose **Approve** in the form. |
| **Claude Code**, using connectors from your claude.ai account | Approval link | No | Open the link, click **Approve**. The assistant calls the tool again. |
| **Claude Code**, with the gateway added directly as an MCP server | Recent versions: in-chat prompt. Older versions: approval link. | Prompt: yes. Link: no. | Answer the prompt, or open the link and click **Approve**. |
| **GitHub Copilot CLI** and **OpenAI Codex** | In-chat prompt | Yes | Answer the prompt. |
| **Microsoft Copilot Studio** | Approval link | No | Open the link, click **Approve**, then ask the agent to run the step again. |
| **Cursor**, **Claude mobile apps** and other clients | In-chat prompt if the app supports it, otherwise approval link | Depends on the app | Answer the prompt, or open the link and click **Approve**. |

### Step by step

#### claude.ai and Claude Desktop

1. Claude calls a tool that needs approval. An **Approval required** card appears in the reply.
2. Claude's text written before the card may say the tool "needs approval" or is waiting for you. That is expected: Claude wrote it before you clicked.
3. Review the arguments, add a justification if asked, and click **Approve**. The tool runs once and the card shows **Approved - completed** with the result.
4. claude.ai then places a short message in your message box, starting with **Approved**, that asks Claude to continue with the result. claude.ai shows its own caution notice above it. Press Enter to send it, and Claude continues from the result.

The last step is a claude.ai safeguard: claude.ai doesn't let a card send a message for you without your say-so, and Quilr can't bypass it. The tool has already run at step 3. Sending the message only lets Claude read the result and carry on. claude.ai doesn't support in-chat prompts today, which is why it uses the card.

If the tool takes a long time, the card shows **Approved - still running** and a **Check result** button. If you use the **Approve in Quilr** link under the card instead of the card's own button, the tool doesn't run yet: ask Claude to try the tool again.

#### ChatGPT

1. ChatGPT calls a tool that needs approval. An **Approval required** card appears in the conversation.
2. Click **Approve**. The tool runs once and the card shows the result.
3. The card sends a short follow-up to ChatGPT, and ChatGPT continues with the result without you typing anything.

#### VS Code (GitHub Copilot Chat)

1. Copilot calls a tool that needs approval. VS Code shows a form in the chat with the tool, the server and the arguments.
2. Choose **Approve** (and type a justification if asked) or **Deny**.
3. On **Approve**, the waiting call continues and Copilot gets the result straight away.

#### Claude Code

When Claude Code uses connectors from your claude.ai account, it can't show cards or in-chat prompts, so approval goes through the link:

1. Claude Code calls the tool. The reply contains an **Approve in Quilr** link and tells the assistant that approval is pending.
2. Open the link, review the request, and click **Approve**.
3. Claude Code calls the tool again and gets the result. If it tries again before you click, the gateway holds that attempt for up to about 45 seconds so your click turns straight into the result. If you take longer, the assistant gets the link again: approve, then ask it to try again.

Recent versions of Claude Code added directly as an MCP server (rather than through claude.ai connectors) report support for in-chat prompts, so approval appears as a prompt in the terminal or IDE panel instead.

#### Clients that use the approval link

Copilot Studio, older Claude Code versions and any app without prompts or cards follow the same pattern as Claude Code above: open the link, click **Approve**, and the tool runs on the assistant's next call. If the assistant doesn't try again on its own, ask it to.

### Justification

The justification box reads **Justification (required to approve)** when the tool requires one and **Justification (optional)** otherwise. Up to 1,000 characters. **Approve** without a required justification shows **A justification is required to approve.** and nothing runs. The justification is saved with the call and is never sent to the MCP server or the model.

### Deny, dismiss or no answer

| What happens | Result |
|--------------|--------|
| User clicks **Deny** | The call never runs. The assistant is told the user declined and not to try again. For 10 minutes, repeat attempts at the same call are answered as declined without asking again. |
| User dismisses the in-chat prompt | The call doesn't run. |
| User ignores or closes the card | The request stays open until it expires. Until then it can still be approved or denied from the card or the **Approve in Quilr** link. |
| Nobody answers in time | The request expires after 10 minutes and the call never runs. The card or page says the request expired and asks the user to try again. |

A request that was already approved or denied elsewhere shows **Already decided**, together with the earlier outcome.

## Limits and good to know

- **One approval, one run.** Each approval covers a single call. Approving on a card or prompt runs the tool once. If the assistant then calls the same tool again, it gets the stored result from that run for up to 10 minutes instead of running the tool a second time, so tools that send, create or delete something don't run a second time just because the assistant retried.
- **The approved arguments are what runs.** After approving through a link, the assistant's next call of the same tool uses the approval. If the assistant changes the arguments slightly on that retry, the gateway runs the arguments shown on the approval page, not the new ones, as long as that is the only open approval for the tool. Otherwise it asks for a fresh approval.
- **Time limits.** An unanswered request expires after 10 minutes. An approval given through the link must be used within 5 minutes. A stored result from a card approval is kept for 10 minutes.
- **Approval doesn't skip other controls.** The approved call still passes through [Security guardrails](./security-guardrails), usage quotas and the other policies in force when it runs. If they block it, it is blocked. Quotas count an approved call once, even if the assistant retries.
- **Apps remember tool lists.** Most apps cache the list of tools and the card when they connect. After you turn approval on or off for a tool, users may need to reconnect the server, or start a new chat, before the change shows. Until then, the **Approve in Quilr** link still works.
- **Signing in to approve.** By default the approval link works without signing in: having the link is enough, and the decision is recorded as the user who made the call. The link is part of the reply, so the assistant can read it too. If you need the approver to be signed in to QuilrAI as that same user, ask QuilrAI to turn on sign-in for approval pages for your deployment (for self-hosted gateways, set `MCP_APPROVAL_PAGE_AUTH=cookie`).
- **The caller must be known.** Approval is tied to a person. If the gateway can't tell which user is making a call, calls to tools that need approval are blocked rather than run.
- **Unattended agents.** Automations such as n8n workflows or scheduled scripts have nobody to click the link, so their calls wait and expire. Leave approval off for those callers with [Group and user rules](./group-and-user-rules), or match on **agent name** in the Policy Engine (below).

## Review confirmed calls

Open **Overall analytics > Activity > Tool calls**, or **Inspect > Logs** on the server card, and click a call. The **Tool call detail** drawer shows the arguments and the result. The approval decision, who decided, and the justification are recorded in the call's **Metadata**.

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, the **Human Approval** card (stage 3, Request) in **Govern > Policy Engine > MCP Gateway** decides which calls need approval, and the switches in **Tools** are read-only. **Edit anyway** saves values that apply only if the Policy Engine is disabled (see [What happens to classic settings](../../console/govern/switching-from-classic-settings#what-happens-to-classic-settings)). Its tool confirmation effect takes `required`, which asks for approval with an optional justification, or `required_with_justification`, which also makes the justification mandatory.

Scenarios the card supports that per-tool switches cannot:

- **Approve by tool type, on every server.** Match tool **tags** (for example `write`) or the `destructive` annotation, so new tools that fit the pattern need approval as soon as they appear.
- **Approve for some people or agents only.** Combine the tool condition with **smart groups**, **user email** or **agent name**, for example require approval from contractors but not from the team that owns the server.
- **Approve on one route.** Require approval only on direct connections or only through OneMCP, using **route kind**.

<PolicyCard
  name="confirm_write_tools"
  stage="request"
  priority={700}
  when={[{ field: "Tool tags", op: "has entry", value: "write" }]}
  then={[{ effect: "tool confirmation", value: "required" }]}
/>

Edits join a shared draft and apply once you [publish a revision](../../console/govern/author-simulate-and-publish).

## How this compares to other MCP gateways

Based on each vendor's public documentation as of October 2026. Products change often, so check the vendor's current docs before deciding.

| | QuilrAI | MintMCP | TrueFoundry | Runlayer |
|---|---|---|---|---|
| Per-call approval at the gateway | Yes | Yes | Yes | Yes, in beta |
| Where approval happens | In the chat (in-chat prompt or card) when the app supports it, otherwise a link | A link to an approval page | The vendor console, with alerts by email, Slack, Teams or PagerDuty | Not documented |
| Tool runs as soon as approval is given | Yes, with in-chat prompts and cards | No. The agent must call the tool again. | No. The agent must call the tool again. | Not documented |
| Protection against running twice | A retry after a card approval returns the stored result | Single-use approval | "Once" approval option | Not documented |
| Request lifetime | 10 minutes | 30 seconds to 24 hours (default 1 hour) | Set per policy | Not documented |
| Approval by tool type, group, user or agent | Yes, with the Policy Engine | Not documented | By tool name, all destructive tools, or all tools | Rules on top of access policies |
| Approval combined with data guardrails and quotas | Yes. The approved call still passes guardrails and quotas, and is charged once. | Approval runs after rules and pre-call checks | Not documented | Tool scanning alongside approval |

**QuilrAI keeps approval in the conversation.** In apps that support in-chat prompts or cards, the tool runs the moment the user clicks, without relying on the assistant to try again. With link-based approval, the assistant has to call the tool again after the user approves.

"Not documented" means the vendor's public documentation doesn't describe it, not that the product lacks it.

Sources: [MintMCP tool approval](https://www.mintmcp.com/docs/tool-approval), [TrueFoundry MCP tool approval](https://www.truefoundry.com/docs/ai-gateway/mcp/mcp-tool-approval), [Runlayer agent platforms](https://docs.runlayer.com/agent-platforms).

## Related

- [Tool visibility](./tool-visibility) - enable and disable tools.
- [Security guardrails](./security-guardrails) - block or redact sensitive data in calls.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
