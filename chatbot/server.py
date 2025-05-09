import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models import GenerationRequest
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEN_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
STREAM_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"

headers = {"Content-Type": "application/json"}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc thay bằng ["http://localhost:5500"] nếu muốn giới hạn
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả HTTP methods, bao gồm OPTIONS
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/generate")
async def generate(request_body: GenerationRequest):
    async with httpx.AsyncClient() as client:
        res = await client.post(GEN_URL, headers=headers, json=request_body.model_dump())
        return JSONResponse(content=res.json())

@app.post("/stream")
async def stream(request_body: GenerationRequest):
    async def event_stream():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", STREAM_URL, headers=headers, json=request_body.model_dump()) as response:
                if response.status_code != 200:
                    error_msg = await response.aread()
                    yield f"data: {error_msg.decode()}\n\n"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line.removeprefix("data: ").strip()
                        if data != "[DONE]":
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
