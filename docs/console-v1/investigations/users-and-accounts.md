---
sidebar_position: 2
sidebar_custom_props:
  icon: UserCog
description: "Distinguish people from application accounts and correlate identity, login context, and findings."
---

# Users and Accounts

Use the correct identity level when measuring exposure, investigating behavior, or scoping action.

**Navigation:** Users and Accounts are separate top-level sections in the left navigation.

**Configuration and options:** Users is identity-centered and aggregates departments, IDP state/groups, application reach, findings, sensitive interactions, data movement, and risk. Accounts is application-account/session centered and adds login method, account/app status, interactions, and account risk.

**Role-specific value:** Administrators use Users for identity scope and governance; Engineers pivot to Accounts to identify the exact application identity and session context involved.

**Verification:** A selected user can be connected to the relevant application-specific account and finding without treating the two records as interchangeable.

| Question | Use Users | Use Accounts |
| --- | --- | --- |
| What does the record represent? | A person/identity, often enriched by IDP and department context. | An observed application account or session context linked to a user and application. |
| Best investigation pivot | Who is affected across apps and departments? | Which login/account context generated the application activity? |
| Representative fields | Department, IDP groups/status, user risk, apps, findings, sensitive interactions, data movement. | User, application, source channel, login method, account/app status, interactions, findings, blocked/cleaned. |
| Example | A finance employee has findings across three apps. | The same employee used a personal account in one specific app. |

![Users view with trending risk, grouping, search, export, filters, actions, and identity fields.](/img/console-v1/users.png)

*Users view with trending risk, grouping, search, export, filters, actions, and identity fields.*

![Accounts view with account/application context.](/img/console-v1/accounts.png)

*Accounts view with account/application context.*

## Walkthrough and action

1. Start in Users when the alert begins with a person, department, or IDP group. Set the time range and filters, then review apps, findings, source channel, sensitive interaction, and data movement fields.

2. Open Accounts when the question is how that person authenticated to a specific application. Review application, account/app status, source channel, login method, interaction volume, and outcomes.

3. Pivot to the application and finding before deciding whether the issue is identity risk, an unapproved app/account, policy scope, or a one-time event.

4. Use Actions only after selecting the correct record; preserve the identity/account distinction in case notes.

**Expected result:** The investigation identifies both the responsible person and the precise application-account context.

**Verification:** The User and Account views agree on linked user/application and time window, while each contributes its distinct fields.

Continue with [Findings and Investigations](./findings) or the [end-to-end workflow](./end-to-end-workflow).
