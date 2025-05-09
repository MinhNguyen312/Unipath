FROM python:3.10-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN python3 -m pip install --upgrade pip \
 && python3 -m pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.10-slim

WORKDIR /app

COPY . /app

COPY --from=builder /install /usr/local

CMD ["python3", "server.py"]
