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

A browser control tells the Browser Extension what to watch for and what to do when it happens. This page explains each part of a control. For the controls list and the steps to add or edit one, see [Browser controls](./browser-controls).

You set these parts in the control form under **Govern > Policy Engine > Endpoint Agent > Browser**.

<ConsolePath console="QuilrAI Console" path={['Govern', 'Policy Engine', 'Endpoint Agent', 'Browser']} />

## Key terms

| Term | Meaning |
|---|---|
| **Use case** | The activity the control watches for, chosen in **When this happens**. It sets the posture (the risk area), the risk behavior (the kind of activity) and the mandatory conditions. |
| **Mandatory conditions** | Conditions the use case adds. |
| **Additional conditions** | Conditions you add to narrow the control. |
| **Actions** | What happens when the control matches, set in **Perform action**. |
| **Mode** | **Monitor** records matches without interrupting the user. **Enforce** also runs the **Just in Time** and **Activate Agent** actions. |
| **Criticality** | How serious a match is. |

## Choose what the control watches for

Besides its mandatory conditions, the use case decides which attributes and actions you can choose. See the [Use case reference](#use-case-reference).

- **The use case is fixed once the control exists.** To use another, duplicate the control and choose the new use case in the copy.
- **Some use cases need an additional condition before you can save.** The console shows: "Add more conditions to this control to prevent business disruption."
- **Some copy and paste use cases do not support spreadsheets**, such as Excel or Google Sheets. The console warns you.
- **Do not create controls on AI application blocked by organisation or SaaS application blocked by organisation.** They can stop blocked apps from being blocked. See [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too).

## Narrow the control with conditions {#conditions}

A condition is one test on one fact, for example **Smart Group** **is not in** Finance.

- **Mandatory conditions** carry the **Required** tag and cannot be removed. A few let you choose the value.
- **Additional conditions**: each attribute can appear only once, except **URL**.

### How conditions combine

- Mandatory conditions and your first additional condition are joined with AND.
- Each later condition card starts with an **AND** / **OR** menu.
- **Add condition to group** adds a row inside a card and makes it a **Group condition**. Each row after the first has its own **AND** / **OR** menu, which starts at **AND**. Groups cannot be nested.
- A group's rows are read from top to bottom: "A OR B AND C" means "(A OR B) AND C".

:::warning Use OR only inside a group
Browsers ignore a control whose top-level condition cards are joined with **OR**, so it never matches. To match either of two conditions, put both in one group and set the group's second row to **OR**. Keep the menu between cards at **AND**. For several values of one attribute, use **is in**. See [OR between top-level condition cards](./limits-and-browser-differences#or-between-top-level-condition-cards).
:::

### Which operators you can use {#operators}

The **Operator** menu shows only the operators that fit the attribute.

- Text comparisons ignore letter case.
- **is not equal to** also holds when the value is unknown.
- **is in** holds when the value matches one of the values you select. For multi-value attributes such as **Smart Group**, one match is enough.
- **is not in** holds when no value matches your selection. A user in no Smart Group always matches **Smart Group** **is not in**.
- For two-value attributes, such as **Authentication Type** or **Yes** / **No** attributes, use **is equal to** or **is not equal to**.

### What each attribute tests {#condition-attributes}

- **User**, the person signed in to the extension: **Department**, [**Smart Group**](../../console/settings-organization/smart-groups), **Status** (**Active** or **Inactive**), **Risk Level**, **Title**, **Location**, **DisplayName** and **Has account on any AI app**.
- **Application**, the app on the current page. You set its status, criticality and blocking in [App posture and access requests](./app-posture-and-access).
  - **Category**, **Name**, **Domain**, **URL** and **Headquarters**.
  - **Status** (**Needs Review**, **Approved**, **Tolerated** or **Unapproved**), **Criticality** (**Critical**, **Not Critical** or **Not Set**) and **Block status**.
  - **Is newly introduced**, **IdP status** (**Yes** when the app is an identity provider used for single sign-on) and **Multi-Factor Authentication (MFA) support**. Unknown MFA support counts as **Yes**.
  - **AI Mode** (for **A user is visiting an application**): **Yes** on Google AI Mode pages.
  - **Chatbot** (for the chatbot use cases): **Yes** when the user posts into a chatbot on the page.
  - **Login User Domain** (for **A user signing in and signing up to an application**): the domain of the email address typed into the form.
- **Browser**, the activity: **User Action** and **Authentication Type** (**Login** or **Sign Up**).
- **Data**, what QuilrAI found in the content: **Sensitive** and **Model** (the [detection models](../../console/govern/detection-models) that found data).
- **Upload**, the file: **File Size in bytes.**, **File Extension** (files inside an archive are checked too), **Label Name** (the sensitivity label), **Classification Labels** and **Encrypted** (password-protected).
- **Source Application**, the other app:
  - In the paste use cases and **A user is copying sensitive data**, the app the data was copied from: **Category**, **Name**, **Domain**, **Status**, **Criticality**, **IdP status**, **Is newly introduced**, **Multi-Factor Authentication (MFA) support** and **Sensitive Data**. For data copied from a desktop application, use **Copied From Process**, the application's name.
  - In the password reuse use cases, the app whose password is reused.
- **Account Owner**, for **A user is using shared credentials**: the directory record of the account used to sign in, not the user (**Department**, **Smart Group**, **Status**, **Risk Level** and **Title**).

:::note Content checks need the Browser Utility
Conditions on copied, pasted or uploaded content (**Sensitive**, **Model**, **Label Name**, **Encrypted**) and **Copied From Process** need the Browser Utility, a desktop program installed with the extension. See [Content checks need the Browser Utility](./limits-and-browser-differences#content-checks-need-the-browser-utility).
:::

## Choose what happens when the control matches {#actions}

### Which action types you can use {#action-types}

| **Action type** | Runs | What it does |
|---|---|---|
| **Just in Time** | In the browser, during the activity | Shows a popup or redacts data. |
| **Remediation Action** | QuilrAI backend, after the activity is recorded | Its only action, **Send Alert to Syslog**, sends an alert about the match to [Microsoft Sentinel](../../integrations/send-logs-and-alerts/microsoft-sentinel) installations that have the **Alerts & notifications** capability. Despite its name, it does not send to the [Syslog](../../integrations/send-logs-and-alerts/syslog) integration. |
| **Activate Agent** | QuilrAI backend, after the activity is recorded | Starts a Quilly agent. |

- A control can have one **Just in Time** action, plus actions of other types.
- The two blocked application use cases offer no **Just in Time** action.
- When several controls match the same activity, the extension acts on only one of them. See [Set how serious a match is](#criticality).
- A control with no **Just in Time** action never shows a popup. If the extension acts on it, the other matching controls show none either. To only record activity, use **Monitor**: Safari records nothing for an **Enforce** control without a **Just in Time** action. See [Enforce controls without a Just in Time action](./limits-and-browser-differences#enforce-controls-without-a-just-in-time-action).

### What users see

The first word of a **Just in Time** action's name tells you what the user sees.

| Name starts with | The user sees | The activity |
|---|---|---|
| Prompt | A card with a message and a button such as **Acknowledge**. | Goes ahead. |
| Justify or Justification | A dialog that asks for a business reason, picked or typed (20 to 140 characters). | Goes ahead on **Submit**. Closing the dialog blocks it. |
| Block | A dialog that explains the block and, by default, offers **Request Approval**. | Is stopped. A block on visiting an app also freezes the page. Other blocks show **Go Back**. |
| Allow | The [sensitive data window](#sensitive-data-window). | Waits for the user's choice. |
| Redact | A **Sensitive Data Redacted** notice. | Goes ahead, with each detected value replaced by X characters. |

**Request Approval** sends the user's reason to [Action requests](../../console/govern/action-requests). An approval stops that action's controls from applying to the user on that app, and the browser does not tell the user. See [Let people request access](./app-posture-and-access#let-people-request-access). Popup wording comes from shared message templates in [User Interaction Hub](../../console/settings-sensors/user-interaction-hub), so one change can affect several controls.

#### What the sensitive data window shows {#sensitive-data-window}

"Allow" actions show this window when a prompt contains sensitive data. It lists **Data types detected**, highlights the values and shows an editable copy of the prompt. The user selects **Continue with Original**, or edits the prompt and selects **Continue with Updated**. Closing the window cancels the prompt.

- **Allow original prompt with no justification**: nothing more is needed.
- **Allow original prompt with optional justification** or **Allow original prompt with mandatory justification**: the user can, or must, give a reason, then selects **Submit**.
- **Allow prompt after removal of sensitive data**: the user removes the data and selects **Resubmit and Continue**, then **Continue** once a new scan is clean.

### Limit how often a popup appears {#prompt-frequency}

Some Prompt and Justify actions have a **Prompt frequency** section. The extension uses it only on visit and sign-in controls. The console also offers it on other controls, but there the popup shows every time. See [How prompt frequency affects the result](./how-controls-are-evaluated#how-prompt-frequency-affects-the-result).

| **Frequency** | The popup shows |
|---|---|
| **First occurrence** (default) | Only the first time. |
| **Every occurrence** | Again each time the **Self-resolution period** (**24 hours**, **7 days** or **30 days**) has passed since it last showed. |
| **Number of occurrences** | **Occurrence count** times (1 to 10), with the **Self-resolution period** between showings. |

### Start a Quilly follow-up {#activate-agent}

**Activate Agent** starts a Quilly agent (Quilly is QuilrAI's AI coach for end users) that messages the user in Slack or Microsoft Teams. It needs an enabled Slack or Microsoft Teams integration and at least one [organizational policy](../../console/settings-organization/organizational-policies).

1. Under **Action**, choose **Policy Explainer Agent**, **AI Coach Agent**, **Password Hygiene Agent** or **Vulnerability Explainer Agent**.
2. Choose the **Policy** the agent answers from, and optionally a **Tone**.
3. Select **Generate agent summary**.

Conversations appear on the **Quilly** tab of [Users](../../console/observe/users#quilly). If **Activate Agent** is not offered, it is not available for your organization.

## Choose Monitor or Enforce {#monitor-and-enforce}

New controls start in **Monitor**.

- **Monitor**: the user sees nothing, a finding is recorded in [Findings & Interactions](../../console/observe/findings-and-interactions), and only **Remediation Action** runs.
- **Enforce**: **Just in Time**, **Remediation Action** and **Activate Agent** actions all run.

The extension chooses the control to act on before it checks the mode, so a **Monitor** control can stop an **Enforce** control from acting. See [A Monitor control can silence an Enforce control](./how-controls-are-evaluated#a-monitor-control-can-silence-an-enforce-control).

## Set how serious a match is {#criticality}

**Criticality** is **Very Low**, **Low**, **Moderate**, **High** or **Very High**. New controls start at **High**. Findings show it, but it does not set the finding's severity. When several controls match, the extension acts on one: the highest risk behavior rank wins, then the highest criticality. See [Which control wins when several match](./how-controls-are-evaluated#which-control-wins-when-several-match).

## How System controls differ from Custom controls {#system-controls-and-custom-controls}

**System controls** come from QuilrAI and carry the **System** tag. All start in **Monitor**, and some start switched on (see [System controls compete too](./how-controls-are-evaluated#system-controls-compete-too)). **Custom controls** are the ones your admins create.

Both kinds can be edited, switched on or off, and duplicated. A copy is always Custom. Only Custom controls can be deleted.

:::note Changing a System control stops QuilrAI updates to it
Once you edit a System control, change its mode, or switch it on or off, QuilrAI stops updating it for your organization.
:::

## Use case reference

The main use cases, grouped by risk behavior, with the mandatory conditions each one adds. "(editable)" marks a value you can change.

- **Blocked AI Applications** and **Blocked SaaS Applications**
  - **AI application blocked by organisation** and **SaaS application blocked by organisation**: User Action is Visit; Block status is Yes (editable).
- **Unapproved AI Applications Used**: both add Category is Generative AI and Status is Unapproved.
  - **A user is visiting an unapproved AI app**: User Action is Visit.
  - **A user is using an unapproved AI app**: Authentication Type is Sign Up or Login (editable).
- **Visiting SaaS app**
  - **A user is visiting an application**: User Action is Visit. Needs an additional condition.
- **SignIn and SignUp to Applications**
  - **A user signing in and signing up to an application**: Category is Generative AI; Authentication Type is Sign Up or Login.
- **Credential Sharing**
  - **A user is using shared credentials**: Authentication Type is Login (editable).
- **Password Reuse**: both add Authentication Type is Login (editable), and both need an additional condition.
  - **When user is reusing IDP password**: Source Application IdP status is Yes.
  - **When user is reusing a critical app password**: Source Application Criticality is Critical.
- **Compromised Password**
  - **A user is using a compromised password**: Compromised password is Yes; Authentication Type is Login (editable).
- **Weak Password**
  - **A user is using a weak password**: Password strength is less than equal to Weak threshold (editable); Authentication Type is Login (editable).
- **Users Leaking Sensitive Data**: both add Sensitive is Yes.
  - **A user shares sensitive data with an AI application**: Category is Generative AI.
  - **A user shares sensitive data with non-AI application**: Category is not Generative AI.
- **Users Posting Data**: both add Sensitive is Yes or No.
  - **A user posting data with an AI application**: Category is Generative AI.
  - **A user posting data with a non-AI application**: Category is not Generative AI.
- **Users Posting Data to a Chatbot**: both add User Action is Post and Chatbot is Yes.
  - **A user posting data into a chatbot**
  - **A user posting sensitive data into a chatbot**: Sensitive is Yes.
- **Users Copying Data**: all add User Action is Copy.
  - **A user is copying to clipboard**: needs an additional condition.
  - **A user is copying data from a business-critical application.**: Criticality is Critical.
  - **A user is copying sensitive data**: Sensitive is Yes; Category is Generative AI.
- **Users Pasting Data**: all add User Action is Paste.
  - **A user is pasting from clipboard**: needs an additional condition.
  - **A user is pasting data into an unapproved application**: Status is Unapproved.
  - **A user is copy-pasting data from one app to another**: Source Application Name and Application Name (you choose both).
  - **A user is pasting sensitive data**: Sensitive is Yes; Category is Generative AI.
- **Users Uploading Data**: all add User Action is Upload.
  - **A user is uploading data**: needs an additional condition.
  - **A user is uploading sensitive data**: Sensitive is Yes; Category is Generative AI.
  - **A user is uploading a labeled document**: Label Name (you choose the label).
  - **A user is uploading an encrypted file**: Encrypted is Yes (editable).

## Related pages

- [Browser Extension policy engine](./overview)
- [Browser controls](./browser-controls)
- [How controls are evaluated](./how-controls-are-evaluated)
- [App posture and access requests](./app-posture-and-access)
- [Limits and browser differences](./limits-and-browser-differences)
