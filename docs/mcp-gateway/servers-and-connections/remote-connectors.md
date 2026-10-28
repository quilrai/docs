---
sidebar_position: 2
sidebar_label: "Remote connectors"
sidebar_custom_props:
  icon: Route
description: "Connect MCP servers and internal REST APIs running inside private networks, VMs, Kubernetes clusters, or developer laptops to the gateway over an outbound WebSocket tunnel with no inbound firewall rules."
---

# Remote Connectors

Connect MCP servers and internal REST APIs running inside a private network, VPC, Kubernetes cluster, or developer laptop to the Quilr MCP Gateway over an outbound WebSocket tunnel (`wss://`) with no inbound firewall rules or public ingress.

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
    label: "3. Add the MCP server or API",
    items: [
      "Connection route > Via Remote Connector",
      "Enter the private or localhost URL",
    ],
  },
]} />

## 1. Create a Remote Connector in the console

1. Go to **Settings > AI Gateway > MCP Gateway** and click **Remote Connectors**.
2. Click **New remote connector**, enter a **Name** (for example `prod-eks` or `dev-laptop`), and optionally add a **Description**.
3. Click **Create connector** and copy the generated `qrc_...` token.

:::warning
The `qrc_...` token is shown once. Save it in your secret manager or environment configuration. It encodes your gateway URL automatically, so no separate URL flag is needed.
:::

## 2. Download and run `quilr-connector`

