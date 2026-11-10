---
sidebar_position: 3
sidebar_label: "Conditions and actions"
sidebar_custom_props:
  icon: GitBranch
description: "What a browser control watches for, the condition attributes and operators you use, how conditions combine, each action and what users see, Monitor and Enforce, criticality, and System controls."
console_path: []
aliases: [browser conditions, browser actions, use case, use cases, when this happens, mandatory conditions, additional conditions, condition group, perform action, just in time, prompt frequency, request approval, send alert to syslog, activate agent, monitor mode, enforce mode, criticality, system controls, custom controls]
---

# Conditions and actions

Updated on 10 November 2026.

A browser control tells the Browser Extension what to watch for and what to do when it happens. This page explains each part of a control: the use case, the conditions, the actions and what users see, the mode, the criticality, and the difference between System and Custom controls. For the controls list and the steps to add and edit a control, see [Browser controls](./browser-controls).

You set these parts in the control form under **Govern > Policy Engine > Endpoint Agent > Browser**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

## Key terms

Each term below is one part of a control.

| Term | Section of the form | What it decides |
|---|---|---|
| **Use case** | **When this happens** | The activity the control watches for, for example "A user is uploading sensitive data". It also sets the posture, the risk behavior and the mandatory conditions. |
| **Mandatory conditions** | **Mandatory conditions** | The conditions that come with the use case. |
| **Additional conditions** | **Additional conditions** | The conditions you add to narrow the control, for example to one Smart Group or one app. |
| **Actions** | **Perform action** | What happens when the control matches, for example a popup that blocks the upload. |
| **Mode** | **Control details** | **Monitor** records a match without interrupting the user. **Enforce** also runs the **Just in Time** and **Activate Agent** actions. |
| **Criticality** | **Control details** | How serious a match is, from **Very Low** to **Very High**. It breaks ties between matching controls whose risk behaviors have the same rank. |

Read together, the parts form one sentence. For example: when a user uploads sensitive data to a Generative AI app, and the user is not in the Finance Smart Group, block the upload.

Browser controls have no draft or publish step. A saved change applies at once, and browsers pick it up within about 2 minutes.

A control runs only when it is turned on, with **Enabled** in **Control details** or the **Status** toggle in the controls list. New and duplicated controls start turned off.

## Choose what the control watches for

A use case is a ready-made situation from the QuilrAI catalog. You choose one in **When this happens** when you create a control. See [Choose the use case](./browser-controls#choose-the-use-case).

The selected use case shows its posture and its risk behavior:

- **Posture** is the risk area, for example **Data Risks** or **AI Risks**.
- **Risk behavior** is the kind of activity, for example **Users Uploading Data**.

The use case also adds its mandatory conditions, and it decides which condition attributes and actions you can choose.

Keep these rules in mind:

- **The use case is fixed once the control exists.** To use another use case, duplicate the control and choose a new one in the copy.
- **Some use cases need an additional condition before you can save.** The console shows: "Add more conditions to this control to prevent business disruption." This applies to use cases that would otherwise act on every copy, paste, upload, visit or password reuse, such as **A user is uploading data**.
- **Some copy and paste use cases do not cover spreadsheets.** The console warns: "Copy and paste controls do not currently support Excel, Google Sheets, or other spreadsheets."
- **Do not create controls on the two blocked application use cases.** A control on **AI application blocked by organisation** or **SaaS application blocked by organisation** can stop blocked apps from being blocked. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).

