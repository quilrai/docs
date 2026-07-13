import asyncio
import json
import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse

logger = logging.getLogger(__name__)

MODEL_FAST = "quilr-synthetic-fast"
MODEL_SLOW = "quilr-synthetic-slow"
MODEL_ERROR = "quilr-synthetic-error"
SYNTHETIC_CONTENT = "synthetic-health-ok"

app = FastAPI(title="Quilr Synthetic LLM Provider")


def _model_payload(model_id):
    return {
        "id": model_id,
        "object": "model",
        "created": 0,
        "owned_by": "quilr-health",
    }


def _completion_id():
    return f"chatcmpl-synthetic-{uuid.uuid4().hex[:12]}"


def _chat_completion_response(model):
    return {
        "id": _completion_id(),
        "object": "chat.completion",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": SYNTHETIC_CONTENT,
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": 1,
            "completion_tokens": 3,
            "total_tokens": 4,
        },
    }


def _stream_chunk(model, content=None, finish_reason=None):
    delta = {}
    if content is not None:
        delta["content"] = content
    return {
        "id": _completion_id(),
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": delta,
                "finish_reason": finish_reason,
            }
        ],
    }


async def _stream_chat(model):
    for chunk in ["synthetic", "-health", "-ok"]:
        if model == MODEL_SLOW:
            await asyncio.sleep(0.15)
        yield f"data: {json.dumps(_stream_chunk(model, content=chunk))}\n\n"
    yield f"data: {json.dumps(_stream_chunk(model, finish_reason='stop'))}\n\n"
    yield "data: [DONE]\n\n"


@app.get("/v1/models")
@app.get("/models")
async def list_models():
    return {
        "object": "list",
        "data": [
            _model_payload(MODEL_FAST),
            _model_payload(MODEL_SLOW),
            _model_payload(MODEL_ERROR),
        ],
    }


@app.post("/v1/chat/completions")
@app.post("/chat/completions")
async def chat_completions(request: Request):
    payload = await request.json()
    model = payload.get("model") or MODEL_FAST
    if model == MODEL_ERROR:
        logger.error("Synthetic LLM error model requested")
        return JSONResponse(
            status_code=503,
            content={
                "error": {
                    "message": "synthetic health provider forced failure",
                    "type": "synthetic_health_error",
                    "code": "synthetic_health_error",
                }
            },
        )

    if model == MODEL_SLOW and not payload.get("stream"):
        await asyncio.sleep(0.35)

    if payload.get("stream"):
        return StreamingResponse(_stream_chat(model), media_type="text/event-stream")

    return _chat_completion_response(model)


if __name__ == "__main__":
    import uvicorn

    logging.basicConfig(level=logging.INFO)
    uvicorn.run(app, host="0.0.0.0", port=8010)