Download the latest stable binary from [GitHub Releases](https://github.com/quilrai/quilr-remote-connector/releases/latest) or pull the multi-arch container image (`ghcr.io/quilrai/quilr-connector:latest`). The download links below automatically follow each new stable release:

| Platform | Architecture | Direct download (`latest`) |
|----------|--------------|----------------------------|
| **Linux** | x86_64 (`amd64`, static musl) | [quilr-connector-x86_64-unknown-linux-musl.tar.gz](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-unknown-linux-musl.tar.gz) |
| **Linux** | ARM64 (`aarch64`, static musl) | [quilr-connector-aarch64-unknown-linux-musl.tar.gz](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-aarch64-unknown-linux-musl.tar.gz) |
| **macOS** | Apple Silicon (`M1` / `M2` / `M3` / `M4`) | [quilr-connector-aarch64-apple-darwin.tar.gz](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-aarch64-apple-darwin.tar.gz) |
| **macOS** | Intel (`x86_64`) | [quilr-connector-x86_64-apple-darwin.tar.gz](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-apple-darwin.tar.gz) |
| **Windows** | x86_64 (`.zip`) | [quilr-connector-x86_64-pc-windows-msvc.zip](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-pc-windows-msvc.zip) |
| **Docker** | `linux/amd64`, `linux/arm64` | `docker pull ghcr.io/quilrai/quilr-connector:latest` |

### Laptop or dev machine

Expose MCP servers or local REST APIs running on `localhost` (macOS, Linux, or Windows) directly to the gateway for testing or personal development.

**Direct binary (macOS / Linux one-liner):**

```bash
# macOS (Apple Silicon) - replace target for Intel macOS or Linux
curl -fsSL https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-aarch64-apple-darwin.tar.gz | tar -xz
./quilr-connector --token qrc_your_token_here
```

**Windows (PowerShell):**

```powershell
Invoke-WebRequest -Uri "https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-pc-windows-msvc.zip" -OutFile quilr-connector.zip
Expand-Archive -Force quilr-connector.zip .
.\quilr-connector.exe --token qrc_your_token_here
```

**Docker:**

```bash
docker run --rm \
  -e QUILR_CONNECTOR_TOKEN="qrc_your_token_here" \
  ghcr.io/quilrai/quilr-connector:latest
```

:::tip
When running `quilr-connector` inside Docker on macOS or Windows, use `http://host.docker.internal:<port>/mcp` (or `http://host.docker.internal:<port>/v1` for a REST API) so the container can reach a service listening on your host's `localhost`. On Linux, pass `--network host` to `docker run` and use `http://127.0.0.1:<port>/...`.
:::

### Virtual Machine (Linux VM, EC2, or GCE)

Run `quilr-connector` on a VM inside your VPC or private subnet to reach any MCP server or internal REST API on `127.0.0.1` or your internal VPC network.

**Install binary to `/usr/local/bin` (Linux x86_64):**

```bash
curl -fsSL https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-unknown-linux-musl.tar.gz \
  | sudo tar -xz -C /usr/local/bin quilr-connector
```

**Docker (with automatic restart):**

```bash
docker run -d \
  --name quilr-connector \
  --restart unless-stopped \
  -e QUILR_CONNECTOR_TOKEN="qrc_your_token_here" \
  ghcr.io/quilrai/quilr-connector:latest
```

**Run as a service (starts at boot, restarts on failure):**

```bash
sudo quilr-connector service install --token qrc_your_token_here
sudo quilr-connector service status
sudo quilr-connector service logs -f
```

`service install` writes the token to `/etc/quilr-connector/connector.env` (readable only by root) and installs a sandboxed `quilr-connector` systemd unit. It also accepts every flag in the [configuration reference](#configuration-reference), for example `--instance-name`. The other subcommands are `start`, `stop`, `restart`, and `uninstall`.

- **Upgrade:** download the new binary and re-run `sudo ./quilr-connector service install`. Existing settings are kept unless you pass `--token`.
- **Without `sudo`:** installs a per-user service instead. Run `sudo loginctl enable-linger $USER` so it starts at boot.
- **macOS:** the same commands manage a launchd agent. Logs go to `~/Library/Logs/quilr-connector/`.

### Kubernetes cluster

One connector Deployment in your cluster can reach any MCP service or internal REST API across namespaces using standard cluster DNS (`http://<service>.<namespace>.svc.cluster.local:<port>/mcp` or `http://<api-service>.<namespace>.svc.cluster.local:<port>/v1`). Run 2 or more replicas for high availability.

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
          image: ghcr.io/quilrai/quilr-connector:latest
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

## 3. Add the MCP server or REST API via the Remote Connector

Once your connector shows **Connected** in **Remote Connectors**, you can route either a **Remote server** or an **API** (REST API to MCP) through it.

### Remote MCP server

1. Click **Add MCP server** and choose **Remote server**.
2. Enter the server's internal **Transport URL**:
   - Localhost / VM: `http://127.0.0.1:8000/mcp` (or `http://host.docker.internal:8000/mcp` when the connector runs in Docker on macOS/Windows)
   - Private VPC host: `http://10.0.12.45:8000/mcp` or `https://mcp.internal.example.com/mcp`
   - Kubernetes service: `http://my-mcp.namespace.svc.cluster.local:8000/mcp`
3. Under **Connection route**, select **Via Remote Connector: `<name>`**.
4. Choose how the gateway signs in and click **Probe and continue**.

All capability probes, OAuth discovery and token exchanges, [OneMCP](../get-started/onemcp) calls, and direct MCP tool calls for that server route through the selected Remote Connector.

### Internal REST API (API to MCP)

1. Click **Add MCP server** and choose **API**.
2. Enter the internal **Base URL**:
   - Localhost / VM: `http://127.0.0.1:8080/v1` (or `http://host.docker.internal:8080/v1` when the connector runs in Docker on macOS/Windows)
   - Private VPC host: `http://10.0.12.45:8080/v1` or `https://api.internal.example.com/v1`
   - Kubernetes service: `http://api-service.default.svc.cluster.local:8080/v1`
3. Under **Connection route**, select **Via Remote Connector: `<name>`**.
4. Under **OpenAPI spec**, load a spec by **URL** (fetched directly through the Remote Connector tunnel), **Upload**, or **Paste**, or choose **None** for generic HTTP tools.
5. Configure **Credentials** and **Tools & access**, then click **Create API MCP**.

All OpenAPI spec previews, spec resyncs, [OneMCP](../get-started/onemcp) calls, and runtime REST tool calls (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`) route through the selected Remote Connector. See [Turn an API into MCP tools](./api-to-mcp).

## Configuration reference

| Flag | Environment variable | Default | Description |
|------|----------------------|---------|-------------|
| `--token` | `QUILR_CONNECTOR_TOKEN` | Required | Self-contained `qrc_...` connector token from the console |
| `--instance-name` | `QUILR_CONNECTOR_INSTANCE_NAME` | System hostname | Instance or pod label shown in the **Remote Connectors** drawer |
| `--insecure-skip-tls-verify` | `QUILR_CONNECTOR_INSECURE_TLS` | `false` | Skip TLS certificate verification for internal HTTPS MCP servers or REST APIs with self-signed certs |
| `--gateway-url` | `QUILR_GATEWAY_URL` | Decoded from token | Optional override for the gateway base URL |
| `--ping-interval-secs` | `QUILR_CONNECTOR_PING_INTERVAL_SECS` | `20` | Heartbeat ping interval in seconds (minimum `5`) |
| `--log-level` | `QUILR_LOG_LEVEL` | `info` | `error`, `warn`, `info`, or `debug` |
| `--log-format` | `QUILR_LOG_FORMAT` | `auto` | `json`, `text`, or `auto` (text on a terminal, JSON otherwise) |
| `--log-file` | `QUILR_LOG_FILE` | stdout | Write logs to a file, rotated daily with 7 files kept. For the system service, use a path under `/var/log/quilr-connector/` |
| `--heartbeat-log-secs` | `QUILR_HEARTBEAT_LOG_SECS` | `300` | Interval for the status summary log line (`0` disables it) |

Upstream HTTPS servers are verified against both the bundled public roots and the system CA store (for example `/etc/ssl/certs`), so internal CAs installed on the host are trusted.

## Logs

The connector writes one JSON object per line, each with an `event` field. Logs never include the token, request or response headers, bodies, or query strings. URL paths are only logged at `debug` level.

| `event` | Meaning |
|---------|---------|
| `startup`, `connected`, `shutdown`, `stopped` | Lifecycle |
| `connect_failed`, `disconnected`, `auth_rejected` | Gateway connectivity problems, with `reason` and `retry_in_ms` |
| `request` | One line per forwarded call: `method`, `target` (host:port), `status`, `duration_ms`, `bytes`, `sse`, `outcome` (`ok`, `cancelled`, `error`), and `error_kind` on failure |
| `request_rejected` | The 128 concurrent stream limit was reached |
| `heartbeat` | Every 5 minutes: `connected`, `active_streams`, and `requests`, `errors`, and `disconnects` since the previous heartbeat |

```json
{"timestamp":"2026-10-28T10:01:02.123456Z","level":"INFO","message":"Request completed","event":"request","method":"POST","target":"mcp.internal:8080","status":200,"duration_ms":184,"bytes":912,"sse":false,"outcome":"ok"}
```

## Sizing

Use **2 vCPU and 3 GB RAM** per connector instance. If requests never carry multi-megabyte bodies, 1 vCPU and 1 GB is enough.

| Load | Peak memory | CPU |
|------|-------------|-----|
| Idle, connected | 5 MiB | ~0% |
| Small JSON requests, 128 concurrent (~30k requests/s) | 14 MiB | 2 cores |
| 128 open SSE streams | 16 MiB | under 1% of a core |
| Worst case: 128 concurrent 16 MB uploads to a slow upstream | ~2.1 GiB | - |

Typical MCP, REST, and LLM traffic uses well under one core. The worst case is bounded by the 16 MB request body and 128 concurrent stream limits. The Kubernetes example above caps memory at `256Mi`, which suits small JSON traffic; raise it to `3Gi` if large uploads are expected.

## High availability, token rotation, and limits

| Capability | Behavior |
|------------|----------|
| **High availability** | Run multiple `quilr-connector` replicas with the same `qrc_...` token. The gateway distributes requests across healthy replicas and automatically fails over subsequent requests if a replica disconnects. |
| **Token rotation & revocation** | Rotate a connector's token or delete the connector anytime from the **Remote Connectors** drawer. Rotating or revoking immediately disconnects active sessions using the old token. |
| **Fail-closed routing** | Traffic for an MCP server or API backend bound to a Remote Connector never falls back to the public internet if the connector is offline or deleted. |
| **Supported transports** | Outbound-only WebSocket (`wss://`) carrying MCP Streamable HTTP (`POST`, `GET`, `DELETE`), SSE upstreams, and REST API HTTP calls (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, query parameters, headers, and JSON/binary bodies). |
| **Limits** | Up to 16 MB per request body, 128 concurrent streams per connector replica, and up to 64 active replicas per connector. |

## Related

- [Adding MCP Servers](./adding-mcp-servers) - register a remote server and choose its sign-in mode.
- [Turn an API into MCP tools](./api-to-mcp) - expose an internal or public REST API as governed MCP tools.
- [MCP Library](./mcp-library#internal-mcps) - compare Remote Connectors with firewall IP allowlisting.
- [OAuth Connect](./oauth-connect) - connect OAuth servers reachable through a Remote Connector.
