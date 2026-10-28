---
sidebar_position: 2.5
sidebar_label: "Remote connectors"
sidebar_custom_props:
  icon: Route
description: "Connect private LLM endpoints to the LLM Gateway through an outbound tunnel using the shared Quilr remote connector."
console_path: []
aliases: [remote connectors, private models, private endpoints, self-hosted models]
---

# Remote Connectors

Connect an LLM endpoint running in a private network, VPC, Kubernetes cluster, or on your laptop to the QuilrAI LLM Gateway. The connector opens an outbound WebSocket tunnel (`wss://`), so the model endpoint does not need public ingress or inbound firewall rules.

The process is the same as [MCP Gateway remote connectors](../../mcp-gateway/servers-and-connections/remote-connectors), using the same `quilr-connector` binaries and container image.

## 1. Create a connector

1. Go to **Settings > AI Gateway > LLM Gateway** and open **Remote Connectors**.
2. Create a remote connector and give it a name, such as `private-models`.
3. Copy the generated `qrc_...` token.

:::warning
The token is shown once. Save it in your secret manager or environment configuration. It includes the gateway address, so no separate gateway URL is needed.
:::

## 2. Download and run the connector

Run the connector somewhere that can reach your model endpoint and make an outbound connection to the gateway. Choose a binary, Docker, or Kubernetes deployment.

### Binaries

Download and extract the archive for your platform from [GitHub Releases](https://github.com/quilrai/quilr-remote-connector/releases/latest). These are the same downloads used for MCP Gateway:

| Platform | Architecture | Download |
|----------|--------------|----------|
| Linux | x86_64 (`amd64`) | [Linux x86_64](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-unknown-linux-musl.tar.gz) |
| Linux | ARM64 (`aarch64`) | [Linux ARM64](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-aarch64-unknown-linux-musl.tar.gz) |
| macOS | Apple Silicon | [macOS ARM64](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-aarch64-apple-darwin.tar.gz) |
| macOS | Intel (`x86_64`) | [macOS Intel](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-apple-darwin.tar.gz) |
| Windows | x86_64 | [Windows x86_64](https://github.com/quilrai/quilr-remote-connector/releases/latest/download/quilr-connector-x86_64-pc-windows-msvc.zip) |

On macOS or Linux:

```bash
./quilr-connector --token qrc_your_token_here
```

On Windows (PowerShell):

```powershell
.\quilr-connector.exe --token qrc_your_token_here
```

To run it in the background as a service that starts at boot on Linux:

```bash
sudo ./quilr-connector service install --token qrc_your_token_here
sudo quilr-connector service logs -f
```

See [MCP Gateway remote connectors](../../mcp-gateway/servers-and-connections/remote-connectors#virtual-machine-linux-vm-ec2-or-gce) for service management, [logs](../../mcp-gateway/servers-and-connections/remote-connectors#logs), and [sizing](../../mcp-gateway/servers-and-connections/remote-connectors#sizing).

### Docker

Use the shared container image, available for `linux/amd64` and `linux/arm64`:

```bash
docker run -d \
  --name quilr-llm-connector \
  --restart unless-stopped \
  -e QUILR_CONNECTOR_TOKEN="qrc_your_token_here" \
  ghcr.io/quilrai/quilr-connector:latest
```

If the model runs on the Docker host, use `http://host.docker.internal:<port>/v1` as its base URL on macOS or Windows. On Linux, add `--network host` to the command and use `http://127.0.0.1:<port>/v1`. Adjust the port and path for your model server.

### Kubernetes

Deploy the connector in a cluster that can reach the model service. Save the following as `quilr-llm-connector.yaml`, replacing the placeholder token:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: quilr-llm-connector-token
type: Opaque
stringData:
  QUILR_CONNECTOR_TOKEN: "qrc_your_token_here"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quilr-llm-connector
spec:
  replicas: 1
  selector:
    matchLabels:
      app: quilr-llm-connector
  template:
    metadata:
      labels:
        app: quilr-llm-connector
    spec:
      containers:
        - name: quilr-connector
          image: ghcr.io/quilrai/quilr-connector:latest
          env:
            - name: QUILR_CONNECTOR_TOKEN
              valueFrom:
                secretKeyRef:
                  name: quilr-llm-connector-token
                  key: QUILR_CONNECTOR_TOKEN
```

Apply it in your chosen namespace:

```bash
kubectl apply -n <namespace> -f quilr-llm-connector.yaml
```

Use your normal secret management process for the token in production.

## 3. Route a provider through the connector

Once the connector shows **Connected** in the console:

1. Open **Provider configuration** in LLM Gateway and add or configure the provider for your model endpoint. For an OpenAI-compatible model server, use **Custom endpoint** with **Chat completions**. See [Providers and Models](./providers-and-models).
2. Enter the model endpoint's private **Base URL**, credentials, and model IDs.
3. Under **Connection route**, select **Via Remote Connector** and choose your connector.
4. Save the provider and link it to an app.

The base URL must be reachable from the connector. For example:

| Model location | Example base URL |
|----------------|------------------|
| Same machine as the connector | `http://127.0.0.1:8000/v1` |
| Private network | `https://models.internal.example.com/v1` |
| Kubernetes service | `http://model-server.inference.svc.cluster.local:8000/v1` |

Your application continues to call the LLM Gateway with its Quilr key. Send a test request using the [Quick Start](../get-started/quick-start), then check the app's logs to confirm the request succeeds.

## Related

- [Providers and Models](./providers-and-models) - configure providers and link them to apps.
- [Provider Support](./provider-support) - choose the provider type and credentials for your endpoint.
- [MCP Gateway remote connectors](../../mcp-gateway/servers-and-connections/remote-connectors) - the equivalent setup for private MCP servers and APIs.
