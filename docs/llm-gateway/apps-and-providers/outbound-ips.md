---
sidebar_position: 2.7
sidebar_label: "Outbound IPs"
sidebar_custom_props:
  icon: Globe
description: "Send provider calls from fixed Quilr IP addresses that you allowlist on the provider, for all providers or one at a time, in the region you choose."
console_path: []
aliases: [outbound ips, egress ips, egress proxy, static ip, fixed ip, ip allowlist, ip whitelist, source ip, firewall, network acl, quilr outbound ips, network route]
---

# Outbound IPs

Use Quilr outbound IPs when a provider accepts calls only from known IP addresses, for example an Azure OpenAI resource with a network rule, or a model endpoint behind a firewall. The gateway then calls that provider from two fixed addresses in the region you choose, and you allowlist those addresses on the provider.

You can turn this on for every provider at once, or for one provider at a time.

## Quilr outbound IP addresses

Each region has two addresses. Allowlist **both** addresses of the region you choose.

| Region | IP addresses |
|--------|--------------|
| United States | `3.139.141.219`, `18.209.218.150` |
| Europe | `18.193.225.5`, `34.241.128.52` |
| India | `13.206.52.65`, `16.112.107.166` |

Every region is available from every Quilr gateway location. Choose the region whose addresses your provider allowlists.

The console lists the same addresses in the **Outbound IPs** drawer, with a **Copy** button for each region.

## Set the default for all providers

The default applies to every provider that doesn't set its own network route.

1. Go to **Settings > AI Gateway > LLM Gateway** and click **Outbound IPs**.
2. Under **Default for providers**, turn on **Use Quilr outbound IPs**.
3. Under **Region**, select the region whose addresses your providers allowlist.
4. Click **Save**.

Changes reach every gateway server within 2 minutes. To send calls directly again, turn off **Use Quilr outbound IPs** and click **Save**.

If you can't change the setting, ask an administrator who can update LLM Gateway settings. You can still view and copy the addresses.

## Set the route for one provider

A provider's own network route always wins over the default. Use it to send one provider through a different region, or to keep one provider direct while the default is on.

| Network route option | Calls to the provider leave from |
|----------------------|----------------------------------|
| **Organization default · ...** | Whatever the default is. The option shows it, for example **Organization default · Quilr outbound IPs, India** or **Organization default · direct**. |
| **Direct from Quilr gateway servers** | The gateway server's own address. This address isn't fixed, so don't allowlist it. |
| **Quilr outbound IPs** > **United States**, **Europe** or **India** | That region's two addresses. |

When the route uses Quilr outbound IPs, the console shows the addresses under the field, for example: *Calls to this provider leave from 13.206.52.65, 16.112.107.166 (India). Allowlist these addresses on the provider.*

### When you add a provider

1. Allowlist the region's two addresses on the provider first. Otherwise the test in step 4 fails.
2. Go to **Settings > AI Gateway > Models** and click **Add provider**.
3. Under **Name and credentials**, open **Network route** and select an option.
4. Click **Test & continue**. The test calls the provider over the route you selected.
5. Finish the remaining steps and save the provider.

### For an existing provider

1. Allowlist the new region's addresses on the provider first.
2. Go to **Settings > AI Gateway > Models** and open the provider from the **Providers** tab.
3. On the **Connection** tab, click **Change** in the **Network route** card.
4. Select an option under **Network route**.
5. Click **Test**. The test sends a request to the provider over the new route.
6. When the test passes, click **Save**. If your organization reviews changes, click **Submit for approval** instead.

Until you save, the provider keeps its current route. If you change the route after testing, test again before you save.

## Which providers can use outbound IPs

A provider can use Quilr outbound IPs when:

- **Its endpoint is public and uses `https` on port 443.** Providers you don't enter an endpoint for, such as OpenAI or Amazon Bedrock, qualify.
- **It isn't linked to a [remote connector](./remote-connectors) or a [GPU server](./gpu-connectors).** A provider has one network route.
- **It isn't a Quilr SDK or Copilot Studio provider.** These have no endpoint of their own for the gateway to call.

A private endpoint, such as `10.0.0.5`, `192.168.1.20`, `localhost` or a name ending in `.internal` or `.local`, can't use outbound IPs. Use a [remote connector](./remote-connectors) to reach it instead.

## Good to know

- **Only calls to your provider use these addresses.** This includes requests, tests and model discovery.
- **There is no fallback.** If a call can't go through the chosen region, it fails with `503 egress_proxy_unreachable`. It is never sent directly instead.

## Set it up with the Management API

Read the current default and the address list:

```bash
curl --fail-with-body \
  "$MANAGEMENT_URL/llmgateway/management/v1/egress-proxy" \
  --header "Authorization: Bearer $MANAGEMENT_KEY"
```

The response lists every region with its `code`, `name` and `ips`. Region codes are `us`, `eu` and `in`.

Turn on the default for all providers, in Europe (needs the `config:write` scope):

```bash
curl --fail-with-body --request PUT \
  "$MANAGEMENT_URL/llmgateway/management/v1/egress-proxy" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"enabled": true, "region": "eu"}'
```

Send `{"enabled": false}` to turn it off.

Set one provider's route with `use_egress_proxy` in its `provider_settings` (needs the `providers:write` scope and the provider's current version in `If-Match`):

```bash
curl --fail-with-body --request PATCH \
  "$MANAGEMENT_URL/llmgateway/management/v1/providers/azure-prod" \
  --header "Authorization: Bearer $MANAGEMENT_KEY" \
  --header 'Content-Type: application/json' \
  --header "If-Match: \"$PROVIDER_VERSION\"" \
  --data '{"provider_settings": {"use_egress_proxy": "in"}}'
```

| `use_egress_proxy` | Route |
|--------------------|-------|
| `"us"`, `"eu"` or `"in"` | Quilr outbound IPs in that region |
| `true` | Quilr outbound IPs in the region of the default |
| `false` | Direct from Quilr gateway servers |
| `null` or omitted | Organization default |

Full request and response fields: [Providers and configuration API](../api-reference/providers-and-configuration-api#outbound-ips).

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| The provider rejects calls with `403` after you turn this on | Only one of the region's addresses is allowlisted, or the provider allowlists another region. | Allowlist both addresses of the region the provider uses. The **Network route** card shows them. |
| **Save** stays disabled and the drawer says **Choose a region to save.** | **Use Quilr outbound IPs** is on, but no region is selected. | Select a region. |
| **Network route** says **Quilr outbound IPs need an https endpoint on port 443.** | The provider's endpoint uses `http` or another port. | Use the provider's `https` endpoint on port 443. |
| **Network route** says **Quilr outbound IPs reach public hosts only; use a remote connector for a private endpoint.** | The endpoint is a private address. | Use a [remote connector](./remote-connectors). |
| Calls fail with `503 egress_proxy_unreachable` | The gateway can't reach the chosen region. | Try again shortly. If it continues, contact QuilrAI support. |

## Related

- [Providers and Models](./providers-and-models) - add and configure providers.
- [Remote connectors](./remote-connectors) - reach a private endpoint through an outbound tunnel.
- [GPU connectors](./gpu-connectors) - run a provider's calls on your own GPU servers.
