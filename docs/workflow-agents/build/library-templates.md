---
sidebar_position: 2
sidebar_label: "Library templates"
sidebar_custom_props:
  icon: LibraryBig
description: "The Library tab: editable agent templates by category, what each one connects to and produces, and how to start an agent from one."
---

# Library templates

The **Library** tab has editable templates to start from instead of a blank agent. Every template is fully editable and none of them arrive connected to anything: you choose the model, the tools and the engine.

![Library tab with the template search, category filters and template cards showing what each one arrives as and what you connect](/img/workflow-agents/library.jpg)

Each card shows:

- **Arrives as**: **Model** (you choose), **Tools** (how many connections to make) and **Engine**.
- **You connect**: the kinds of tools the template expects.
- The result it produces.

Filter by category (**Research**, **Knowledge**, **Productivity**, **Support**, **Analytics**, **Engineering**, **Operations**, **Security**) or search by task or role.

## Templates

| Template | Category | You connect | Produces |
|----------|----------|-------------|----------|
| **Research Analyst** | Research | Search, Document retrieval | Executive brief with findings, comparison, sources and open questions |
| **Knowledge Assistant** | Knowledge | Knowledge search, Document retrieval | A direct answer with citations and suggested follow-up reading |
| **Meeting Prep** | Productivity | Calendar read, Account or document search | Meeting brief with context, agenda and outstanding actions |
| **Project Assistant** | Productivity | Project read, Issue read | Status summary, blockers and proposed task updates |
| **Support Triage** | Support | Ticket read, Knowledge search | Category, evidence, recommended next step and a draft reply |
| **Data Analyst** | Analytics | Bounded analytics read, Dataset metadata | Report with trends, supporting figures and data limitations |
| **Code Review Assistant** | Engineering | Repository read, Pull request read | Prioritized findings with file references and verification suggestions |
| **MCP Gateway Diagnostics** | Operations | Gateway Diagnostics MCP, Read-only gateway logs | What is happening, the evidence, the likely cause and what to check next |
| **Security Triage** | Security | Security evidence read, Ticket read | Evidence summary, impact assessment and proposed next actions |

## Start from a template

1. Select **Use** followed by the template name, for example **Use Support Triage**.
2. The [builder](./create-an-agent) opens pre-filled with the purpose, instructions, inputs and output.
3. Choose a model, connect the tools on the **Integrations** step and adjust anything else.
4. **Save draft** or **Save & publish agent**.
