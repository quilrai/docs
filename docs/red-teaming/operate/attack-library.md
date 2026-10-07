---
sidebar_position: 2
sidebar_label: "Attack library"
sidebar_custom_props:
  icon: LibraryBig
---

# Red Team Attack Library

The 64 built-in objectives used by [Agentic Red Teaming](../assessments/agentic-red-teaming) and [Model Red Teaming](../assessments/model-red-teaming). The library is the same for both.

## At a glance

| | Count |
|---|---|
| Objectives | 64 |
| In a **Quick scan** | 8 (marked ✓ below) |
| Critical / High / Medium / Low | 12 / 30 / 19 / 3 |

Each objective has an OWASP category, a MITRE ATLAS technique, and a default severity. On top of the library, every run adds:

- **Tool-targeted objectives synthesized live** for the target after recon (6 in the example runs in [Reading Red Team Results](../get-started/reading-a-report)).
- Any **custom objectives** you add, reported under a **Custom** category.

## Quick scan objectives

| Objective | Category | ATLAS technique | Severity |
|-----------|----------|-----------------|----------|
| System Prompt Extraction | LLM07 | AML.T0056 | High |
| Multilingual Guardrail Bypass | LLM01 | AML.T0054 | High |
| Tool / Capability Enumeration | ASI02 | AML.T0084.001 | Medium |
| Scope Hijack / Off-Topic Misuse | ASI01 | AML.T0051 | Low |
| Authentication / Login Bypass | ASI03 | AML.T0053 | Critical |
| SQL Injection via Tool Arguments | LLM05 | AML.T0053 | Critical |
| OS / Command Execution Attempt | ASI05 | AML.T0102 | Critical |
| PII / Cross-User Data Exfiltration | LLM02 | AML.T0057 | High |

## Full library

### LLM07: System Prompt Leakage

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| System Prompt Extraction | AML.T0056 Extract LLM System Prompt | High | ✓ |
| Model / Provenance Disclosure | AML.T0056 Extract LLM System Prompt | Medium | |

### LLM01: Prompt Injection

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Multilingual Guardrail Bypass | AML.T0054 LLM Jailbreak | High | ✓ |
| Direct Prompt Injection / Instruction Override | AML.T0051.000 LLM Prompt Injection: Direct | High | |
| Persona Jailbreak (DAN-style) | AML.T0054 LLM Jailbreak | High | |
| Multi-Turn Gradual Escalation (Crescendo) | AML.T0054 LLM Jailbreak | High | |
| Encoding / Obfuscation Bypass | AML.T0068 LLM Prompt Obfuscation | Medium | |
| Refusal Consistency Under Pressure | AML.T0054 LLM Jailbreak | Medium | |
| Image-Embedded Prompt Injection (Multimodal) | AML.T0051.001 LLM Prompt Injection: Indirect | Medium | |
| Image Metadata Prompt Injection (Multimodal) | AML.T0051.001 LLM Prompt Injection: Indirect | Medium | |
| Audio-Embedded Prompt Injection (Multimodal) | AML.T0051.000 LLM Prompt Injection: Direct | Medium | |
| Indirect Prompt Injection (poisoned content) | AML.T0051.001 LLM Prompt Injection: Indirect | High | |
| Many-shot Jailbreak | AML.T0054 LLM Jailbreak | High | |
| Crescendo Multi-turn Jailbreak | AML.T0054 LLM Jailbreak | High | |
| Policy Puppetry / Fake System Directive | AML.T0051.000 LLM Prompt Injection: Direct | High | |
| Encoded / Ciphered Payload Smuggling | AML.T0054 LLM Jailbreak | Medium | |
| Low-resource Language Jailbreak | AML.T0054 LLM Jailbreak | Medium | |
| Hypothetical / Fiction Framing | AML.T0054 LLM Jailbreak | Medium | |
| Reverse Psychology / Refusal Reframe | AML.T0054 LLM Jailbreak | Low | |
| Context Overflow to Evict Guardrails | AML.T0051.000 LLM Prompt Injection: Direct | Medium | |
| Spoken Instruction Override | AML.T0051.000 LLM Prompt Injection: Direct | High | |

### ASI02: Tool Misuse & Exploitation

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Tool / Capability Enumeration | AML.T0084.001 Discover AI Agent Configuration: Tool Definitions | Medium | ✓ |
| Privilege-Flag Tampering (Confused Deputy) | AML.T0053 AI Agent Tool Invocation | High | |
| Tool Argument Abuse | AML.T0053 AI Agent Tool Invocation | High | |
| SSRF / Tool Repurposing | AML.T0053 AI Agent Tool Invocation | High | |
| Tool-Chaining Exfiltration | AML.T0086 Exfiltration via AI Agent Tool Invocation | High | |
| Business-Logic Abuse (Price / Discount) | AML.T0053 AI Agent Tool Invocation | High | |
| RAG Document Exfiltration | AML.T0085.000 Data from AI Services: RAG Databases | High | |
| Multi-agent / Delegation Manipulation | AML.T0053 AI Agent Tool Invocation | High | |
| Path Traversal via Tool Arguments | AML.T0053 AI Agent Tool Invocation | High | |
| Tool Parameter Pollution / Override | AML.T0053 AI Agent Tool Invocation | Medium | |
| Callback / Contact Detail Takeover | AML.T0053 LLM Plugin Compromise | Critical | |

