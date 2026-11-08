---
sidebar_position: 4
sidebar_label: "Share results"
sidebar_custom_props:
  icon: Link
description: "Forward a run summary to a Slack channel or email addresses."
aliases: [forward summary, slack, email, share]
---

# Share results

Forward a run's summary to a Slack channel or to email addresses, so the development team, security leads, or anyone else who needs to act sees the interesting findings without hunting for them.

## What gets sent

The summary includes the run's pass rate, its findings by severity, and its top findings, with a link to the full results in the console. People who open the link sign in to see them, so results are never exposed to someone without access.

## Forward a summary

1. Open the run. See [Run details](./run-details.md).
2. Select **Forward summary** at the top right.
3. Fill in one or both destinations, described below.
4. Select **Send**.

![A run details page for nvidia/nemotron-3-nano-30b-a3b, Model, Risk grade F, with the Forward summary button highlighted among the action buttons.](/img/red-teaming/share/1-forward-button.png)

*Figure 1. Select **Forward summary** on a run.*

## Destinations

You can send to Slack, to email, or to both at once.

| Option | What to enter | Notes |
| --- | --- | --- |
| Slack webhook URL | The incoming webhook URL of the Slack channel to post to, starting with `https://hooks.slack.com/services/`. | In Slack, add an Incoming Webhook to the channel first, then paste its URL here. The URL is not saved. |
| Email addresses | Up to 10 addresses, separated by commas or new lines. | Each person gets their own email. |

![The Forward summary dialog with a Slack webhook URL field, an Email addresses box, and Cancel and Send buttons.](/img/red-teaming/share/2-forward-dialog.png)

*Figure 2. The Forward summary dialog.*

:::note

Nothing you enter is saved. Paste the Slack webhook URL and the email addresses each time you forward a summary.

:::

:::tip

Forward a summary to the development team that owns the target as soon as a run finishes. They can open the link, read the evidence and recommended fixes in the [Full report](./full-report.md), and replay the findings once they are fixed.

:::
