import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from models import GenerationRequest

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
        res = await client.post(GEN_URL, headers=headers, json=request_body.dict())
        return JSONResponse(content=res.json())

@app.post("/stream")
async def stream(request_body: GenerationRequest):
    async def event_stream():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", STREAM_URL, headers=headers, json=request_body.dict()) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line.removeprefix("data: ").strip()
                        if data != "[DONE]":
                            yield data + "\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")