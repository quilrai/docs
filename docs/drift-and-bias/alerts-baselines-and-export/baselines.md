---
sidebar_position: 2
sidebar_label: "Baselines"
sidebar_custom_props:
  icon: Layers
description: "What each LLM series and each ML model version is compared against in Drift & Bias."
aliases: [baselines, reference window, ML baselines, LLM baselines, reference rows]
---

# Baselines

Open **Assessments** > **Drift & Bias** > **Baselines**. The tab has two sections.

## 01 Text models: LLM baselines

A baseline is the first complete run of a series: the same model, question set, settings and judge. Later runs of the series are compared with it. Baselines are kept until deleted; the next complete run of the series then becomes its baseline. A run marked **Incomplete** (more than 10% of its questions could not be sent or judged) is never used as a baseline.

## 02 Classic models: ML baselines

![Baselines tab with LLM baselines and ML baselines](/img/drift-and-bias/13-baselines.jpg)

*Figure 1. The Baselines tab.*

Each model version is compared with its reference window:

- The rows your pipeline sent as `reference` (shown as **Sent as reference**), or
- Its first 7 days of scored rows, when no reference rows were sent.

A new version gets its own reference.

| Column | Shows |
|---|---|
| **Model** | Name and model key. |
| **Version** | The version this reference belongs to. |
| **Reference** | Where the reference came from. |
| **Window** | The dates the reference covers. |
| **Rows** | Rows in the reference, and how many carried a label. |
| **Last checked** | The model's latest check. |

Both sections have an **Export** button that opens a new export in Export Center. See [Export](./export.md).
