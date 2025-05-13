# API endpoint for Gemini API call with MCP and tracing service

## Installation

Copy `env.example` file to `.env` file and fill in the Gemini API and Langfuse Key.

### Run in dev env

#### Run chatbot backend server
```bash
cd ./chatbot/server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 mcp-server.py
python3 server.py
```

#### Run chatbot tracing
```bash
cd ./chatbot/trace
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
celery -A tasks worker --loglevel=info -P gevent
python3 server.py
```

### Run with docker

Run with docker compose

```bash
docker compose -f docker-compose.chatbot.yml up -d --build
```

### Usage

Check server health

http://localhost:8000/health

Get API docs

http://localhost:8000/docs or http://localhost:8000/redoc