For each use case and the conditions it adds, see the [Use case reference](#use-case-reference).

## Narrow the control with conditions {#conditions}

A condition is one test on one fact, for example **Smart Group** **is not in** Finance. A control matches only when its conditions hold.

### Conditions that come with the use case {#mandatory-conditions}

Mandatory conditions come from the use case and carry the **Required** tag. You cannot remove them. Most are locked. A few let you choose the value, for example the label in **A user is uploading a labeled document**.

### Additional conditions

Additional conditions narrow the control: it applies only where they also hold. The section reads "This control applies only where these also hold." For the steps to add one, see [Conditions](./browser-controls#conditions).

Each attribute can appear only once in a control's additional conditions, so an attribute you already used is not offered again. **URL** is the exception and can appear more than once.

### How conditions combine

- Mandatory conditions are joined with AND.
- Your first additional condition is joined to them with AND. It starts with the word **And**.
- Each later condition card starts with an **AND** / **OR** menu.
- **Add condition to group** adds a row inside a card and turns the card into a **Group condition**. Rows inside a group have their own **AND** / **OR** menu. A group cannot contain another group.
- Inside a group, rows are read from top to bottom. "A OR B AND C" means "(A OR B) AND C". Use one kind of join per group to keep the meaning clear.

:::warning Use OR only inside a group
Every browser ignores a control whose top-level condition cards are joined with **OR**, so that control never matches. To match either of two conditions, put both in one group and set the menu on the group's second row to **OR**. To match any of several values of one attribute, use **is in** instead of OR. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

For example, to limit **A user is pasting from clipboard** to Generative AI or unapproved apps, and only for contractors:

1. Select **Add condition** and set **Category** **is equal to** Generative AI.
2. On that card, select **Add condition to group**, set **Status** **is equal to** Unapproved, and set the new row's **AND** / **OR** menu to **OR**.
3. Select **Add condition** again and set **Smart Group** **is in** Contractors. Leave this card's **AND** / **OR** menu at **AND**.

The control now reads: the use case's mandatory conditions, AND (Category is Generative AI OR Status is Unapproved), AND Smart Group is in Contractors.

### Which operators you can use {#operators}

The **Operator** menu shows only the operators that fit the chosen attribute.

| Operator | The condition holds when |
|---|---|
| **is equal to** | The value matches the one you enter. Letter case is ignored. |
| **is not equal to** | The value does not match the one you enter, or the value is unknown. |
| **is in** | The value is one of the values you select. For attributes that hold several values, such as **Smart Group**, at least one of them is in your selection. |
| **is not in** | None of the values is in your selection. A user who belongs to no Smart Group always matches **Smart Group** **is not in**. |
| **contains** | The text includes what you enter. Letter case is ignored. |
| **not contains** | The text does not include what you enter. |
| **is greater than**, **is less than** | The number is above or below the value, for example for **File Size in bytes.** |
| **is less than equal to** | The number is at or below the value, for example for **Password strength**. |

For attributes that have only two values, such as **Authentication Type** (**Login** or **Sign Up**) or an attribute you answer with **Yes** or **No**, use **is equal to** or **is not equal to**.

### How to enter a value {#values}

How you enter a value depends on the attribute.

| The attribute has | You |
|---|---|
| Values from your organization, such as Smart Groups or departments | Search and select. The list shows the first values; type to narrow it. |
| A fixed list, such as app **Status** | Select from the list. |
| A yes or no answer | Select **Yes** or **No**. |
| No preset values | Type each value and press Enter. |
| A number | Type the number. |

With **is in** and **is not in**, you can select several values.

### What each attribute tests {#condition-attributes}

The attribute types and attributes you can choose depend on the use case.

#### User

The person signed in to the Browser Extension.

| Attribute | Meaning |
|---|---|
| **Department** | The user's department. |
| **Smart Group** | The user's [Smart Groups](../../console/settings-organization/smart-groups). |
| **Status** | Whether the user's account is **Active** or **Inactive**. |
| **Risk Level** | The user's risk level, from **Very High** to **Very Low**. |
| **Title** | The user's job title. |
| **Location** | The user's office location. |
| **Has account on any AI app** | **Yes** when the user has an account on an AI app. |
| **DisplayName** | The user's display name. |

#### Application

The app on the current page. You set an app's approval status, criticality and blocking in its posture settings. See [App posture and access requests](./app-posture-and-access).

| Attribute | Meaning |
|---|---|
| **Category** | The app's category, for example Generative AI. |
| **Name** | The app's name. |
| **Domain** | The app's domain. |
| **URL** | The address of the page. |
| **Status** | The app's approval status: **Needs Review**, **Approved**, **Tolerated** or **Unapproved**. |
| **Criticality** | **Critical**, **Not Critical** or **Not Set**. |
| **Block status** | Whether your organization blocked the app. |
| **Is newly introduced** | **Yes** when the app is new in your organization. |
| **IdP status** | **Yes** when the app is an identity provider used for single sign-on. |
| **Multi-Factor Authentication (MFA) support** | Whether the app supports MFA. An app with no known value counts as **Yes**. |
| **Headquarters** | Where the app's vendor is based. |
| **AI Mode** | **Yes** on Google AI Mode pages. Offered for **A user is visiting an application**. |
| **Chatbot** | **Yes** when the user posts into a chatbot on the page. Offered for the chatbot use cases. |
| **Login User Domain** | In **A user signing in and signing up to an application**, the domain of the email address the user types into the sign-in or sign-up form. |

#### Browser

The activity itself.

| Attribute | Meaning |
|---|---|
| **User Action** | What the user is doing, for example **Copy**, **Paste**, **Visit** or **Post**. The values offered depend on the use case. |
| **Authentication Type** | **Login** or **Sign Up**. |

#### Data

What QuilrAI found in the content.

| Attribute | Meaning |
|---|---|
| **Sensitive** | **Yes** when QuilrAI finds sensitive data. |
| **Model** | The [detection models](../../console/govern/detection-models) that found data. |

#### Upload

The file the user is uploading.

| Attribute | Meaning |
|---|---|
| **File Size in bytes.** | The size of the file in bytes. |
| **File Extension** | The file type, for example `pdf`. Files inside an archive are checked too. |
| **Label Name** | The sensitivity label on the file. |
| **Classification Labels** | The classification labels on the file. |
| **Encrypted** | **Yes** when the file is password-protected. |

#### Source Application

The other app in the activity. What it means depends on the use case.

In the paste use cases and in **A user is copying sensitive data**, **Source Application** is the app the data was copied from. Most of these attributes describe a browser tab. When the data was copied from a desktop application, use **Copied From Process** instead.

| Attribute | Meaning |
|---|---|
| **Category** | The source app's category, for example Generative AI. |
| **Name** | The source app's name. Offered only for **A user is copy-pasting data from one app to another**, **A user is copying sensitive data** and **A user is pasting sensitive data**. |
| **Domain** | The source app's domain. |
| **Status** | The source app's approval status. |
| **Criticality** | The source app's criticality. |
| **IdP status** | **Yes** when the source app is an identity provider. |
| **Is newly introduced** | **Yes** when the source app is new in your organization. |
| **Multi-Factor Authentication (MFA) support** | Whether the source app supports MFA. |
| **Sensitive Data** | **Yes** when the copied data is sensitive. |
| **Copied From Process** | The name of the desktop application the data was copied from. |

In the password reuse use cases, **Source Application** is the app whose password is being reused. You can test its **IdP status** and **Criticality**.

#### Account Owner

Offered for **A user is using shared credentials**. It describes the directory record of the account the user signs in with, not the user: **Department**, **Smart Group**, **Status**, **Risk Level** and **Title**. For example, **Smart Group** **is in** Admins finds sign-ins with an administrator's credentials.

:::note Content checks need the Browser Utility
For copy, paste and upload activity, the extension gets the content from the Browser Utility, a small desktop program installed with the extension. The deployment guides call it the Browser Agent. Without the Browser Utility, QuilrAI cannot check content conditions such as **Sensitive**, **Model**, **Label Name**, **Encrypted** or **Copied From Process**. See [Content checks need the Browser Utility](./limits-and-browser-differences#content-checks-need-the-browser-utility).
:::

## Choose what happens when the control matches {#actions}

Actions decide what happens when the control matches. You add them in the **Perform action** section.

### Which action types you can use {#action-types}

| **Action type** | Where it runs | What it does |
|---|---|---|
| **Just in Time** | In the user's browser, at the moment of the activity | Shows a popup or redacts data. Some popups stop or hold the activity; a Prompt popup lets it continue. |
| **Remediation Action** | On the QuilrAI backend, after the activity is recorded | Sends an alert about the activity to Microsoft Sentinel. |
| **Activate Agent** | On the QuilrAI backend, after the activity is recorded | Starts a Quilly agent (Quilly is QuilrAI's AI coach for end users) that follows up with the user in Slack or Microsoft Teams. |

Rules for actions:

- A control can have one **Just in Time** action. You can add other action types next to it.
- The use case decides which action types and actions are offered. For example, **AI application blocked by organisation** and **SaaS application blocked by organisation** offer no **Just in Time** action.
- When several controls match the same activity, the extension acts on only one of them. See [Which control wins when several match](./how-controls-are-evaluated#which-control-wins-when-several-match).
- A control with no **Just in Time** action never shows a popup. If the extension acts on it, the other matching controls do not show their popups either. To only record activity, set **Mode** to **Monitor**, which records the same way in every browser. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).
- **Just in Time** and **Activate Agent** actions run only when the control is in **Enforce**. See [Choose Monitor or Enforce](#monitor-and-enforce).

For the steps to add or remove an action, see [Actions](./browser-controls#actions).

### What users see

The first word of a **Just in Time** action's name tells you what the user sees.

| Action name starts with | What the user sees | What happens to the activity |
|---|---|---|
| Prompt | A small card with a message and a button such as **Acknowledge**. | The activity goes ahead. The card stays until the user selects a button or closes it. |
| Justify or Justification | A dialog that asks for a business reason. The user picks a reason or types one (20 to 140 characters), then selects **Submit**. | **Submit** lets the activity go ahead. Closing the dialog blocks the activity. |
| Block | A dialog that explains the block. | The activity is stopped. A block on visiting an app also stops and freezes the page. Other blocks leave the page running and show **Go Back**. |
| Allow | The sensitive data window. See [What the sensitive data window shows](#sensitive-data-window). | The user reviews the prompt before it is sent. |
| Redact | A notice: **Sensitive Data Redacted**. | Each detected value in the prompt is replaced with X characters, and the prompt is sent. |

Users see none of these popups while the control is in **Monitor**.

#### Request approval from a Block dialog

By default, every Block dialog shows **Request Approval**. The user explains why they need access, and an admin approves or rejects the request in [Action requests](../../console/govern/action-requests). The browser does not tell the user when a request is approved. For the full flow, see [Let people request access](./app-posture-and-access#let-people-request-access).

#### What the sensitive data window shows {#sensitive-data-window}

Actions whose names start with "Allow" show this window when a user sends a prompt that contains sensitive data. The window lists **Data types detected**, highlights the detected values (**Highlight Sensitive Data**) and shows an editable copy of the prompt. The user selects **Continue with Original**, or **Continue with Updated** after editing.

| Action | What the user must do before the prompt is sent |
|---|---|
| **Allow original prompt with no justification** | Nothing more. |
| **Allow original prompt with optional justification** | Optionally give a reason, then select **Submit**. |
| **Allow original prompt with mandatory justification** | Pick or write a reason, then select **Submit**. |
| **Allow prompt after removal of sensitive data** | Remove the sensitive data and select **Resubmit and Continue**. QuilrAI scans the prompt again. When it is clean, the user selects **Continue** to send it. |

If the user closes the window, the prompt is not sent.

#### Change popup wording {#popup-wording}

The header and body of Prompt, Justify, Block and sensitive data popups come from message templates. So do the buttons of Prompt and Justify popups and the reasons a Justify popup offers. Each **Just in Time** action is linked to a template, and some actions share one template. To change the wording, add your logo or link your policies, use [User Interaction Hub](../../console/settings-sensors/user-interaction-hub). A template change applies to every action and control that uses that template.

### Limit how often a popup appears {#prompt-frequency}

Some Prompt and Justify actions show a **Prompt frequency** section. It limits how often the popup appears. When you choose one of these actions, **Frequency** starts at **First occurrence**. Change it if users should see the popup more than once.

| **Frequency** | The popup shows |
|---|---|
| **First occurrence** | Only the first time. |
| **Every occurrence** | Again each time the **Self-resolution period** has passed since it last showed. |
| **Number of occurrences** | A set number of times, based on **Occurrence count** (1 to 10), with the **Self-resolution period** between showings. |

**Self-resolution period** can be **24 hours**, **7 days** or **30 days**.

:::note Prompt frequency applies to visits and sign-ins only
The extension applies prompt frequency only to controls on visiting an app or signing in. For other activity, such as copy, paste, upload and prompts, the popup shows every time. For how the count is kept, see [How prompt frequency affects the result](./how-controls-are-evaluated#how-prompt-frequency-affects-the-result).
:::

### Send an alert to Microsoft Sentinel {#remediation-action}

The remediation action is **Send Alert to Syslog**. It sends an alert for the control's matching activity, as a syslog record, to [Microsoft Sentinel](../../integrations/send-logs-and-alerts/microsoft-sentinel) installations that have the **Alerts & notifications** capability. Despite its name, it does not send to the [Syslog](../../integrations/send-logs-and-alerts/syslog) integration.

### Start a Quilly follow-up {#activate-agent}

**Activate Agent** starts a Quilly agent. After the activity is recorded, the agent messages the user in your organization's chat tool, Slack or Microsoft Teams.

Before you start, make sure your organization has:

- An enabled Slack or Microsoft Teams integration. The agent holds the conversation there.
- At least one [organizational policy](../../console/settings-organization/organizational-policies). The **Policy** list stays empty until one exists, and you cannot complete the action without a policy.

| Agent | What it does |
|---|---|
| **Policy Explainer Agent** | Explains security policies in plain terms. |
| **AI Coach Agent** | Coaches the user on safe and compliant AI use. |
| **Password Hygiene Agent** | Helps the user fix weak, reused or compromised passwords and shared credentials. |
| **Vulnerability Explainer Agent** | Explains vulnerabilities and how to fix them. |

To set up the action:

1. Choose the agent under **Action**.
2. Choose the **Policy**: the organizational policy the agent answers from. Every agent needs one.
3. Optional: choose a **Tone** for the agent's messages.
4. Select **Generate agent summary**. Quilly summarizes the agent's task, and the action becomes **Ready**. If you change the action later, select **Update agent summary**.

The agent runs only when the control is in **Enforce**. Follow the conversations on the **Quilly** tab of [Users](../../console/observe/users#quilly). A finding that led to a conversation shows a **Quilly** pill. If **Activate Agent** is not offered, agent activation is not available for your organization.

## Choose Monitor or Enforce {#monitor-and-enforce}

Every control has a **Mode**. New controls start in **Monitor**.

| | **Monitor** | **Enforce** |
|---|---|---|
| Console description | "Monitor records findings quietly. Users are not interrupted." | "Enforce steps in within the browser when the conditions match." |
| What the user sees | Nothing. The activity goes ahead. | The **Just in Time** popup, if the control has one. |
| Findings | Recorded | Recorded. Safari records nothing for an **Enforce** control with no **Just in Time** action. |
| **Remediation Action** | Runs after the activity is recorded | Runs after the activity is recorded |
| **Activate Agent** | Does not run | Runs after the activity is recorded |

Change the mode in **Control details**, or from the **Mode** column of the controls list.

To test a control before users see its popup, run it in **Monitor** and review its findings in [Findings & Interactions](../../console/observe/findings-and-interactions) before you switch it to **Enforce**. A **Monitor** control can still stop an **Enforce** control from showing its popup when both match the same activity. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control).

## Set how serious a match is {#criticality}

**Criticality** says how serious a match is: **Very Low**, **Low**, **Moderate**, **High** or **Very High**. New controls start at **High**.

Criticality does two things:

- Findings from the control show it, for example as the color of the finding card. It does not set the finding's severity.
- It breaks ties. When several controls match the same activity, the extension acts on only one of them. Each risk behavior has a fixed rank. The extension compares that rank first, and between controls of the same rank, the more critical control wins. See [Which control wins when several match](./how-controls-are-evaluated#which-control-wins-when-several-match).

Because the extension picks the winning control before it checks the mode, a **Monitor** control can stop an **Enforce** control from acting. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control).

## How System controls differ from Custom controls {#system-controls-and-custom-controls}

- **System controls** are supplied by QuilrAI and show the **System** tag in the controls list. Every System control in the list starts in **Monitor**, and some start switched on. For the ones that are on by default, see [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).
- **Custom controls** are the controls you and other admins create, including copies of System controls.

To see one kind, use the **Type** filter (**System** or **Custom**).

| You want to | Custom control | System control |
|---|---|---|
| Edit the description, criticality, mode, conditions and actions | Yes | Yes |
| Switch the control on or off | Yes | Yes |
| Duplicate the control | Yes | Yes. The copy is a Custom control. |
| Rename the control or change its use case | No | No |
| Delete the control | Yes | No |

:::note Changing a System control stops QuilrAI updates to it
QuilrAI updates System controls with new content over time. Once you edit a System control, change its mode, or switch it on or off, QuilrAI no longer updates that control for your organization.
:::

## Use case reference

The tables list the main use cases by posture, with the risk behavior and the mandatory conditions each one adds. "You can change this" marks a mandatory condition whose value you can choose.

### AI Risks

| Use case | Risk behavior | Mandatory conditions |
|---|---|---|
| A user shares sensitive data with an AI application | Users Leaking Sensitive Data | Category is Generative AI; Sensitive is Yes |
| A user posting data with an AI application | Users Posting Data | Category is Generative AI; Sensitive is Yes or No |
| A user signing in and signing up to an application | SignIn and SignUp to Applications | Category is Generative AI; Authentication Type is Sign Up or Login |
| A user is using an unapproved AI app | Unapproved AI Applications Used | Category is Generative AI; Status is Unapproved; Authentication Type is Sign Up or Login (you can change this) |
| A user is visiting an unapproved AI app | Unapproved AI Applications Used | Category is Generative AI; Status is Unapproved; User Action is Visit |
| AI application blocked by organisation | Blocked AI Applications | User Action is Visit; Block status is Yes (you can change this) |

### Password Hygiene

| Use case | Risk behavior | Mandatory conditions |
|---|---|---|
| A user is using a compromised password | Compromised Password | Compromised password is Yes; Authentication Type is Login (you can change this) |
| A user is using shared credentials | Credential Sharing | Authentication Type is Login (you can change this) |
| When user is reusing IDP password | Password Reuse | Authentication Type is Login (you can change this); Source Application IdP status is Yes. Needs an additional condition. |
| When user is reusing a critical app password | Password Reuse | Authentication Type is Login (you can change this); Source Application Criticality is Critical. Needs an additional condition. |
| A user is using a weak password | Weak Password | Password strength is less than equal to Weak threshold (you can change this); Authentication Type is Login (you can change this) |

### SaaS Risks

| Use case | Risk behavior | Mandatory conditions |
|---|---|---|
| A user is visiting an application | Visiting SaaS app | User Action is Visit. Needs an additional condition. |
| A user posting data into a chatbot | Users Posting Data to a Chatbot | User Action is Post; Chatbot is Yes |
| A user posting sensitive data into a chatbot | Users Posting Data to a Chatbot | User Action is Post; Sensitive is Yes; Chatbot is Yes |
| SaaS application blocked by organisation | Blocked SaaS Applications | User Action is Visit; Block status is Yes (you can change this) |

### Data Risks

| Use case | Risk behavior | Mandatory conditions |
|---|---|---|
| A user shares sensitive data with non-AI application | Users Leaking Sensitive Data | Category is not Generative AI; Sensitive is Yes |
| A user posting data with a non-AI application | Users Posting Data | Category is not Generative AI; Sensitive is Yes or No |
| A user is copying to clipboard | Users Copying Data | User Action is Copy. Needs an additional condition. |
| A user is copying data from a business-critical application. | Users Copying Data | User Action is Copy; Criticality is Critical |
| A user is copying sensitive data | Users Copying Data | User Action is Copy; Sensitive is Yes; Category is Generative AI |
| A user is pasting from clipboard | Users Pasting Data | User Action is Paste. Needs an additional condition. |
| A user is pasting data into an unapproved application | Users Pasting Data | User Action is Paste; Status is Unapproved |
| A user is copy-pasting data from one app to another | Users Pasting Data | User Action is Paste; Source Application Name and Application Name (you choose both) |
| A user is pasting sensitive data | Users Pasting Data | User Action is Paste; Sensitive is Yes; Category is Generative AI |
| A user is uploading data | Users Uploading Data | User Action is Upload. Needs an additional condition. |
| A user is uploading sensitive data | Users Uploading Data | User Action is Upload; Sensitive is Yes; Category is Generative AI |
| A user is uploading a labeled document | Users Uploading Data | User Action is Upload; Label Name (you choose the label) |
| A user is uploading an encrypted file | Users Uploading Data | User Action is Upload; Encrypted is Yes (you can change this) |

## Related pages

- [Browser Extension policy engine](./overview): how browser controls fit into the Policy Engine
- [Browser controls](./browser-controls): the controls list and the add and edit form
- [How controls are evaluated](./how-controls-are-evaluated): which control wins when several match
- [App posture and access requests](./app-posture-and-access): app status, criticality, blocking and approvals
- [Limits and browser differences](./limits-and-browser-differences)
- [User Interaction Hub](../../console/settings-sensors/user-interaction-hub): popup wording, logo and policy links
- [Action requests](../../console/govern/action-requests): approve or reject access requests
- [Findings & Interactions](../../console/observe/findings-and-interactions): the findings your controls create
- [Smart Groups](../../console/settings-organization/smart-groups) and [Detection Models](../../console/govern/detection-models)
