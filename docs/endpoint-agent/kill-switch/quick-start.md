---
sidebar_position: 1
sidebar_custom_props:
  icon: Rocket
---

# Quick Start

Understand and verify kill switch behaviour on the Sentinel endpoint agent in 4 steps.

<StepFlow steps={[
  {
    label: "Agent Starts",
    items: [
      "Flag: reads from local DB",
      "Enabled: full registration",
      "Disabled: re-enable only",
    ],
  },
  {
    label: "Kill Signal Received",
    items: [
      "Flag: persisted to disk",
      "Chains: all DLP removed",
      "Services: stopped",
    ],
  },
  {
    label: "Disabled State",
    items: [
      "Re-enable: always accepted",
      "DLP: fully inactive",
      "Survives reboots: ✓",
    ],
  },
  {
    label: "Revive Signal Received",
    items: [
      "Flag: cleared",
      "Chains: restored",
      "Services: restarted ✓",
    ],
  },
]} />

## 1. Startup Enforcement

Every time the Sentinel agent starts, it reads the kill switch flag from its local database before registering any services or chains.

| Flag | What the Agent Does |
|------|---------------------|
| **Enabled** | All DLP chains and services registered normally — agent is fully operational |
| **Disabled** | All registration skipped; only the re-enable chain is created; agent waits silently |

A managed disable (pushed via MDM or GPO) persists automatically across reboots — no re-disable needed.

## 2. Kill Path

When the agent receives `{ "disable_agent": true }` from the extension:

| Step | Action |
|------|--------|
| **Persist** | Flag written to local database |
| **Remove chains** | All DLP event chains removed from the event broker |
| **Stop services** | Clipboard monitor and file indexer stopped |
| **Confirm** | Extension receives confirmation |

The agent process continues running. Only chains and services are torn down.

## 3. Disabled State

While disabled, the agent ignores all events except re-enable signals.

| Active | Inactive |
|--------|---------|
| Re-enable channel | Clipboard monitoring |
| Database connection | File indexing |
| Native Messaging listener | All DLP scanning |

## 4. Revive Path

When the agent receives `{ "disable_agent": false }` from the extension:

| Step | Action |
|------|--------|
| **Persist** | Flag cleared in local database |
| **Restore chains** | All DLP event chains re-registered from configuration |
| **Restart services** | Clipboard monitor and file indexer restarted |
| **Confirm** | Extension receives confirmation |

Full DLP coverage is restored without a process restart. No configuration is lost.

## Default State

The agent is **enabled by default**. The disabled flag is only set when explicitly pushed from the browser extension or an MDM policy.

---

**Next step:** See the [Architecture](./architecture) for the full enforcement pipeline and state machine.
