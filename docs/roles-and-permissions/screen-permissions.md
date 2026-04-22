---
sidebar_position: 1
sidebar_label: Roles and Permissions (RBAC)
sidebar_custom_props:
  icon: ShieldCheck
---

# Roles and Permissions

### Note : Feature will be available soon.

Overview of user roles and their permissions across different screens and features in the QuilrAI platform.
## Role Definitions

**Super Admin**
Full access. Owns the tenant. Manages users, roles, permissions, tenant config, and subscriber data.

**Admin**
Day-to-day operations. Manages controls, integrations, gateways, extensions, endpoint agents, findings, compliance, and users. Cannot delete or purge any resource. Cannot modify roles, RBAC permissions, or tenant settings. No subscriber data access.

**Analyst**
Read-only plus export. Views findings, compliance reports, AI assets, policies, guardrails, red team results, and gateway data. No access to admin screens.

**Viewer**
Read-only across all screens. No changes.

---

## Settings

### Organizational Context

#### General

| Action                             | Super Admin | Admin | Analyst | Viewer |
|------------------------------------|:-----------:|:-----:|:-------:|:------:|
| View organization name and domains | ✓ | ✓ | - |   ✓    |
| Edit organization name             | ✓ | ✓ | - |   -    |
| Add / remove domains               | ✓ | ✓ | - |   -    |
| View unmanaged browser settings    | ✓ | ✓ | - |   ✓    |
| Change unmanaged browser settings  | ✓ | ✓ | - |   -    |
| Download mdm config                | ✓ | ✓ | - |   ✓    |

#### Organizational Policies

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View list of policies | ✓ | ✓ | ✓ | ✓ |
| Create a new policy | ✓ | ✓ | - | - |
| Edit a policy | ✓ | ✓ | - | - |
| Delete a policy | ✓ | - | - | - |

#### Smart Groups

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View list of smart groups | ✓ | ✓ | ✓ | ✓ |
| Create a smart group | ✓ | ✓ | - | - |
| Edit a smart group | ✓ | ✓ | - | - |
| Delete a smart group | ✓ | - | - | - |

#### Manage Users

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View user list (name, role, email, last login) | ✓ | ✓ | - | ✓ |
| Add / invite users | ✓ | ✓ | - | - |
| Delete users | ✓ | - | - | - |

---

### Browser Extension

#### Deployment Management *(tenant-wide)*

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View configuration | ✓ | ✓ | - | ✓ |
| Enable / disable extension for all users | ✓ | ✓ | - | - |
| Force update for all users | ✓ | ✓ | - | - |
| Change domain monitoring settings | ✓ | ✓ | - | - |
| Change persona creation settings | ✓ | ✓ | - | - |

#### Persona Creation Exclusion

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View persona creation exclusions | ✓ | ✓ | - | ✓ |
| Add a persona creation exclusion | ✓ | ✓ | - | - |
| Edit a persona creation exclusion | ✓ | ✓ | - | - |
| Delete a persona creation exclusion | ✓ | ✓ | - | - |

#### Deployment Status *(per user)*

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View user list (IDP status, device, browser, enrollment) | ✓ | ✓ | - | ✓ |
| Enable / disable extension for selected users | ✓ | ✓ | - | - |
| Force update for selected users | ✓ | ✓ | - | - |
| Export user list | ✓ | ✓ | ✓ | ✓ |


### AI Gateway

#### LLM Gateways

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View list of LLM gateways and details | ✓ | ✓ | ✓ | ✓ |
| View logs | ✓ | ✓ | ✓ | ✓ |
| Create a new gateway key | ✓ | ✓ | - | - |
| Expire (revoke) a key | ✓ | ✓ | - | - |
| Edit settings, routing, guardrails, prompts | ✓ | ✓ | - | - |
| Run red team tests | ✓ | ✓ | ✓ | ✓ |

