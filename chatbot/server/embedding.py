import os
from dotenv import load_dotenv
import requests
import httpx
from redisvl.utils.vectorize.text.custom import CustomTextVectorizer
from redisvl.extensions.cache.embeddings import EmbeddingsCache

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"

headers = {
    "Content-Type": "application/json"
}

def generate_embedding(text: str):
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": text}],
        },
        "taskType": "SEMANTIC_SIMILARITY"
    }
    response = requests.post(GEMINI_ENDPOINT, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["embedding"]["values"]

async def generate_embedding_async(text: str):
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{"text": text}],
        },
        "taskType": "SEMANTIC_SIMILARITY"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(GEMINI_ENDPOINT, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["embedding"]["values"]

cache = EmbeddingsCache(name="gemini_embedding_cache")
geminiVectorizer = CustomTextVectorizer(
    embed=generate_embedding,
    aembed=generate_embedding_async,
    cache=cache
)