### ASI01: Agent Goal Hijack

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Scope Hijack / Off-Topic Misuse | AML.T0051 LLM Prompt Injection | Low | ✓ |
| Indirect / Tool-Result Injection | AML.T0051.001 LLM Prompt Injection: Indirect | High | |
| Malicious Document Injection (Multimodal) | AML.T0066 Retrieval Content Crafting | High | |
| Agent Goal Hijack | AML.T0051.000 LLM Prompt Injection: Direct | High | |
| Transfer / Escalation Abuse | AML.T0051 LLM Prompt Injection | Medium | |

The library labels the last two "ASI01: Agent Goal Manipulation" and "ASI01: Agent Goal & Instruction Manipulation"; they map to the same OWASP Agentic ASI01 risk.

### ASI03: Identity & Privilege Abuse

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Authentication / Login Bypass | AML.T0053 AI Agent Tool Invocation | Critical | ✓ |
| OTP Guess / Validation Bypass | AML.T0053 AI Agent Tool Invocation | Critical | |
| Privilege Escalation | AML.T0053 AI Agent Tool Invocation | Critical | |
| Cross-User Data Access (BOLA) | AML.T0085.001 Data from AI Services: AI Agent Tools | Critical | |
| Privileged Function Access (BFLA) | AML.T0053 AI Agent Tool Invocation | Critical | |

### LLM05: Improper Output Handling

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| SQL Injection via Tool Arguments | AML.T0053 AI Agent Tool Invocation | Critical | ✓ |
| Harmful Content Generation (refusal test) | AML.T0054 LLM Jailbreak | High | |
| Dangerous Capability Uplift (CBRN/weapons refusal) | AML.T0054 LLM Jailbreak | Critical | |
| Insecure / Backdoored Code Generation | AML.T0048 External Harms | High | |
| Output Injection (XSS / Markdown / HTML) | AML.T0048 External Harms | Medium | |

### ASI05: Unexpected Code Execution

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| OS / Command Execution Attempt | AML.T0102 Generate Malicious Commands | Critical | ✓ |

### LLM02: Sensitive Information Disclosure

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| PII / Cross-User Data Exfiltration | AML.T0057 LLM Data Leakage | High | ✓ |
| Internal Config / Secret Leakage | AML.T0083 Credentials from AI Agent Configuration | High | |
| Salary / Compensation Extraction | AML.T0057 LLM Data Leakage | High | |
| Sensitive Data Read Aloud | AML.T0057 LLM Data Leakage | High | |

### ASI06: Memory & Context Poisoning

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Memory / Context Poisoning | AML.T0080.000 AI Agent Context Poisoning: Memory | High | |

### LLM06: Excessive Agency

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Excessive Agency (Destructive Action) | AML.T0101 Data Destruction via AI Agent Tool Invocation | Critical | |
| Unauthorized Financial Action | AML.T0053 AI Agent Tool Invocation | Critical | |
| Caller Verification Bypass | AML.T0051 LLM Prompt Injection | Critical | |

### LLM10: Unbounded Consumption

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Rate-Limit / Denial-of-Wallet Probe | AML.T0034.002 Cost Harvesting: Agentic Resource Consumption | Medium | |
| Denial of Wallet / Unbounded Consumption | AML.T0034 Cost Harvesting | Medium | |

### LLM08: Vector and Embedding Weaknesses

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| RAG Knowledge-Base Poisoning | AML.T0070 RAG Poisoning | High | |
| Embedding / Vector Store Inversion | AML.T0057 LLM Data Leakage | High | |

### LLM09: Misinformation

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Misinformation / Persuasive Falsehood | AML.T0048 External Harms | Medium | |
| Fabricated Facts & Citations (overreliance) | AML.T0048 External Harms | Low | |
| AI Disclosure Evasion | AML.T0048 Societal Harm | Medium | |

### LLM04: Data and Model Poisoning

| Objective | ATLAS technique | Severity | Quick scan |
|-----------|-----------------|----------|:---:|
| Feedback-loop Data Poisoning | AML.T0020 Poison Training Data | Medium | |

## Coverage notes

- **OWASP Top 10 for LLM Applications (2025):** LLM01, LLM02, LLM04, LLM05, LLM06, LLM07, LLM08, LLM09, LLM10. No library objective targets LLM03.
- **OWASP Top 10 for Agentic Applications:** ASI01, ASI02, ASI03, ASI05, ASI06.
- **Multimodal and voice objectives** (image, audio, document, spoken) target those channels. The report's **Capabilities exercised** panel shows which channels a run actually exercised; a text-only run reads "text-only target - enable multimodal objectives to exercise vision / audio / document channels".
- A full-library run can complete fewer than 64 library objectives. Check the **Objectives run** tile on the report for the actual count; the model run in [Reading Red Team Results](../get-started/reading-a-report#example-1-a-clean-result) completed 60.