#### MCP Gateways

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View list of MCPs and details | ✓ | ✓ | ✓ | ✓ |
| View logs and graph | ✓ | ✓ | ✓ | ✓ |
| Browse MCP Library | ✓ | ✓ | ✓ | ✓ |
| View Agents Configuration | ✓ | ✓ | ✓ | ✓ |
| View tools per MCP | ✓ | ✓ | ✓ | ✓ |
| Add a new MCP | ✓ | ✓ | - | - |
| Enable / disable an MCP | ✓ | ✓ | - | - |
| Edit settings and guardrails per MCP | ✓ | ✓ | - | - |

---

### User Interaction Hub

> Controls branding and content of user-facing prompts shown by the browser extension.

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View current configuration and preview | ✓ | ✓ | ✓ | ✓ |
| Customize logo (upload / reset) | ✓ | ✓ | - | - |
| Customize prompt content | ✓ | ✓ | - | - |
| Customize links | ✓ | ✓ | - | - |

---

### Compliance

#### Claude API Key

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View registered keys (masked) and status | ✓ | ✓ | ✓ | ✓ |
| Add / update API key | ✓ | ✓ | - | - |
| Revoke a key | ✓ | ✓ | - | - |

---

## Controls

### Controls List

> Tabs: All · AI Risks · Data Risks · Device Risks · IT Support · MFA Risks · Password Hygiene · SaaS Risks

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View list of controls (all tabs) | ✓ | ✓ | ✓ | ✓ |
| Search and filter controls | ✓ | ✓ | ✓ | ✓ |
| Add a new control | ✓ | ✓ | - | - |
| Enable / disable a control | ✓ | ✓ | - | - |
| Change control mode (Monitor / Action) | ✓ | ✓ | - | - |
| Delete / purge a control | ✓ | - | - | - |

### Edit Control

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View control details | ✓ | ✓ | ✓ | ✓ |
| Edit name, description, criticality | ✓ | ✓ | - | - |
| Change mode (Monitor / Action) and channels | ✓ | ✓ | - | - |
| Select / change scenario | ✓ | ✓ | - | - |
| Configure additional conditions (AND / OR logic) | ✓ | ✓ | - | - |
| Configure perform action | ✓ | ✓ | - | - |
| Save changes | ✓ | ✓ | - | - |

---

## Users

### Users List

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View summary stats (total users, AI users, departments, violations) | ✓ | ✓ | ✓ | ✓ |
| View top trending users | ✓ | ✓ | ✓ | ✓ |
| View user list (name, department, IDP group, risk, apps) | ✓ | ✓ | ✓ | ✓ |
| Search and filter users | ✓ | ✓ | ✓ | ✓ |
| Click through to user profile | ✓ | ✓ | ✓ | ✓ |
| Actions: Create Smart Group | ✓ | ✓ | - | - |
| Actions: Add Users to Smart Group | ✓ | ✓ | - | - |
| Actions: Delete Users from Smart Group | ✓ | - | - | - |
| Actions: Preview Smart Group | ✓ | ✓ | ✓ | ✓ |
| Actions: Activate Agent (With Findings) | ✓ | ✓ | - | - |
| Actions: Activate Agent (Without Findings) | ✓ | ✓ | - | - |
| Actions: User-App Approvals | ✓ | ✓ | - | - |

---

## Integrations

### Connected / Available / MCP Gateway

> Tabs: Connected · Available · MCP Gateway

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View connected integrations (name, version, status) | ✓ | ✓ | - | ✓ |
| Filter by vendor, category, status | ✓ | ✓ | - | ✓ |
| Search integrations | ✓ | ✓ | - | ✓ |
| Browse available integrations | ✓ | ✓ | - | ✓ |
| Browse MCP Gateway integrations | ✓ | ✓ | - | ✓ |
| Edit an integration (pencil icon) | ✓ | ✓ | - | - |
| Enable / disable an integration (tick icon) | ✓ | ✓ | - | - |
| Delete an integration (block icon) | ✓ | - | - | - |
| Configure alerts (bell icon) | ✓ | ✓ | - | - |
| Bulk actions | ✓ | ✓ | - | - |
| Add a new integration | ✓ | ✓ | - | - |

---

## Detection Models

