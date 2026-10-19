---
sidebar_position: 1
sidebar_label: "Data retention"
sidebar_custom_props:
  icon: CalendarDays
description: "Set LLM Gateway retention, use zero data retention, and combine cards for different apps, models, users and detected data."
console_path: /settings/data-management/data-retention
aliases: [data retention, retention policy, retention horizon, zero data retention, ZDR]
---

# Data retention

Control how long LLM Gateway data is kept and how detected values are masked in stored content. **LLM Gateway is the only source configurable from the console today.** Support for other sources is releasing soon.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Data management', 'Data Retention']} />

## Choose a default

The **Default** card sets retention for **Prompt content**, **Response content**, **Log lifetime**, **Detected values (evidence)**, **User identity** and **Diagnostics**.

Choose **Never store**, **7 days**, **30 days**, **90 days**, **180 days**, **365 days** or **Forever**. Log lifetime does not offer Never store. It controls detailed log retention; basic usage and cost metadata remains available afterward.

Templates provide starting settings:

| Template | Starting point |
|---|---|
| **Zero data retention** | Never store prompts, responses, detected values or user identity; keep diagnostics for 7 days and detailed logs for 30 days |
| **Privacy-first** | Keep content and evidence for 7 days; hash detected values |
| **Investigation-ready** | Keep content and evidence for 90 days; show only the last four characters of detected values |
| **Full fidelity** | Forever retention, without template masking |

Templates update Default and template masking settings; existing cards remain. Review the resulting settings before applying.

### How ZDR works

**Never store** removes the selected fields as requests are written. With prompt and response content set to Never store, conversation replay is unavailable. Basic usage and cost metadata remains available, so Zero data retention does not mean every record disappears.

Cards targeting users or smart groups may require user identity to be retained. Check **User identity** in Default after applying the ZDR template. These settings control QuilrAI retention; they do not configure your model provider's retention.

## Read and combine quick cards

- **Default** shows the six retention periods that apply across LLM Gateway.
- **Scoped retention cards** show which traffic they match, any **Except** exclusions, and the **Prompts**, **Responses** and **Log** periods. Add cards for models, apps, users or smart groups, or detected categories and subcategories.
- **Redaction cards** show the matching traffic and transformation. Hashing replaces detected values with stable tokens; partial masking keeps the last four characters. These affect detected values in stored prompts, responses and evidence.

**The shortest matching period wins for each kind of data, including Default.** Card order does not matter. For example, Default prompts at 90 days, an app card at 30 days and a smart-group card at 7 days keep overlapping prompts for 7 days.

Multiple selections within a card match **any** selection. **Except** excludes traffic from that card only. **Forever** on one card does not override a shorter Default or another matching card.

## Review and apply

1. Edit Default or add and configure cards, then select **Done**.
2. Select **Review impact** to save your changes and inspect affected-record counts and redaction estimates.
3. Select **Apply** and confirm. **Save draft** lets you resume later without applying changes.

Changes cover new requests and existing records. The page shows whether new requests are being enforced and the progress for existing records. Removal and masking cannot be undone; increasing retention later cannot restore removed data. Existing export files and downloaded copies are unaffected.

See [Export Center](./export-center) for exports.
