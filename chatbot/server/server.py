import httpx
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models import Content, GenerationRequest
from configs import HEADERS, GEN_URL, STREAM_URL, SYSTEM_MESSAGE, TOOLS_DECLARATION, SSE_SERVER_MAP
import json
from connection_manager import ConnectionManager
from contextlib import asynccontextmanager

def parse_function_call(data: str):
    try:
        parsed = json.loads(data)
        candidates = parsed.get("candidates", [])
        if not candidates:
            return None

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
           return None

        if "functionCall" in parts[0]:
            return parts[0]["functionCall"]
        return None
    except Exception:
        return None

@asynccontextmanager
async def lifespan(app: FastAPI):
    conn_manager = ConnectionManager(SSE_SERVER_MAP)
    await conn_manager.initialize()
    app.state.conn_manager = conn_manager

    tool_map, _ = await conn_manager.list_tools()
    app.state.tool_map = tool_map

    yield  # ứng với khi app đang chạy

    await conn_manager.close()  # ứng với khi app tắt

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc thay bằng ["http://localhost:5500"] nếu muốn giới hạn
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả HTTP methods, bao gồm OPTIONS
    allow_headers=["*"],
)

@app.get("/")
async def hello_world():
    return "hello world"

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/generate")
async def generate(request_body: GenerationRequest):
    request_body_dict = request_body.model_dump()

    request_body_dict["system_instruction"] = {
        "parts": [{ "text": SYSTEM_MESSAGE }]
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(GEN_URL, headers=HEADERS, json=request_body_dict)
        return JSONResponse(content=res.json())

@app.post("/stream")
async def stream(request_body: GenerationRequest):
    request_body_dict = request_body.model_dump()

    request_body_dict["system_instruction"] = {
        "parts": [{ "text": SYSTEM_MESSAGE }]
    }
    request_body_dict["tools"] = TOOLS_DECLARATION

    async def event_stream():
        buffer = []
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", STREAM_URL, headers=HEADERS, json=request_body_dict) as response:
                if response.status_code != 200:
                    error_msg = await response.aread()
                    yield f"data: {error_msg.decode()}\n\n"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line.removeprefix("data: ").strip()

                        if data == "[DONE]":
                            break

                        buffer.append(data)

                        # Kiểm tra function call
                        function_call = parse_function_call(data)
                        
                        if function_call:

                            yield f"data: {json.dumps({'functionCall': function_call})}\n\n"

                            # Ngắt stream -> Gọi tool

                            tool_result = await app.state.conn_manager.call_tool(function_call['name'], function_call['args'], app.state.tool_map)

                            yield f"data: {json.dumps({'functionResponse': {'name': function_call['name'], 'response': {'result': tool_result}}}, ensure_ascii=False)}\n\n"

                            # Gửi lại kết quả tool cho model để generate response
                            request_body_dict.pop("tools", None)
                            request_body_dict["contents"].append({
                                "role": "model",
                                "parts": [
                                    {
                                        "functionCall": function_call
                                    }
                                ]
                            })
                            request_body_dict["contents"].append({
                                "role": "user",
                                "parts": [
                                    {
                                        "functionResponse": {"name": function_call["name"], "response": {"result": tool_result}} 
                                    }
                                ]
                            })

                            async with client.stream("POST", STREAM_URL, headers=HEADERS, json=request_body_dict) as response:
                                if response.status_code != 200:
                                    error_msg = await response.aread()
                                    yield f"data: {error_msg.decode()}\n\n"
                                    return
                                
                                async for line in response.aiter_lines():
                                    if line.startswith("data: "):
                                        data = line.removeprefix("data: ").strip()
                                        if data != "[DONE]":
                                            yield f"data: {data}\n\n"

                        else:
                            # Nếu không phải tool, stream bình thường
                            yield f"data: {data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
    
if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000)