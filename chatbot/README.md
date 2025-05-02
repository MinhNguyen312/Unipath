## API endpoint for Gemini API call

### Installation

Copy `env.example` file to `.env` file and fill in the Gemini API Key.

#### Run in dev env

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

#### Run with docker

Build image and run container

```bash
docker build -t chatbot-be .
docker run -d -p 8000:8000 --env-file .env chatbot-be
```

Or run with docker compose

```bash
docker compose up -d --build
```

Check server running

http://localhost:8000/health

Get API docs

http://localhost:8000/docs or http://localhost:8000/redoc
