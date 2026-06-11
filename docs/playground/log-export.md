---
sidebar_position: 2
hide_table_of_contents: true
sidebar_custom_props:
  badge: new
  icon: ClipboardList
---

# Log Export Playground

Export LLM Gateway or MCP Gateway logs into an Excel-compatible CSV without writing your own exporter first. Choose the gateway, time window, row limit, and columns, then run the Log Export API directly from this page.

:::caution Use export keys only
This playground expects a Log Export key such as `sk-export-...`. Do not enter a model-call API key, MCP API token, or admin API key.
:::

:::info Export key scope
An app-scoped LLM `log_export_key` exports only logs for the underlying QuilrAI API key it belongs to. If the dashboard shows traffic for the same app name but this playground returns zero rows, the requests may have been made with a different app key. Use that key's export key or an all-apps export key.
:::

<LogExportPlayground />

## What It Calls

The LLM Gateway export endpoint is:

```http
GET /llmgateway/logs/export
X-Quilr-Log-Export-Key: sk-export-...
```

The MCP Gateway export endpoint is:

```http
GET /mcpgateway/logs/export
X-Quilr-Log-Export-Key: sk-export-...
```

The playground sends `start_time`, `end_time`, and `limit` query parameters for the first request. If the API returns `checkpoint.has_more: true`, it follows `checkpoint.next_cursor` until it reaches the selected row limit or the export window is complete.

If the selected range falls outside the 15-day retention window, the playground moves the start time forward to the earliest available export time before sending the request. If the end time is newer than the 15-minute export lag allows, it moves the end time back to the latest exportable time.

## Export Format

The download is a UTF-8 CSV with a byte-order mark so spreadsheet tools such as Microsoft Excel detect the encoding correctly. JSON-shaped fields, such as predictions or payload text, are serialized into a single CSV cell.

For automation, use the local test script in this repo:

```bash
QUILR_LOG_EXPORT_KEY="sk-export-..." \
node scripts/test-log-export.mjs \
  --baseUrl https://guardrails-india-1.quilr.ai \
  --gateway llm \
  --startTime 2026-05-28T00:00:00Z \
  --maxRows 1000 \
  --output /private/tmp/quilr-llm-logs.csv
```
