---
sidebar_position: 2
sidebar_label: "Remote connectors"
sidebar_custom_props:
  icon: Route
description: "Connect MCP servers running inside private networks, VMs, Kubernetes clusters, or developer laptops to the gateway over an outbound WebSocket tunnel with no inbound firewall rules."
---

# Remote Connectors

Connect MCP servers running inside a private network, VPC, Kubernetes cluster, or developer laptop to the Quilr MCP Gateway over an outbound WebSocket tunnel (`wss://`) with no inbound firewall rules or public ingress.

<StepFlow steps={[
  {
    label: "1. Create a connector",
    items: [
      "Settings > AI Gateway > MCP Gateway > Remote Connectors",
      "Copy the qrc_... token (gateway URL is encoded inside)",
    ],
  },
  {
    label: "2. Run quilr-connector",
    items: [
      "Run on your laptop, VM, or Kubernetes cluster",
      "Opens an outbound wss:// tunnel to the gateway",
    ],
  },
  {
    label: "3. Add the MCP server",
    items: [
      "Network Path > Via Remote Connector",
      "Enter the private or localhost Transport URL",
    ],
  },
]} />

## 1. Create a Remote Connector in the console

1. Go to **Settings > AI Gateway > MCP Gateway** and click **Remote Connectors**.
2. Click **Create connector**, enter a **Name** (for example `prod-eks` or `dev-laptop`), and optionally add a **Description**.
3. Copy the generated `qrc_...` token.

:::warning
The `qrc_...` token is shown once. Save it in your secret manager or environment configuration. It encodes your gateway URL automatically, so no separate URL flag is needed.
:::

## 2. Run `quilr-connector` where your MCP servers live

### Laptop or dev machine

Expose MCP servers running on `localhost` (macOS, Linux, or Windows) directly to the gateway for testing or personal development servers.

**Direct binary:**

```bash
quilr-connector --token qrc_your_token_here
```

**Docker:**

```bash
docker run --rm \
  -e QUILR_CONNECTOR_TOKEN="qrc_your_token_here" \
  ghcr.io/quilr/quilr-remote-connector:latest
```

:::tip
When running `quilr-connector` inside Docker on macOS or Windows, use `http://host.docker.internal:<port>/mcp` as the MCP server's Transport URL so the container can reach a server listening on your host's `localhost`. On Linux, pass `--network host` to `docker run` and use `http://127.0.0.1:<port>/mcp`.
:::

### Virtual Machine (Linux VM, EC2, or GCE)

Run `quilr-connector` on a VM inside your VPC or private subnet to reach any MCP server on `127.0.0.1` or your internal VPC network.

**Docker (with automatic restart):**

```bash
docker run -d \
  --name quilr-connector \
  --restart unless-stopped \
  -e QUILR_CONNECTOR_TOKEN="qrc_your_token_here" \
  ghcr.io/quilr/quilr-remote-connector:latest
```

**`systemd` service (`/etc/systemd/system/quilr-connector.service`):**

```ini
[Unit]
Description=Quilr Remote Connector
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment="QUILR_CONNECTOR_TOKEN=qrc_your_token_here"
ExecStart=/usr/local/bin/quilr-connector
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now quilr-connector
```

### Kubernetes cluster

One connector Deployment in your cluster can reach any MCP service across namespaces using standard cluster DNS (`http://<service>.<namespace>.svc.cluster.local:<port>/mcp`). Run 2 or more replicas for high availability.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: quilr-remote-connector-secret
  namespace: default
type: Opaque
stringData:
  QUILR_CONNECTOR_TOKEN: "qrc_your_token_here"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quilr-remote-connector
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: quilr-remote-connector
  template:
    metadata:
      labels:
        app: quilr-remote-connector
    spec:
      containers:
        - name: quilr-connector
          image: ghcr.io/quilr/quilr-remote-connector:latest
          env:
            - name: QUILR_CONNECTOR_TOKEN
              valueFrom:
                secretKeyRef:
                  name: quilr-remote-connector-secret
                  key: QUILR_CONNECTOR_TOKEN
            - name: QUILR_CONNECTOR_INSTANCE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 500m
              memory: 256Mi
```

Apply the manifest:

```bash
kubectl apply -f deployment.yaml
```

## 3. Add the MCP server via the Remote Connector

Once your connector shows **Connected** in **Remote Connectors**:

1. Click **Add MCP server** and choose **Remote server**.
2. Under **Network Path**, select **Via Remote Connector** and pick your connector.
3. Enter the server's internal **Transport URL**:
   - Localhost / VM: `http://127.0.0.1:8000/mcp` (or `http://host.docker.internal:8000/mcp` when the connector runs in Docker on macOS/Windows)
   - Private VPC host: `http://10.0.12.45:8000/mcp` or `https://mcp.internal.example.com/mcp`
   - Kubernetes service: `http://my-mcp.namespace.svc.cluster.local:8000/mcp`
4. Choose how the gateway signs in and click **Probe and continue**.

All capability probes, OAuth discovery and token exchanges, [OneMCP](../get-started/onemcp) calls, and direct MCP tool calls for that server route through the selected Remote Connector.

## Configuration reference

| Flag | Environment variable | Default | Description |
|------|----------------------|---------|-------------|
| `--token` | `QUILR_CONNECTOR_TOKEN` | Required | Self-contained `qrc_...` connector token from the console |
| `--instance-name` | `QUILR_CONNECTOR_INSTANCE_NAME` | System hostname | Instance or pod label shown in the **Remote Connectors** drawer |
| `--insecure-skip-tls-verify` | `QUILR_CONNECTOR_INSECURE_TLS` | `false` | Skip TLS certificate verification for internal HTTPS MCP servers with self-signed certs |
| `--gateway-url` | `QUILR_GATEWAY_URL` | Decoded from token | Optional override for the gateway base URL |
| `--ping-interval-secs` | `QUILR_CONNECTOR_PING_INTERVAL_SECS` | `20` | Heartbeat ping interval in seconds (minimum `5`) |

## High availability, token rotation, and limits

| Capability | Behavior |
|------------|----------|
| **High availability** | Run multiple `quilr-connector` replicas with the same `qrc_...` token. The gateway distributes requests across healthy replicas and automatically fails over subsequent requests if a replica disconnects. |
| **Token rotation & revocation** | Rotate a connector's token or delete the connector anytime from the **Remote Connectors** drawer. Rotating or revoking immediately disconnects active sessions using the old token. |
| **Fail-closed routing** | Traffic for an MCP server bound to a Remote Connector never falls back to the public internet if the connector is offline or deleted. |
| **Supported transports** | Outbound-only WebSocket (`wss://`) carrying both MCP Streamable HTTP (`POST`, `GET`, `DELETE`) and SSE upstreams. |
| **Limits** | Up to 16 MB per request body, 128 concurrent streams per connector replica, and up to 64 active replicas per connector. |

## Related

- [Adding MCP Servers](./adding-mcp-servers) - register a remote server and choose its sign-in mode.
- [MCP Library](./mcp-library#internal-mcps) - compare Remote Connectors with firewall IP allowlisting.
- [OAuth Connect](./oauth-connect) - connect OAuth servers reachable through a Remote Connector.
