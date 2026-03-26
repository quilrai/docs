---
sidebar_position: 6
---

# Rate Limits

Control request rates, token budgets, and key expiry.

## Overview

Rate limits protect your LLM spend and availability. All limits are enforced at the gateway before requests reach the provider.

## Key Features

- **Per-key rate limits** — Requests per minute, hour, or day
- **Token limits** — Input and output token budgets per request or over time
- **API key expiration** — Configurable epoch time for automatic key expiry
- **Response timeout** — Maximum wait time to prevent hung requests from consuming resources

## Configuration

| Setting | Description |
|---------|-------------|
| Requests per minute | Maximum API calls per minute per key |
| Requests per hour | Maximum API calls per hour per key |
| Requests per day | Maximum API calls per day per key |
| Max input tokens | Maximum input tokens per request |
| Max output tokens | Maximum output tokens per request |
| Token budget | Total token allowance over a time window |
| Key expiration | Epoch timestamp after which the key is rejected |
| Response timeout | Seconds before a request is terminated |
