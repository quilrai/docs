---
title: HA and SLA uses same-region failover and approved latency planning figures
author: Codex
date: 2026-11-04
touches:
  - docs/llm-gateway/get-started/ha-and-sla.md
---

## Decided
The owner confirmed India 1 and India 2 are the available Mumbai load-balancer pair. Recommend failover only within the assigned region. Each URL balances traffic across gateway nodes; the alternate URL covers an individual load-balancer outage, while regional dependencies can still be shared. Retain the contractual 99.6% uptime SLA.

The owner approved planning figures of 50 ms median and 94 ms average for default text detections at a reference size of 10,000 total scanned input plus output tokens. Custom estimates are EDM/regex 7-11 ms, semantic about 50 ms and intent about 150 ms per scan with a simple category. Guardian Agent adds a per-request planning budget of 350 ms median and 500 ms average, confirmed after clarifying a typo; additional model generation from drafts or retries is budgeted separately. Keep these labeled as planning estimates, not independently measured per-category or exact-token benchmarks. Confirm numerical changes with the owner before editing.

## Tried and ruled out
No custom-detector activity does not establish an exact default configuration. Match v3 request records to historical configuration snapshots and account for optional features, policy overrides, scan completeness and cache mix. Detected findings do not enumerate every configured category. Provider usage tokens are only a proxy for scan size.

## Watch out
Successive scans overwrite quilr_processing_time_ms, while guardrails_latency_ms accumulates both legs. Do not present the former as complete gateway overhead. Current console defaults differ from legacy Python defaults. Custom detectors can share work and run concurrently, so neither category counts nor stage durations imply a linear added cost. Completed-image worker timings exclude timeouts and subsequent text scanning. Keep private production evidence outside docs/ and static/. The installed graft CLI has no note command, so this learning was saved directly.
