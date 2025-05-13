import pandas as pd
from celery import Celery
from langfuse import Langfuse
from evidently.future.datasets import Dataset, DataDefinition
from evidently.future.descriptors import DeclineLLMEval, Sentiment
from evidently.utils.llm.wrapper import GeminiOptions
import os
from dotenv import load_dotenv
from logger import logger
import requests

load_dotenv()

langfuse = Langfuse(
    secret_key=os.getenv('LANGFUSE_SECRET_KEY'),
    public_key=os.getenv('LANGFUSE_PUBLIC_KEY'),
    host=os.getenv('LANGFUSE_HOST')
)

celery_app = Celery(
    "tasks",
    broker=os.getenv('CELERY_BROKER_URL'),
    backend=os.getenv('CELERY_RESULT_BACKEND')
)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY2')

# Tính metrics cho câu trả lời của LLM
def process_interaction(query: str, response: str):
    """Process single interaction and return metrics"""
    df = pd.DataFrame({
        "question": [query],
        "answer": [response]
    })
    
    eval_dataset = Dataset.from_pandas(
        df,
        data_definition=DataDefinition(),
        descriptors=[
            DeclineLLMEval("answer", alias="Denials", provider="gemini", model="gemini/gemini-2.0-flash"),
            Sentiment("answer", alias="Sentiment")
        ],
        options=GeminiOptions(api_key=GEMINI_API_KEY, rpm_limit=15)
    )
    
    scored_df = eval_dataset.as_dataframe()
    return scored_df.iloc[0]


@celery_app.task
def process_metrics(query: str, response: str, trace_id: str):
    metrics = process_interaction(query, response)
    is_denial = metrics["Denials"]
    sentiment = float(metrics["Sentiment"])

    # Update score của trace trên langfuse 
    langfuse.score(
        trace_id=trace_id,
        name="Response Status",
        value=is_denial,
        data_type="CATEGORICAL"
    )

    langfuse.score(
        trace_id=trace_id,
        name="Sentiment",
        value=sentiment,
        data_type="NUMERIC"
    )

    # Request API để cập nhật metrics vào prometheus
    response = requests.post(f"{os.getenv('CHATBOT_TRACE_URL')}/update-metrics", json={
        "response": 1,
        "denial": 1 if is_denial == "DECLINE" else 0
    })
    logger.info(response.status_code)
    logger.info(response.text)
    logger.info(f"Done eval for trace {trace_id}")