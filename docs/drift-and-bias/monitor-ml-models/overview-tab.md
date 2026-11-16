---
sidebar_position: 1
sidebar_label: "Overview tab"
sidebar_custom_props:
  icon: LayoutGrid
description: "The Drift & Bias Overview tab: the LLM bias heatmap for text models and the headline counts for classic ML models."
aliases: [drift and bias overview, bias heatmap, LLM bias, text models, classic models]
---

# Overview tab

The **Overview** tab keeps LLMs and classic ML models apart, in two numbered sections.

![Drift & Bias Overview tab with the LLM bias heatmap above the classic ML models section](/img/drift-and-bias/1-overview-tab.jpg)

*Figure 1. The Overview tab: 01 Text models (LLMs) on top, 02 Classic models (ML models) below.*

## 01 Text models (LLMs)

How your text models treat gender, race and ethnicity, and age, one question set at a time.

- **Question set:** choose which question set to show, then switch between **Bias-free score**, **Accuracy** and **Refusal rate**.
- **Headline counts:** **Series** (model, question set, judge and settings that are compared), **Drifted** (series whose latest run differs from its baseline), **Lowest group** and **Widest gap** (between two groups of one kind).
- **Bias-free score by model and group:** one row per series, showing its latest finished run, worst group first. Groups are arranged under **Gender**, **Race & ethnicity** and **Age**, with **Trend** and **Latest**. The stronger the colour, the worse the score. A cell with fewer than 30 usable replies is marked as such. Select a row or a cell to open its run. Switch between **Chart** and **Table**.
- **All LLM runs** opens the **LLM runs** tab.
- **Live bias, 7 days:** when **Live bias check** is on for an app in the LLM Gateway, the tab shows the live rate across your apps and, under each model, its live rate next to its test-run score.

## 02 Classic models (ML models)

Your classic ML models, checked on their own scored rows for drift, performance and fairness. The headline counts are the same as on the [ML models tab](./ml-models-tab.md): **ML models**, **Drifting**, **Degraded**, **Fairness flagged** and **Open findings**.

Select **All ML models** to open the **ML models** tab.
