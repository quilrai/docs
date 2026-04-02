---
sidebar_position: 4
sidebar_custom_props:
  icon: ShieldCheck
---

# Security Guardrails

Detect and act on sensitive data in MCP tool call inputs and outputs.

## Overview

Security guardrails inspect data flowing through MCP tool calls - both the inputs your agent sends and the outputs the tool returns. Each category can be independently enabled with separate request and response actions.

## Data Risk Detection

Identifies sensitive data categories and applies the configured action.

### Supported Categories

- **PII** - Personally Identifiable Information
- **PHI** - Protected Health Information
- **PFI** - Personal Financial Information
- **PCI** - Payment Card Industry data
- **Insurance** - Insurance-related sensitive data
- **Auth & Secrets** - Authentication credentials and secrets

### Exact Data Matching (EDM)

Pattern matching for specific data formats:

- SSN
- Aadhaar
- PAN
- Passport numbers
- Bank account numbers
- Credit card numbers
- Email addresses
- Phone numbers
- 20+ more patterns

## Adversarial Risk Detection

Catches adversarial attack patterns in tool call data:

- **Prompt injection** - Attempts to override agent instructions
- **Jailbreak** - Attempts to bypass safety controls
- **Context corruption** - Attempts to pollute agent context
- **Semantic adversarial** - Semantically crafted adversarial inputs
- **Social engineering** - Manipulation attempts targeting the AI agent

## Configurable Actions

Each detection category supports per-direction actions:

| Action | Behavior |
|--------|----------|
| **Block** | Reject the tool call entirely |
| **Redact** | Remove the sensitive data and allow the call |
| **Anonymize** | Replace sensitive data with anonymized placeholders |
| **Monitor** | Allow the call and log the detection for review |

Actions are configured independently for:

- **Request (input)** - Data the agent sends to the MCP tool
- **Response (output)** - Data the MCP tool returns to the agent
