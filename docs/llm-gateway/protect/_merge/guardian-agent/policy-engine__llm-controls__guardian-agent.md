---
sidebar_position: 2
sidebar_custom_props:
  icon: Bot
---

# Guardian Agent

:::info V2 console
This card lives in **Policy Engine > LLM Gateway** at `web.quilr.ai/policy`. Edits join the shared draft and take effect once you [review and publish](../../console/govern/author-simulate-and-publish) a revision.
:::

Turn on Guardian's coding helpers and task-adherence checks for matching requests. Runs at the request stage.

![Guardian Agent card collapsed, showing Guardian, Coding helpers, Task adherence and After Guardian runs rows](/img/policy-engine/llm-guardian-agent-card.png)

## Sections

| Section | What it does | Add button |
|---|---|---|
| **Guardian** | The master switch. Off here switches off every Guardian check below for that scope. | **Add settings** |
| **Coding helpers** | On coding requests: a dependency security check and current-version suggestions, each switchable. | **Add** |
| **Task adherence** | Checks that the model stays on the task the user asked for. | **Add** |
| **After Guardian runs** | Follow-up rules that tag a severity on what Guardian found. | **Add follow-up** |

Applies on `assistants`, `bedrock`, `chat`, `copilot`, `responses`, `sdk_check` and `vertex`.

![Task adherence section listing per-application configurations with sensitivity and Nudge or Block](/img/policy-engine/llm-guardian-agent-task-adherence.png)

## Settings

Every add button opens the **Guardian settings** dialog. Each control is a three-way switch, so one configuration can change a single setting and leave the rest to a broader one.

![Guardian settings dialog with Leave as is, On and Off switches for Guardian, Coding helpers and Task adherence, a Reads as preview, and Severity](/img/policy-engine/llm-guardian-agent-settings-dialog.jpg)

| Setting | Options | Default | Notes |
|---|---|---|---|
| Guardian | Leave as is, On, Off | On when opened from **Guardian** | Master switch for everything below. |
| Coding helpers | Leave as is, On, Off | Leave as is | When On: **Dependency security check** (flags vulnerable packages in generated code) and **Latest version suggestions** (suggests current package versions). Both ticked by default. |
| Task adherence | Leave as is, On, Off | Leave as is | When On: sensitivity and action. |
| Task adherence sensitivity | Low, Medium, High | Medium | |
| Task adherence action | Nudge, Block | Nudge | Nudge adds guidance to the response; Block rejects it. |
| Severity | Not set, Very low ... Very critical | Not set | Reported only; never changes what happens. |

**Leave as is** keeps the value from a broader configuration. At least one control must be On or Off.

### Follow-up rules

**Add follow-up** opens **Guardian follow-up**. **When** is one of: **Guardian blocked**, **at least N findings** (N from 1), or **a finding type**. The rule then tags a severity. Guardian results are request-stage fields; they are not visible on the response leg. The highest severity among matching rules is reported.

## Example

<PolicyCard
  name="secure_coding_guardian"
  stage="request"
  priority={700}
  when={[{ field: "Requested model", op: "matches pattern", value: "*code*" }]}
  then={[
    { effect: "Guardian", value: "true" },
    { effect: "Dependency security check", value: "true" },
    { effect: "Latest version suggestions", value: "true" },
    { effect: "Task adherence sensitivity", value: "high" },
    { effect: "Task adherence action", value: "block" },
  ]}
/>

## Scoping and precedence

- **Applies to**: Everyone, People, Smart group, Application, App tag, Requested model, Provider, API surface, Environment, Prompt text, Tool, Source network, or **Except...**.
- When several configurations match, the highest-priority one wins **per setting**.
- **Off** on a narrower scope beats **On** for Everyone, so you can exempt one app or group.
- Need Guardian only for certain languages, repos or request metadata? Use **Add configuration** at the bottom of the card.

## Legacy app setting

Replaces each app's [Guardian Agent](./guardian-agent) settings section while the Policy Engine is on.
