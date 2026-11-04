---
sidebar_position: 3
sidebar_label: "Framework mapping"
sidebar_custom_props:
  icon: Scale
description: "How attacks and findings map to OWASP, MITRE ATLAS, NIST AI RMF, and other frameworks."
aliases: [owasp, mitre atlas, nist ai rmf, frameworks]
---

# Framework mapping

Every attack objective and finding is mapped to industry standards, so you can report results in the frameworks your auditors and risk teams already use.

## Where mappings appear

- **Run details:** the Standards & Framework Coverage cards and the Categories table, which you can switch between standards. See [Run details](../results-and-reports/run-details.md).
- **Full report:** the OWASP and MITRE ATLAS coverage panels, and the mitigations and citations on each finding. See [Full report](../results-and-reports/full-report.md).

## Frameworks

| Framework | Covers | Measured in |
| --- | --- | --- |
| MITRE ATLAS | AI threat techniques | Techniques |
| NIST AI RMF | AI risk management | Subcategories |
| OWASP | LLM and agentic application risks | Categories |
| ISO/IEC 42001 | AI management systems | Controls |
| EU AI Act | Regulatory requirements | Articles |
| CIS Controls v8 | Critical security controls | Safeguards |
| ISO/IEC 27001 | Information security | Controls |
| SOC 2 | Trust Services Criteria | Criteria |
| CWE | Common software weaknesses | Categories (in the Categories table) |

On each framework card, the count, such as **8 / 19 techniques tested**, shows how much of the framework the run reached. A Quick scan reaches less than the Full library.

## OWASP categories

OWASP categories come from two lists: `LLM` IDs from the Top 10 for LLM Applications (2025), and `ASI` IDs from the Top 10 for Agentic Applications.

| ID | Category |
| --- | --- |
| LLM01 | Prompt Injection |
| LLM02 | Sensitive Information Disclosure |
| LLM04 | Data and Model Poisoning |
| LLM05 | Improper Output Handling |
| LLM06 | Excessive Agency |
| LLM07 | System Prompt Leakage |
| LLM08 | Vector and Embedding Weaknesses |
| LLM09 | Misinformation |
| LLM10 | Unbounded Consumption |
| ASI01 | Agent Goal Hijack |
| ASI02 | Tool Misuse & Exploitation |
| ASI03 | Identity & Privilege Abuse |
| ASI05 | Unexpected Code Execution |
| ASI06 | Memory & Context Poisoning |

LLM03 (Supply Chain) is not covered by the attack library.

## Mappings on a finding

| Mapping | Example |
| --- | --- |
| OWASP category and mitigation | `LLM09`, with guidance for that category |
| MITRE ATLAS technique | `AML.T0063` Discover AI Model Outputs |
| MITRE ATLAS mitigations | `AML.M0002` Passive AI Output Obfuscation. Some techniques have no published mitigation, and the finding says so. |
| NIST AI RMF subcategories | `MEASURE 2.7`, `MANAGE 4.1` |

One attack can map to several categories and frameworks, so category totals can add up to more than the number of attacks.
