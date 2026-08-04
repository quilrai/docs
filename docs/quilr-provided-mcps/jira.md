---
sidebar_position: 8
sidebar_custom_props:
  icon: Clipboard
---

# Jira

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">ISSUE WORKFLOWS</span><h2>A compact Jira surface agents can reason about.</h2><p>Ten predictable OAuth-backed tools for projects, issues, search, assignments, transitions, and comments.</p></div>

<McpDecision
  officialTitle="Choose Rovo for Atlassian-wide work"
  official="Use Atlassian Rovo when agents need one first-party context layer across Jira, Confluence, JSM, Compass, and Bitbucket."
  officialPoints={['Cross-product context', 'Broader first-party workflows']}
  quilrTitle="Choose a Jira-only boundary"
  quilr="Use Quilr when the job is intentionally limited to projects, issues, search, assignments, transitions, and comments."
  quilrPoints={['Ten predictable tools', 'Independent gateway controls']}
  verdict="Breadth favors Rovo. Simplicity, least privilege, and a stable Jira-only schema favor Quilr."
/>

| Workflow | Tools | Risk |
|---|---|---|
| Identity and projects | `get_myself`, `list_projects` | Read |
| Issue retrieval and search | `get_issue`, `search_issues`, `list_transitions` | Read |
| Issue creation and ownership | `create_issue`, `assign_issue` | Write |
| Workflow progress | `transition_issue` | Write |
| Collaboration | `add_comment` | Write |

Atlassian's Rovo MCP is broader across Jira, Confluence, JSM, Compass, and Bitbucket. Choose Quilr Jira when the agent should receive a small Jira-only surface with independent gateway controls.
