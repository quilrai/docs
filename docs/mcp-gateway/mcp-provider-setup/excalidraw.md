---
sidebar_position: 13
sidebar_custom_props:
  icon: PenTool
---

# Excalidraw

**Excalidraw** is an open-source virtual whiteboard for hand-drawn style diagrams. Excalidraw does not publish an official hosted MCP endpoint, so you connect it through the community **Excalidraw MCP server** ([`mcp-excalidraw-server`](https://github.com/yctimlin/mcp_excalidraw)), which you self-host alongside a live canvas UI. Agents create and edit diagram elements through MCP tools while you watch the canvas update in real time.

Unlike Slack and GitHub, you do **not** create an OAuth app or provide a Client ID and Client Secret for Excalidraw. Like [Zoho](./zoho), you add the MCP server URL to QuilrAI manually.

See [Overview](./overview) for prerequisites and secret-handling guidance.

## How Excalidraw Differs

- **No OAuth credentials.** The Excalidraw MCP server has no built-in authentication, so there is no Client ID or Client Secret to create or paste into QuilrAI. Access control comes from your network and from the gateway's [access controls](../features/access-control).
- **Self-hosted.** There is no vendor-hosted endpoint. You run the MCP server and its canvas yourself (Node.js or Docker) and expose it to the gateway.
- **stdio transport by default.** The server speaks MCP over stdio. QuilrAI registers MCPs by a transport URL ending in `/sse` or `/mcp`, so you put a stdio-to-HTTP bridge such as [Supergateway](https://github.com/supercorp-ai/supergateway) in front of it.

## What This MCP Can Do

The server exposes 26 tools:

| Capability | Tools | Access |
|------------|-------|--------|
| Create, read, update, and delete elements | `create_element`, `get_element`, `update_element`, `delete_element`, `query_elements`, `batch_create_elements`, `duplicate_elements` | Read and write |
| Arrange and organize elements | `align_elements`, `distribute_elements`, `group_elements`, `ungroup_elements`, `lock_elements`, `unlock_elements` | Write |
| Inspect the scene | `describe_scene`, `get_canvas_screenshot` | Read only |
| Import and export | `export_scene`, `import_scene`, `export_to_image`, `export_to_excalidraw_url`, `create_from_mermaid` | Read and write |
| Manage canvas state | `clear_canvas`, `snapshot_scene`, `restore_snapshot` | Write |
| Control the viewport | `set_viewport` | Write |
| Reference material | `read_diagram_guide`, `get_resource` | Read only |

`create_from_mermaid` converts Mermaid diagram source into Excalidraw elements, which is the fastest way for an agent to draw architecture and flow diagrams. `clear_canvas` and `restore_snapshot` are destructive; consider disabling them with [Tools Management](../features/tools-management) if agents only need to draw.

## Deploy The Excalidraw MCP Server

1. On the host that will run the whiteboard, start the canvas and MCP server. The npm package starts both; the canvas listens on port `3000` by default:

   ```bash
   npx -y mcp-excalidraw-server
   ```

   Docker images are also published: `ghcr.io/yctimlin/mcp_excalidraw:latest` (MCP server) and `ghcr.io/yctimlin/mcp_excalidraw-canvas:latest` (canvas).

2. Bridge the stdio MCP server to streamable HTTP with Supergateway:

   ```bash
   npx -y supergateway \
     --stdio "npx -y mcp-excalidraw-server" \
     --outputTransport streamableHttp \
     --port 8000
   ```

   The MCP endpoint is now `http://<host>:8000/mcp`.

3. Make the endpoint reachable from the QuilrAI gateway over HTTPS - for example behind your reverse proxy or an internal load balancer. Do not expose it to the public internet unprotected; the server has no authentication of its own.

4. In QuilrAI, go to the **MCP Gateway** tab, click **Add MCP**, and paste the `/mcp` URL manually. No OAuth authorization step is required.

5. Open the canvas UI (`http://<host>:3000`) in a browser, then ask a connected agent to draw something - for example "create a flowchart of our deployment pipeline" - and confirm the elements appear on the canvas in real time.

### Configuration

| Environment variable | Purpose |
|----------------------|---------|
| `EXPRESS_SERVER_URL` | Canvas server URL the MCP server syncs to. Default `http://127.0.0.1:3000`. |
| `ENABLE_CANVAS_SYNC` | Real-time sync of element changes to the canvas. Default `true`. |
| `EXCALIDRAW_NO_AUTOSTART` | Prevents the MCP server from auto-starting the canvas, for when the canvas runs as its own service or container. |
| `EXCALIDRAW_EXPORT_DIR` | Base directory for files written by the export tools. |
| `PORT`, `HOST` | Canvas bind address. The canvas binds to `127.0.0.1` by default. |

## Keep In Mind

- **No built-in authentication.** Anyone who can reach the bridged endpoint can drive the canvas. Keep it on a private network, terminate TLS in front of it, and restrict who can use the MCP with the gateway's [access controls](../features/access-control) and [agent configuration](../features/agents-configuration).
- **The canvas is shared state.** All connected agents and browsers see and edit the same scene. Use `snapshot_scene` before risky operations, and consider disabling `clear_canvas` for agent use.
- **One canvas per server.** To give teams isolated whiteboards, run separate instances (or containers) and add each one to QuilrAI as its own MCP.
- **Exports land on the server host.** `export_to_image` and `export_scene` write files under `EXCALIDRAW_EXPORT_DIR` on the machine running the MCP server, not on the agent's machine.

## Troubleshooting

| Error | Likely cause | Fix |
|-------|--------------|-----|
| Gateway cannot connect to the URL | The Supergateway bridge is not running, or the URL does not end in `/mcp`. | Confirm the bridge process is up, then re-copy the full endpoint URL including the `/mcp` path into QuilrAI. |
| Tools succeed but nothing appears on the canvas | The canvas server is not running, or the MCP server cannot reach it. | Start the canvas, and set `EXPRESS_SERVER_URL` to the canvas URL reachable from the MCP server. Check `ENABLE_CANVAS_SYNC` is not set to `false`. |
| Canvas only reachable from localhost | The canvas binds to `127.0.0.1` by default. | Set `HOST=0.0.0.0` (or front it with a reverse proxy) and open the port to your users' network only. |
| Connection drops mid-session | The bridge ran in stateless mode and the session timed out. | Run Supergateway with `--stateful` and a suitable `--sessionTimeout`. |

## References

- [Excalidraw MCP server (yctimlin/mcp_excalidraw)](https://github.com/yctimlin/mcp_excalidraw)
- [`mcp-excalidraw-server` on npm](https://www.npmjs.com/package/mcp-excalidraw-server)
- [Supergateway: expose stdio MCP servers over HTTP](https://github.com/supercorp-ai/supergateway)
- [Excalidraw](https://excalidraw.com)
