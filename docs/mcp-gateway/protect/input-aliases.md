---
sidebar_position: 9
sidebar_label: "Input aliases"
sidebar_custom_props:
  icon: Route
---

# Input Aliases

Map client inputs to the inputs a tool expects. AI clients sometimes send mismatched inputs, such as `num_results` when the tool expects `limit`, causing the call to fail. The console identifies recurring input mismatches and suggests an alias. Applying it translates the input before policy evaluation and DLP scanning.

## How it works

<StepFlow steps={[
  {
    label: "Client sends mismatched input",
    items: [
      "Sends num_results",
      "Tool expects limit",
      "Call fails ✗",
    ],
  },
  {
    label: "Console suggests a fix",
    items: [
      "Repeated input mismatch",
      "Shows a quick fix",
    ],
  },
  {
    label: "You apply it",
    items: [
      "num_results becomes limit",
      "Policies and DLP see limit",
      "Call succeeds ✓",
    ],
  },
]} />

## The banner

When fixes are waiting, the MCP Gateway page shows **N quick fixes could prevent failed tool calls - AI clients sent tool inputs that didn't match N times in the last 7 days.** Click **Review fixes**.

## Review quick fixes

![Review quick fixes drawer listing fixes for one server, grouped by tool, each with a badge, failed calls, people, last seen, agent chips, Show example, Dismiss and Apply](/img/mcp-gateway/ui/review-quick-fixes.png)

**Show example** puts what the client sent next to what the tool expects:

![A quick fix card with the example open: SENT shows num_results set to 3 and EXPECTED shows limit set to 3, with Dismiss and Apply buttons](/img/mcp-gateway/ui/quick-fix-example.png)

The drawer shows the total at the top, for example **5 quick fixes across 1 server** and **26 failed calls in the last 7 days**. Fixes are grouped by server, then by tool, with each tool's failure rate, for example **get_webpages 22 of 52 calls failed (42%)**.

| Part of a fix card | What it tells you |
|--------------------|-------------------|
| Headline | What went wrong, for example **Clients sent urls - the tool expects ids_or_urls**. |
| Badge | The type of input mismatch (see below). |
| Failed calls | How many calls failed because of this mismatch. |
| People | How many users encountered it. |
| Last seen | When it last happened. |
| Share of calls | The share of this tool's calls that failed because of this mismatch. |
| Agent chips | Which AI clients sent mismatched inputs, with their counts. |
| **Show example** | A real input as **Sent** and as **Expected**, side by side. |

| Badge | Meaning |
|-------|---------|
| **required input missing** | The client used another name for an input the tool requires. |
| **unknown input** | The client sent an input the tool doesn't have, usually an alternative name for an existing input. |
| **inputs in the wrong shape** | The client nested its inputs differently from what the tool expects. |
| **value not accepted** | The client sent a value the tool doesn't accept, such as another spelling. |

| Button | Result |
|--------|--------|
| **Apply** | Adds the alias to the server. Subsequent calls use the alias to translate matching inputs. |
| **Dismiss** | Hides the suggestion. |
| **Apply all (N)** | Applies every fix in the drawer. Shown when there is more than one. |

If nothing needs fixing, the drawer says **Nothing to fix right now**.

## Settings > Input aliases

Each server lists its aliases under **Configure** in the **Input aliases** section ("Fix inputs AI clients get wrong"). The subtitle shows how many are on, for example **2 of 3 on**. A server with aliases also shows an alias count tag on its card.

![Input aliases section of a server's settings, listing each alias with its tool, what it translates, its source tag, calls fixed and an On or Off switch](/img/mcp-gateway/ui/settings-input-aliases.png)

| Part | What it shows |
|------|---------------|
| Tool | The tool the alias applies to. |
| Translation | What the alias does (see below). |
| **Suggested fix** / **Added manually** | Where the alias came from. |
| Fixed calls | For applied fixes, how many calls it has corrected and when it last did. |
| **Not applying** | The tool's inputs changed, so the alias no longer fits and is skipped. |
| **On / Off** | Turn the alias off without removing it. |
| **Remove** | Delete the alias. Confirm with **Remove alias**, or click **Keep**. |

The kinds of alias, as the list describes them:

| Kind | Example |
|------|---------|
| Renamed input | Translates `urls` to `ids_or_urls` |
| Normalized value | Translates `status` "open" to "OPEN" |
| Wrapped inputs | Moves inputs sent at the top level inside `arguments` |
| Unwrapped inputs | Moves inputs sent inside `arguments` to the top level |

Aliases are added from **Review quick fixes**. You cannot add one manually in this section.

## Related

- [Tools management](./tool-visibility) - inspect a tool's input schema.
- [Security guardrails](./security-guardrails) - DLP checks run on the translated inputs.
- [Agents configuration](../servers-and-connections/allowed-agents) - the AI clients named on fix cards.
