import asyncio
import logging

from fastmcp import FastMCP

logger = logging.getLogger(__name__)

mcp = FastMCP("Quilr Synthetic Health Backend")


@mcp.tool()
def health_echo(message="ok"):
    return {"ok": True, "message": message}


@mcp.tool()
async def slow_tool(seconds=0.5):
    await asyncio.sleep(float(seconds))
    return {"ok": True, "slept_seconds": float(seconds)}


@mcp.tool()
def error_tool(message="synthetic failure"):
    logger.error("Synthetic MCP error requested: %s", message)
    raise RuntimeError(message)


if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    uvicorn.run(mcp.http_app(), host="0.0.0.0", port=8011)
