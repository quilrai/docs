---
sidebar_position: 4
sidebar_label: "Human approval"
sidebar_custom_props:
  icon: Handshake
---

# Human approval

Require user approval for tools that modify data or systems. With confirmation on, the gateway pauses each call to the tool and asks the user to approve it. The call reaches the MCP server only after the user clicks **Approve**.

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

The approval request appears in the user's AI app. What it looks like depends on the client.

| Client | What the user sees |
|--------|--------------------|
| **VS Code** | A native form in the chat: the tool name and server, the arguments, a **Run this tool?** choice of **Approve** or **Deny**, and a justification box. |
| **ChatGPT** and **claude.ai** | An **Approval required** card in the conversation showing the server, the tool and its arguments, a **Justification** box, and **Approve** and **Deny** buttons. **Approve** runs the call once and the card shows the result. |
| **Other clients** | The assistant replies with an **Approve in Quilr** link. It opens an **Approval required** page showing the server, the tool, the arguments and **Why approval is needed**, with a **Justification** box and **Approve** and **Deny** buttons. After approving, the user asks the assistant to run the call again. |

<!-- TODO-SCREENSHOT: ChatGPT or claude.ai conversation showing the Quilr "Approval required" card with arguments, Justification box, Approve and Deny -->

<!-- TODO-SCREENSHOT: Browser "Approval required" page opened from the Approve in Quilr link, showing Arguments, Why approval is needed, Justification, Approve and Deny -->

ChatGPT and claude.ai also show the **Approve in Quilr** link under the card, in case the card doesn't load. Both resolve the same request.

### Justification

The justification box reads **Justification (required to approve)** when the tool requires one and **Justification (optional)** otherwise. Up to 1,000 characters. **Approve** without a required justification shows **A justification is required to approve.** and nothing runs. The justification is saved with the call and is never sent to the MCP server or the model.

### Deny, dismiss or no answer

| What happens | Result |
|--------------|--------|
| User clicks **Deny** | The call never runs. The assistant is told the user declined. |
| User closes the form or card | The call never runs. |
| Nobody answers in time | The request expires after 10 minutes and the call never runs. The card or page says the request expired and asks the user to try again. |

A request that was already approved or denied elsewhere shows **Already decided**.

## Review confirmed calls

Open **Overall analytics > Activity > Tool calls**, or **Inspect > Logs** on the server card, and click a call. The **Tool call detail** drawer shows the arguments and the result. The approval decision and the justification are recorded in the call's **Metadata**.

## Going further with the Policy Engine

When the Policy Engine is on for the MCP Gateway, the **Human Approval** card (stage 3, Request) in **Govern > Policy Engine > MCP Gateway** decides which calls need approval, and the switches in **Tools** are read-only. Its tool confirmation effect takes `required`, which asks for approval with an optional justification, or `required_with_justification`, which also makes the justification mandatory.

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

## Related

- [Tool visibility](./tool-visibility) - enable and disable tools.
- [Security guardrails](./security-guardrails) - block or redact sensitive data in calls.
- [Policy Engine overview](../../console/govern/policy-engine) - how cards, stages and priorities work.
