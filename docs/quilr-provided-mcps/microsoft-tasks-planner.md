---
sidebar_position: 6
sidebar_custom_props:
  icon: ClipboardList
---

# Microsoft Tasks & Planner

<div className="mcp-product-hero compact"><span className="mcp-product-kicker">WORK MANAGEMENT</span><h2>Personal tasks and team plans, together.</h2><p>Ten focused tools across Microsoft To Do and Planner with no mail or file access.</p></div>

<McpDecision
  officialTitle="Build on Microsoft task APIs"
  official="Use the underlying To Do and Planner APIs directly when your application team needs a custom integration contract."
  officialPoints={['Direct API flexibility', 'Custom schema and policy ownership']}
  quilrTitle="Choose the least-privilege task surface"
  quilr="Use Quilr when an agent needs personal tasks and team plans together, but should have no access to mail, files, or Teams."
  quilrPoints={['Ten focused tools', 'Confirmed To Do deletion']}
  verdict="This is the default for task-only agents. Expand to Microsoft 365 v3 only when coordination across other workloads is essential."
/>

| Capability | To Do | Planner |
|---|:---:|:---:|
| List containers | ✅ Lists | ✅ Plans and buckets |
| List tasks | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| Update tasks | ✅ | ✅ |
| Delete tasks | ✅ Confirmed | - |
| Existing Microsoft permissions apply | ✅ | ✅ |

This is the least-privilege choice for task agents. Use [Microsoft 365 v3](./microsoft-365-v3) only when tasks must be coordinated with mail, calendars, files, or Teams.
