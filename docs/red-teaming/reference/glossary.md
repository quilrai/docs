---
sidebar_position: 4
sidebar_label: "Glossary"
sidebar_custom_props:
  icon: BookOpen
description: "Terms used in Quilr Red Teaming."
aliases: [glossary, terms, definitions]
---

# Glossary

Terms used in Quilr Red Teaming and in these docs.

| Term | Definition |
| --- | --- |
| Assessment | A configured test of one target: its mode, coverage, custom attacks, and schedule. |
| Run | One execution of an assessment. Runs are listed under Recent runs. |
| Mode | The kind of target being tested: AI App / Agent, AI Workflow, or Model. |
| Objective | One attack goal, such as System Prompt Extraction. The attack library holds the built-in objectives. |
| Quick scan | About 8 core objectives, for a fast check. |
| Full library | Every objective in the attack library. |
| Custom objective | An objective you write for your own target, reported under a Custom category. |
| Synthesized | An objective generated for this specific target, often to test its tools. |
| Finding | A weakness a run found, with severity, evidence, a recommended fix, and framework mappings. |
| Breached / Partial / Held / Inconclusive | The outcome of an attack. See [Risk grade and severity](./risk-grade-and-severity.md). |
| Pass rate | The share of attacks the target withstood. |
| Risk grade and risk score | A letter grade from A to F and a score out of 100 for a run. Lower risk is better. |
| Evaluation mode | How results are judged. Hybrid combines deterministic evidence with model judges; Deterministic uses evidence detectors only; Judge uses model judges only. |
| Judge consensus | How strongly the model judges agreed on a result. |
| Replay-safe | A target where repeating an attack cannot cause a harmful or duplicate side effect. Confirmation replays run only on replay-safe targets. |
| Replay | Sending a finding's attacks again, usually after a fix, to check whether it still works. |
| Authorized scope | The record of what you are approved to test: the target, a ticket or reference, and the testing boundary. |
| Detect | Automatic discovery of how a target is reached and what request and response format it uses. |
| Via Direct | The attack technique that succeeded, shown on each finding in the Full report. |