> Tabs: AI Adversarial Risks · Data Risks · Insider Risks

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View detection models (all tabs) | ✓ | ✓ | ✓ | ✓ |
| Search and filter models | ✓ | ✓ | ✓ | ✓ |
| Enable / disable a detection model | ✓ | ✓ | - | - |
| Add a new detection model | ✓ | ✓ | - | - |
| Delete a detection model | ✓ | - | - | - |

---

## Browser Extensions

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View extension list (name, version, install count) | ✓ | ✓ | - | ✓ |
| View summary stats (total, by browser, enabled/disabled) | ✓ | ✓ | - | ✓ |
| Search and filter extensions | ✓ | ✓ | - | ✓ |
| Click through to extension details | ✓ | ✓ | - | ✓ |
| Actions: Enable Extension | ✓ | ✓ | - | - |
| Actions: Disable Extension | ✓ | ✓ | - | - |
| Actions: Remove Extension | ✓ | - | - | - |

---

## Accounts

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View summary stats (total accounts, interactions, sensitive, blocked) | ✓ | ✓ | ✓ | ✓ |
| View top trending accounts | ✓ | ✓ | ✓ | ✓ |
| View account list (account, user, app, browser, endpoint, status) | ✓ | ✓ | ✓ | ✓ |
| Search and filter accounts | ✓ | ✓ | ✓ | ✓ |
| Click through to account details | ✓ | ✓ | ✓ | ✓ |
| Actions: Activate Agent | ✓ | ✓ | - | - |

---

## Applications

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View summary stats (total apps, AI apps, critical, unapproved) | ✓ | ✓ | ✓ | ✓ |
| View top trending apps | ✓ | ✓ | ✓ | ✓ |
| View app list (name, type, category, owner) | ✓ | ✓ | ✓ | ✓ |
| Search and filter (All / AI toggle) | ✓ | ✓ | ✓ | ✓ |
| Click through to app details | ✓ | ✓ | ✓ | ✓ |
| Actions: Approve Applications | ✓ | ✓ | - | - |
| Actions: Unapprove Applications | ✓ | ✓ | - | - |
| Actions: Block Applications | ✓ | ✓ | - | - |
| Actions: Unblock Applications | ✓ | ✓ | - | - |
| Actions: Activate Agent | ✓ | ✓ | - | - |
| Edit: App Category | ✓ | ✓ | - | - |
| Edit: App Type | ✓ | ✓ | - | - |
| Edit: License | ✓ | ✓ | - | - |
| Edit: Block | ✓ | ✓ | - | - |
| Edit: Unblock | ✓ | ✓ | - | - |
| Edit: Approval | ✓ | ✓ | - | - |
| Edit: Criticality | ✓ | ✓ | - | - |

---

## Findings

> Tabs: Finding Insights · All Findings · Browser Extension Findings · Endpoint Agent Findings · AI Gateway Findings · MCP Gateway Findings
>
> Sub-tabs: All · AI Risks · Data Risks · MFA Risks · Password Hygiene

| Action | Super Admin | Admin | Analyst | Viewer |
|--------|:-----------:|:-----:|:-------:|:------:|
| View findings list (all tabs and sub-tabs) | ✓ | ✓ | ✓ | ✓ |
| View finding details (ID, channel, source, user, app, control, outcome) | ✓ | ✓ | ✓ | ✓ |
| Search findings | ✓ | ✓ | ✓ | ✓ |
| Filter findings (type, criticality, channel, source, app, smart group, etc.) | ✓ | ✓ | ✓ | ✓ |
| Select All / Global Actions | ✓ | ✓ | - | - |
| View sensitive data in prompts and AI conversations | ✓ | ✓ | - | - |
| Approve / unapprove credential sharing | ✓ | ✓ | - | - |
| Approve / unapprove weak password | ✓ | ✓ | - | - |
| Approve / unapprove compromised password | ✓ | ✓ | - | - |
| Approve / unapprove password reuse | ✓ | ✓ | - | - |
| Export findings | ✓ | ✓ | ✓ | ✓ |
