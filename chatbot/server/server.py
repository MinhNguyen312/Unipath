import os
import httpx
import uvicorn
import requests
from fastapi import Depends, FastAPI
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models import GenerationRequest
from configs import HEADERS, GEN_URL, STREAM_URL, SYSTEM_MESSAGE, TOOLS_DECLARATION, SSE_SERVER_MAP
import json
from connection_manager import ConnectionManager
from contextlib import asynccontextmanager
from langfuse import Langfuse
from dotenv import load_dotenv
import aioredis
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from redisvl.extensions.cache.llm import SemanticCache
from embedding import geminiVectorizer

load_dotenv()

langfuse = Langfuse(
    secret_key=os.getenv('LANGFUSE_SECRET_KEY'),
    public_key=os.getenv('LANGFUSE_PUBLIC_KEY'),
    host=os.getenv('LANGFUSE_HOST')
)

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
    # Khởi tạo connect đến MCP server và list tool
    conn_manager = ConnectionManager(SSE_SERVER_MAP)
    await conn_manager.initialize()
    app.state.conn_manager = conn_manager

    tool_map, _ = await conn_manager.list_tools()
    app.state.tool_map = tool_map

    # Khởi tạo Rate limiter
    redis = await aioredis.from_url(os.getenv("REDIS_LIMITER_URL"))
    await FastAPILimiter.init(redis)
    
    # Khởi tạo Semantic Cache
    llmcache = SemanticCache(
        name="llmcache",
        vectorizer=geminiVectorizer,
        ttl=360,
        redis_url=os.getenv("REDIS_CACHE_URL"),
        distance_threshold=0.1
    )
    app.state.llmcache = llmcache

    yield  # ứng với khi app đang chạy

    await conn_manager.close()  # ứng với khi app tắt
    await redis.close()

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

# @app.post("/generate")
# async def generate(request_body: GenerationRequest):
#     request_body_dict = request_body.model_dump()

#     request_body_dict["system_instruction"] = {
#         "parts": [{ "text": SYSTEM_MESSAGE }]
#     }

#     async with httpx.AsyncClient() as client:
#         res = await client.post(GEN_URL, headers=HEADERS, json=request_body_dict)
#         return JSONResponse(content=res.json())

@app.post("/stream", dependencies=[Depends(RateLimiter(times=15, seconds=60))])
async def stream(request_body: GenerationRequest):
    request_body_dict = request_body.model_dump()
    request_prompt = request_body_dict["contents"][-1]["parts"][0]["text"]
    request_body_dict["system_instruction"] = {
        "parts": [{ "text": SYSTEM_MESSAGE }]
    }
    request_body_dict["tools"] = TOOLS_DECLARATION

    async def event_stream():
        buffer = []
        async with httpx.AsyncClient(timeout=None) as client:
            # Tạo trace và span
            trace = langfuse.trace(
                name="chatbot-response",
                input=request_prompt
            )
            tool_calling_span = trace.generation(
                name="tools-calling",
                model="gemini-2.0-flash-001",
                input=request_body_dict["contents"]
            )

            # Check semantic cache
            response = app.state.llmcache.check(prompt=request_prompt)
            # Cache hit
            if response and isinstance(response, list) and len(response) > 0 and "response" in response[0]:
                response_text = response[0]['response']
                response_dict = json.dumps({
                    'candidates': [{
                        'content': {
                            'parts': [{ 'text': response_text }], 
                            'role': 'model'
                        }}
                    ]}, ensure_ascii=False)
                yield f"data: {response_dict}\n\n"
                
                tool_calling_span.end(
                    name="semantic cache",
                    output={
                        "role": "model",
                        "parts": [{ "text": response_text }]
                    },
                    usage_details={
                        "input": 0,
                        "output": 0
                    }
                )
                trace.update(name='semantic cache', output=response_text)

                # Request API để tính toán metrics cho chatbot
                requests.post(f"{os.getenv('CHATBOT_TRACE_URL')}/calculate-metrics", json={
                    "request": request_prompt,
                    "response": response_text,
                    "trace_id": trace.id
                })
                return
            
            # Cache miss
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

                        # Kiểm tra function call
                        function_call = parse_function_call(data)
                        
                        if function_call:
                            data = json.loads(data)
                            tool_calling_span.end(
                                output=data["candidates"][0]["content"],
                                usage_details={
                                    "input": data["usageMetadata"]["promptTokenCount"],
                                    "output": data["usageMetadata"]["candidatesTokenCount"]
                                }
                            )
                            
                            yield f"data: {json.dumps({'functionCall': function_call}, ensure_ascii=False)}\n\n"
                            yield "data: [DONE]\n\n"
                            # Ngắt stream -> Gọi tool

                            tool_output_span = trace.span(
                                name="tools-output",
                                input={"tool_calls": function_call}
                            )

                            tool_result = await app.state.conn_manager.call_tool(function_call['name'], function_call['args'], app.state.tool_map)

                            tool_output_span.end(output={"tools_output": tool_result})

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

                            buffer_ = []
                            llm_span = trace.generation(
                                name="llm-response",
                                model="gemini-2.0-flash-001",
                                input=request_body_dict["contents"]
                            )

                            async with client.stream("POST", STREAM_URL, headers=HEADERS, json=request_body_dict) as response:
                                if response.status_code != 200:
                                    error_msg = await response.aread()
                                    yield f"data: {error_msg.decode()}\n\n"
                                    return
                                
                                async for line in response.aiter_lines():
                                    if line.startswith("data: "):
                                        data = line.removeprefix("data: ").strip()
                                        if data != "[DONE]":
                                            data_ = json.loads(data)
                                            
                                            buffer_.append(data_["candidates"][0]["content"]["parts"][0]["text"])
                                            yield f"data: {data}\n\n"
                            
                            response_text = "".join(buffer_)
                            llm_span.end(
                                output={
                                    "role": "model",
                                    "parts": [{ "text": response_text }]
                                },
                                usage_details={
                                    "input": data_["usageMetadata"]["promptTokenCount"],
                                    "output": data_["usageMetadata"]["candidatesTokenCount"]
                                }
                            )
                            trace.update(name='tools-call', output=response_text)

                            # Request API để tính toán metrics cho chatbot
                            requests.post(f"{os.getenv('CHATBOT_TRACE_URL')}/calculate-metrics", json={
                                "request": request_prompt,
                                "response": response_text,
                                "trace_id": trace.id
                            })

                            # Lưu câu trả lời vào cache
                            await app.state.llmcache.store(
                                prompt=request_prompt,
                                response=response_text
                            )

                            return

                        else:
                            # Nếu không phải tool, stream bình thường
                            data_ = json.loads(data)
                                            
                            buffer.append(data_["candidates"][0]["content"]["parts"][0]["text"])
                            yield f"data: {data}\n\n"

            response_text = "".join(buffer)
            data = json.loads(data)
            tool_calling_span.end(
                output={
                    "role": "model",
                    "parts": [{ "text": response_text }]
                },
                usage_details={
                    "input": data["usageMetadata"]["promptTokenCount"],
                    "output": data["usageMetadata"]["candidatesTokenCount"]
                }
            )

            trace.update(name='answer-directly', output=response_text)

            # Request API để tính toán metrics cho chatbot
            requests.post(f"{os.getenv('CHATBOT_TRACE_URL')}/calculate-metrics", json={
                "request": request_prompt,
                "response": response_text,
                "trace_id": trace.id
            })                

            # Lưu câu trả lời vào cache
            app.state.llmcache.store(
                prompt=request_prompt,
                response=response_text
            )

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