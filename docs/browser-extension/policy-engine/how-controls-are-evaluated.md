---
sidebar_position: 4
sidebar_label: "How controls are evaluated"
sidebar_custom_props:
  icon: Scale
description: "How the Browser Extension checks controls when a user visits a site, signs in, submits a prompt, posts into a chatbot, copies, pastes or uploads, which control wins when several match, and what happens on timeouts, offline and after a change."
console_path: []
aliases: [control precedence, which control wins, control priority, control ranking, criticality tie-break, monitor versus enforce, system controls on by default, prompt frequency, browser control timeout, extension offline, control sync time]
---

# How controls are evaluated

Updated on 10 November 2026.

This page explains how the Browser Extension picks the one control that applies to a user's action in the browser, and what changes the result. You manage controls under **Govern > Policy Engine > Endpoint Agent > Browser**; see [Browser controls](./browser-controls).

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

## Key terms

| Term | Meaning |
|---|---|
| **Control** | One browser rule: the activity to watch for, conditions, a mode and actions. |
| **System control** | A control that QuilrAI supplies, tagged **System**. Controls that admins create are **Custom**. |
| **Use case** | The activity a control watches for, such as **A user is pasting sensitive data**. It sets the mandatory conditions and the risk behavior. |
| **Risk behavior** | The kind of risky activity a use case belongs to, such as **Users Pasting Data**. Each has a fixed rank. See the [Use case reference](./conditions-and-actions#use-case-reference). |
| **Criticality** | **Very High** to **Very Low**. It breaks ties between controls of the same rank. |
| **Mode** | **Monitor** records a match without interrupting the user. **Enforce** applies the control's Just in Time action. |
| **Just in Time action** | The only action type that runs in the browser as the user acts, such as a block, a Justify popup or a Prompt notice. Other action types run on the QuilrAI backend. See [What users see](./conditions-and-actions#what-users-see). |
| **Browser Utility** | A desktop program installed with the extension on Windows and macOS, also called the Browser Agent. It supplies the content of copied text and uploaded files. |

## How the extension decides, step by step

1. **Download the controls.** At startup and every 2 minutes, the extension downloads every enabled System and Custom control.
2. **Detect the action.** It checks only controls whose use case covers that kind of action, so a paste control is not checked when the user submits a prompt. A post into a website chatbot can also match **Users Leaking Sensitive Data** controls. See [Which control wins when several match](#which-control-wins-when-several-match).
3. **Check the conditions.** A control matches when all of its conditions are true. QuilrAI checks content for sensitive data using your [Detection Models](../../console/govern/detection-models).
4. **Remove excused controls.** It drops controls excused for this app or person, for example by a turned-off detection or an approved action request, and controls whose popup has reached its prompt frequency limit.
5. **Pick one winner.** It ranks the rest by risk behavior, then by criticality, and applies only the first.
6. **Apply the winner.**
   - **Monitor**: the action goes ahead and a finding is recorded.
   - **Enforce**: the Just in Time action applies, unless the user already gave a reason or acknowledged a notice for the same risk behavior in that tab and site. See [What changes the outcome for an app or a person](#what-changes-the-outcome-for-an-app-or-a-person).
   - **Enforce** without a Just in Time action: the user is not interrupted. Chromium-based browsers and Firefox record a finding, and Safari records nothing.

The finding in [Findings & Interactions](../../console/observe/findings-and-interactions) names the winning control.

## How conditions are checked

Inside a group, rows combine from top to bottom, and **AND** does not take precedence over **OR**. See [How conditions combine](./conditions-and-actions#how-conditions-combine).

:::warning Join top-level condition cards with AND
Every browser ignores a control whose top-level condition cards are joined with **OR**, although the console saves it and shows it as enabled. Put the alternatives inside one group card. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

## Which control wins when several match

The extension ranks matching controls in two steps:

1. **Risk behavior rank.** It is fixed, and you cannot change it. Rank 1 is the highest.
2. **Criticality.** Within the same rank, the higher criticality wins: **Very High**, **High**, **Moderate**, **Low**, **Very Low**.

If two controls tie on both, the winner is not defined. Give overlapping controls different criticality values.

| When the user... | Risk behaviors checked, by rank |
|---|---|
| Opens a page | 1 **Blocked AI Applications**; 2 **Blocked SaaS Applications**; 3 **Unapproved AI Applications Used**, **Visiting SaaS app**, **Newly Introduced AI Apps** and **Newly Introduced AI Users** |
| Signs in or signs up | 1 **SignIn and SignUp to Applications**; 2 **Unapproved AI Applications Used**; 3 **Credential Sharing**; 4 **Password Reuse**; 5 **Compromised Password**; 6 **Weak Password** |
| Posts into a website chatbot | 1 **Users Posting Data to a Chatbot**; 2 **Users Leaking Sensitive Data**, when the post is checked for sensitive data |
| Submits a prompt | **Users Posting Data** or **Users Leaking Sensitive Data**, never both (see below) |
| Copies, pastes or uploads | One risk behavior each (**Users Copying Data**, **Users Pasting Data**, **Users Uploading Data**), so criticality alone decides |

To find the risk behavior of a use case, see the [Use case reference](./conditions-and-actions#use-case-reference).

For a prompt:

- If a **Users Posting Data** control applies to the user on that app, the extension applies it, even in **Monitor**, without checking for sensitive data. **Users Leaking Sensitive Data** controls do not run there.
- Otherwise, the extension checks the prompt for sensitive data, and criticality decides between the matching **Users Leaking Sensitive Data** controls.

Do not use both risk behaviors for the same people and apps.

### A Monitor control can silence an Enforce control

:::warning
The extension picks the winner before it looks at the mode. If the winner is in **Monitor**, the action goes ahead and is only recorded, even when a lower-ranked **Enforce** control would have blocked it. To make sure an Enforce control applies:

- Give it a higher criticality than every Monitor control of the same rank that matches the same action.
- Narrow or turn off any higher-ranked Monitor control that matches the same action. Criticality cannot overcome rank.
:::

### System controls compete too

System controls are ranked like Custom controls. Ten are on by default, all in **Monitor**. Most match only on Generative AI apps.

| Control | Risk behavior | Criticality |
|---|---|---|
| **Preventing The Leakage Of Sensitive Data Via An AI App** | **Users Leaking Sensitive Data** | **Moderate** |
| **Tracking Usage Of An Unapproved AI App** | **Unapproved AI Applications Used** | **Moderate** |
| **Discovering New AI App** | **Newly Introduced AI Apps** | **Low** |
| **Discovering a new AI user** | **Newly Introduced AI Users** | **Low** |
| **User is copying sensitive data** | **Users Copying Data** | **Low** |
| **User is pasting sensitive data** | **Users Pasting Data** | **Low** |
| **copy-paste data from one app to another** | **Users Pasting Data** | **Low** |
| **User is trying to upload sensitive data** | **Users Uploading Data** | **Low** |
| **Logging into SaaS applications using shared credentials of another non admin user** | **Credential Sharing** | **Low** |
| **Logging into SaaS applications using credentials of another admin user** | **Credential Sharing** | **Very Low** |

For example, a Custom **Enforce** control on the same use case as **Preventing The Leakage Of Sensitive Data Via An AI App** needs **High** or **Very High** to win. At **Moderate** the winner is not defined. Below that, the System control wins and users see no popup.

Against a higher-ranked System control, criticality cannot help: narrow or turn off the System control. **Tracking Usage Of An Unapproved AI App** matches sign-ins and sign-ups (not visits) on unapproved AI apps, so it outranks every password and shared-credential control there. Filter the controls list by **Type** to see System controls.

Apps you mark **Blocked** in [Inventory](../../console/observe/inventory) are blocked by built-in controls that are hidden from the controls list. They run in every browser at **Low** criticality and record each visit. Do not add your own control on **AI application blocked by organisation** or **SaaS application blocked by organisation**. It cannot block, because these use cases have no Just in Time action. Above **Low**, it outranks the built-in block and unblocks the users it matches.

## What changes the outcome for an app or a person

Most of these settings remove controls before ranking (step 4), so a lower-ranked control can win instead. A reason or acknowledgement given on a popup applies after ranking, to the winner only (step 6).

| Setting | Where you set it | Effect |
|---|---|---|
| A [detection turned off](./app-posture-and-access#turn-off-a-detection-for-one-app) for an app | **Inventory** > app > **Controls & configuration** > **Detection behaviors** | Removes every control of that risk behavior on the app, for every user. |
| An approved [action request](../../console/govern/action-requests) | **Govern > Action Requests** | Removes every control for that action (for example **Upload**), including its content checks, for one person on one app. |
| A reason given on a Justify popup, or a Prompt notice acknowledged | In the browser | Skips the popup once, the next time the same risk behavior wins in that tab and site. For password and shared-credential controls, the pass lasts until the tab closes, for the same account and password. It does not apply to **Users Copying Data**, **Users Uploading Data** or **Users Posting Data** controls, or to a reason given in the [sensitive data window](./conditions-and-actions#sensitive-data-window). |
| Site on the [allowed domains list](../configure/allowed-domains-and-patterns) | **Settings > Browser Extension > Whitelist Domain & Pattern** | The extension does not run on the site, for any user. |

## How prompt frequency affects the result

**Prompt frequency**, a setting on some Prompt and Justify actions, limits how often the popup appears. For its options, see [Conditions and actions](./conditions-and-actions#prompt-frequency). The extension:

- Applies it only to controls on page visits and sign-ins. For other actions, the popup appears every time the control wins.
- Keeps the count per app. Controls with the same risk behavior share one count on that app.
- Counts separately in each browser and each installation.
- Removes a hidden control before ranking (step 4), so a lower-ranked control can win instead.

## When nothing matches

If no control matches, or step 4 removed every match, the action goes ahead. The user sees nothing, and no finding names a control. If you expected a control to apply, check that:

- It is enabled, was saved more than 2 minutes ago, and joins its top-level condition cards with **AND**.
- No Monitor control (System controls included) or **Users Posting Data** control takes precedence over it.
- Step 4 did not remove it (a turned-off detection, an approved action request or prompt frequency), and the site is not on **Whitelist Domain & Pattern**.
- An earlier reason or acknowledgement in that tab did not skip the popup.
- The extension is on for the user and has linked the browser to that user. See [Extension settings](../configure/extension-settings).
- For copied text and file content, the Browser Utility is running on the device. See [Content checks need the Browser Utility](./limits-and-browser-differences#content-checks-need-the-browser-utility).

## Notes and limits

- **Timeouts and offline.** If a content check is slow or QuilrAI cannot be reached, the action goes ahead and the content is treated as not sensitive. If the extension cannot download controls, it keeps its last controls. See [When a check takes too long](./limits-and-browser-differences#when-a-check-takes-too-long) and [When a browser cannot reach QuilrAI](./limits-and-browser-differences#when-a-browser-cannot-reach-quilrai).
- **Sign-up forms.** While the user types a password on a sign-up form, the extension checks only **Unapproved AI Applications Used**, **Password Reuse**, **Compromised Password** and **Weak Password** controls, and an **Enforce** winner shows only a notice. Its own action applies when the user submits the form.
- **Change timing.** A save takes effect in QuilrAI at once. There are no drafts or versions. Browsers pick up a control change within about 2 minutes, and an app setting or action request decision usually within about 5 minutes. See [How long changes take](./limits-and-browser-differences#how-long-changes-take).
- **The save check is not a ranking.** When you save, the console refuses a control whose conditions are equivalent to another control's in the same use case, including System and turned-off controls. This check ignores rank, mode and criticality. See [Resolve a conflict](./browser-controls#resolve-a-conflict).

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [Conditions and actions](./conditions-and-actions)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
- [Findings & Interactions](../../console/observe/findings-and-interactions)
- [Detection Models](../../console/govern/detection-models)
- [How Endpoint Agent policies are evaluated](../../endpoint-agent/policy-engine/how-policies-are-evaluated): the Endpoint Agent uses a different model.
