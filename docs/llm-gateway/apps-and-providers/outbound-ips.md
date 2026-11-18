---
sidebar_position: 2.7
sidebar_label: "Outbound IPs"
sidebar_custom_props:
  icon: Globe
description: "Send provider calls from fixed Quilr IP addresses that you allowlist on the provider."
console_path: []
aliases: [outbound ips, egress ips, egress proxy, static ip, fixed ip, ip allowlist, ip whitelist, source ip, firewall, network acl, quilr outbound ips, network route]
---

# Outbound IPs

Some providers accept calls only from IP addresses you approve, for example an Azure OpenAI resource with network rules, or a model endpoint behind your firewall. Turn on Quilr outbound IPs, and the gateway calls these providers from fixed Quilr addresses that you add to the provider's allowlist.

## Quilr outbound IP addresses

| Region | IP addresses |
|--------|--------------|
| United States | `3.139.141.219`, `18.209.218.150` |
| Europe | `18.193.225.5`, `34.241.128.52` |
| India | `13.206.52.65`, `16.112.107.166` |

Allowlist every address listed for the region you choose. Addresses may be added to a region over time. The **Outbound IPs** drawer in the console always shows the current list.

:::warning Before you turn it on
- **Not for private networks.** The provider must be reachable on the public internet over `https` (port 443). To reach a model in a private network, use a [remote connector](./remote-connectors) instead.
- **Not with connectors.** A provider linked to a [remote connector](./remote-connectors) or a [GPU server](./gpu-connectors) can't also use outbound IPs.
- **No fallback.** If the gateway can't reach the provider through the region you chose, the call fails. It is never sent from another address.
- **Allowlist first.** Add the addresses on the provider before you turn this on, or its calls are rejected.
:::

## Use outbound IPs for all providers

1. Go to **Settings > AI Gateway > LLM Gateway** and click **Outbound IPs**.
2. Turn on **Use Quilr outbound IPs**.
3. Select the **Region** whose addresses you allowlisted.
4. Click **Save**.

This applies to every provider that doesn't have its own network route.

## Use outbound IPs for one provider

1. Go to **Settings > AI Gateway > Models** and open the provider.
2. On the **Connection** tab, click **Change** in the **Network route** card.
3. Under **Quilr outbound IPs**, select a region.
4. Click **Test**, then **Save** when the test passes.

You can also choose the route under **Network route** when you add a provider. A provider's own route always takes priority over the setting for all providers.

## Set it up with the Management API

See [Outbound IPs](../api-reference/providers-and-configuration-api#outbound-ips) in the Providers and configuration API.
