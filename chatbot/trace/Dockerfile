FROM python:3.10-slim AS builder

WORKDIR /app

COPY requirements_copy.txt .

RUN pip install --upgrade pip \
 && pip install --no-cache-dir --prefix=/install -r requirements_copy.txt

FROM python:3.10-slim

WORKDIR /app

COPY . /app

COPY --from=builder /install /usr/local

CMD ["python3", "server.py"]
