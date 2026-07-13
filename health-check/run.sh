#!/usr/bin/env bash
# Starts the four gateway-health processes as tmux windows: two test doubles, the probe worker, and the rollup reader.
# MCP_GATEWAY_BASE_URL must point at an mcpgateway instance with the /internal/gateway-health routes (quilr-llm-gateway repo).
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION="gateway-health"
VENV="$HERE/.venv"

if [ -z "${GATEWAY_HEALTH_INTERNAL_TOKEN:-}" ]; then
  echo "GATEWAY_HEALTH_INTERNAL_TOKEN must be set (matching the target gateway's own env var) - not defaulted here since this repo is public." >&2
  exit 1
fi

if [ -z "${GATEWAY_HEALTH_DB_PATH:-}" ]; then
  echo "GATEWAY_HEALTH_DB_PATH must be set to the target MCP Gateway's mcpgateway/data/gateway.db - not defaulted here since this repo is public." >&2
  exit 1
fi

if [ ! -d "$VENV" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q -r "$HERE/requirements.txt"
fi

export GATEWAY_HEALTH_INTERNAL_TOKEN
export GATEWAY_HEALTH_DB_PATH
export GATEWAY_HEALTH_TENANT_ID="${GATEWAY_HEALTH_TENANT_ID:-gateway-health-test}"
export GATEWAY_HEALTH_SUBSCRIBER_ID="${GATEWAY_HEALTH_SUBSCRIBER_ID:-gateway-health-test}"
export MCP_GATEWAY_BASE_URL="${MCP_GATEWAY_BASE_URL:-http://127.0.0.1:8006}"
export LLM_GATEWAY_BASE_URL="${LLM_GATEWAY_BASE_URL:-http://127.0.0.1:8000}"
export GATEWAY_HEALTH_INTERVAL_SECONDS="${GATEWAY_HEALTH_INTERVAL_SECONDS:-60}"

tmux new-session -d -s "$SESSION" -n synthetic-llm "cd '$HERE' && '$VENV/bin/python3' synthetic_llm_provider.py"
tmux new-window -t "$SESSION" -n synthetic-mcp "cd '$HERE' && '$VENV/bin/python3' synthetic_mcp_backend.py"
tmux new-window -t "$SESSION" -n rollup-server "cd '$HERE' && '$VENV/bin/python3' rollup_server.py"
sleep 2
tmux new-window -t "$SESSION" -n worker "cd '$HERE' && '$VENV/bin/python3' worker.py"

echo "Started tmux session '$SESSION' with windows: synthetic-llm, synthetic-mcp, rollup-server, worker"
echo "Attach with: tmux attach -t $SESSION"
