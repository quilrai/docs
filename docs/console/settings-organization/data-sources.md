---
sidebar_position: 6
sidebar_label: "Data sources"
sidebar_custom_props:
  icon: Plug
---

# Data sources

Choose which sensors and integrations feed data into the console views.

<ConsolePath console="QuilrAI Console" path={['Settings', 'Organization', 'Data Sources']} />

:::warning Visibility only
Turning a source off **hides its data in the console. It does not stop ingestion.** The sensor or integration keeps collecting and enforcing, and the data reappears when you turn the source back on. To stop collection, disable the sensor or uninstall the integration itself.
:::

## Sources

Each source has an **Included in console** toggle.

| Group | Sources |
|---|---|
| Sensors | LLM Gateway, MCP Gateway, Endpoint Agent, Browser Extension |
| Integrations | Connected integrations, for example Microsoft Copilot Studio, GitHub, Azure AI Foundry, OpenAI |

The integrations listed depend on what you have installed.

## When to use it

- Hide a source while it is being piloted, so test traffic does not skew dashboards.
- Focus the console on the sensors you actively govern.

## Related

- [Integrations](../../integrations)
- [Data retention](../settings-data/data-retention)
