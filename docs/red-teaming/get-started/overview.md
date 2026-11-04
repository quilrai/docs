---
sidebar_position: 1
sidebar_label: "About"
sidebar_custom_props:
  icon: Layers
description: "What Quilr Red Teaming does, the five red teaming modes, and its main capabilities."
aliases: [red teaming, about, modes]
---

# About Quilr Red Teaming

Quilr Red Teaming is the adversarial testing component of the QuilrAI platform. It runs a Red Team Agent that attacks your AI systems around the clock, and records every attack that succeeds with the evidence you need to reproduce and fix it.

Most security teams test AI applications once before launch, using a fixed list of prompts. Models, system prompts, retrieval sources, and connected tools keep changing after launch, so a one-time test goes stale quickly. Quilr Red Teaming treats testing as a continuous control. Each assessment generates fresh attacks for the current state of the target, and a schedule can repeat it as the target changes.

You can red team five kinds of AI systems: applications and agents already behind the Quilr LLM Gateway, chat and voice agents that run outside it, AI workflows that process documents, images, or data, foundation models straight from the provider, and MCP servers.

## What you can red team

When you start a new test, you first choose the type of system to attack. The type decides how the Red Team Agent connects, which attacks apply, and what the evaluation inspects.

![The New test page in the QuilrAI console, showing five target type cards: Gateway-connected, Agent, AI Workflow, Model, and MCP, each with a Start link.](/img/red-teaming/new-assessment-modes.png)

*Figure 1. Supported red-teaming modes: Gateway-connected, Agent, AI Workflow, Model, and MCP.*

### Gateway-connected

An application or agent that already sends its traffic through the Quilr LLM Gateway. Because the gateway sees every request, Red Teaming discovers the model routes, MCP servers, and native tools the system uses, so you do not need to configure a separate connection.

Gateway-connected tests get the deepest coverage. It is also the simplest to set up: attacks travel through the gateway with the application's own key and policies, so you do not configure an endpoint or credentials.

### Agent

A chat or voice agent that runs outside the Quilr gateway and is reached through its own endpoint. Use this type for agents hosted on another platform, built by a vendor, or not yet onboarded to QuilrAI.

- **Chat agents** are tested over their text endpoint, single-turn or multi-turn.
- **Voice agents** are tested over their voice endpoint. The Red Team Agent speaks its attacks as audio, transcribes the replies, and tests voice-specific techniques such as instructions hidden in background audio and caller impersonation.

If you list the MCP tools the agent can call, the Red Team Agent also tries to make the agent misuse them.

### AI Workflow

A pipeline that takes documents, images, or structured data, processes it with AI, and produces a result or takes an action, with no chat interface. Examples include invoice extraction, résumé screening, claims triage, contract review, and image moderation.

Because there is no conversation to attack, the Red Team Agent hides its attacks inside the inputs: instructions in white text or metadata in a PDF, text embedded in an image, or poisoned fields in a JSON or CSV record. Evaluators check whether the workflow's output or action changed in a way it should not have, such as approving an invoice it should reject.

### Model

A single foundation model, tested directly from its provider with no application around it. You can also run the same attacks against several models side by side and compare their defenses.

Use this type to choose a model for a new project, or to baseline a new model version as soon as the provider releases it, before you route production applications to it.

### MCP

An MCP server and the tools it exposes, tested directly without an agent in front of it. The Red Team Agent inspects tool descriptions for poisoning, sends malicious and malformed tool inputs to test for injection, checks whether tools enforce authorization, and looks for sensitive data in what the tools return.

Use this type to vet a third-party MCP server before you allow it, or to test your own server before you publish it.

:::warning[Temporary location]

MCP server testing is in Red Teaming for now. It will move to Quilr Code Advisor when Code Advisor becomes generally available (GA). Tests, findings, and reports you create here will be kept when it moves.

:::

### Compare target types

| Type | Connects through | Main risks tested | Typical use |
| --- | --- | --- | --- |
| Gateway-connected | Quilr LLM Gateway | Prompt injection, data leakage, tool abuse, privilege escalation | Apps and agents already onboarded to QuilrAI |
| Agent | The agent's chat or voice endpoint | Prompt injection, jailbreak, data leakage, tool misuse | Agents hosted elsewhere or built by vendors |
| AI Workflow | The workflow's input API or upload | Indirect injection in files, manipulated decisions, data leakage | Document, image, and data pipelines |
| Model | The model provider's API | Jailbreak, harmful content, system prompt leakage | Model selection and new version baselines |
| MCP | The MCP server endpoint | Tool poisoning, injection, authorization gaps, data leaks | Vetting and publishing MCP servers |

Each mode has its own step-by-step guide under [Configure and run](../configure-and-run/gateway-connected.md).

## Features of Quilr Red Teaming

The following sections describe the main capabilities. For definitions of the terms used here, see the [Glossary](../reference/glossary.md).

### Adaptive attack generation

Quilr does not run the same static list of prompts against every application. The Red Team Agent works the way a human red teamer would: it studies the target first, then designs attacks for that specific system.

When you provide the target's system prompt and the list of tools it is connected to, the Red Team Agent uses them to understand what the application is meant to do, what it must never do, and what it can reach. It then curates attacks that match: a support bot with a refund tool is pushed to issue unauthorized refunds, an HR assistant is pressed to reveal other employees' records, and a coding agent is steered toward running commands it should not.

Because the attacks are built around the target's real instructions and tools, the findings reflect risks the application actually faces, and you spend less time triaging results that do not apply.

### Coverage for apps, agents, AI workflows, and tools

AI no longer lives only behind a chat box. It shows up in many forms: applications with AI built in, interactive agents that plan and call tools, AI workflows that process documents and data in the background, and voice agents that talk to customers on the phone. New forms appear every year, and each one exposes a different attack surface.

Quilr Red Teaming is built to test AI in whatever form your organization uses it. Each form is attacked through the way it actually receives input and the way it acts, so you get one consistent view of AI risk across your organization instead of a separate tool for each kind of system. See [What you can red team](./overview.md).

### Evidence-based evaluation

Every attempt is judged by evaluators: deterministic checks such as canary tokens, PII detectors, and tool-call audits, combined with a model-based judge. A finding is raised only when the evaluator can point to evidence in the transcript, which keeps false positives low.

### Framework mapping

Findings map to the OWASP Top 10 for LLM Applications (2025) and MITRE ATLAS so you can report against the frameworks your auditors already use.

### Retest and regression checks

After you fix a finding, Red Teaming retests the target to verify the fix. Scheduled assessments then keep checking that the fix holds.

## Who uses Quilr Red Teaming

| Role | Typical tasks |
| --- | --- |
| AI security engineer | Sets up assessments and schedules, and reviews findings. |
| Application or ML engineer | Runs assessments before release, and fixes prompts, retrieval, and tool permissions. |
| Security operations analyst | Receives high-severity findings in the SIEM or ticketing system and tracks remediation. |
| CISO and GRC | Reviews posture trends and exports framework-mapped reports for audits. |

## Next steps

- Read [How Quilr Red Teaming works](./how-it-works.md) for the architecture.
- Check [Requirements and permissions](./requirements.md).
- Pick a mode under [Configure and run](../configure-and-run/gateway-connected.md) and follow its step-by-step guide.
