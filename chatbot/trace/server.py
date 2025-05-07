from fastapi import FastAPI
import uvicorn
from telemetry import (
    response_counter,
    denial_counter,
)
from pydantic import BaseModel
from logger import logger
from prometheus_client import start_http_server
from tasks import process_metrics

# Tạo prometheus server tại port 8090
start_http_server(port=8090, addr="0.0.0.0")

app = FastAPI()

class ChatRecord(BaseModel):
    request: str
    response: str
    trace_id: str

class MetricsPayload(BaseModel):
    response: int
    denial: int

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Đẩy chat record vào celery task để thực hiện tính toán metrics
@app.post("/calculate-metrics")
async def calculate_metrics(record: ChatRecord):
    process_metrics.delay(record.request, record.response, record.trace_id)
    return {"status": "ok"}

# Log metrics vào prometheus
@app.post("/update-metrics")
async def update_metrics(metrics: MetricsPayload):
    response_counter.add(metrics.response)
    denial_counter.add(metrics.denial)
    logger.info(f"Updated metrics: {metrics}")
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)