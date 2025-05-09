FROM python:3.10-alpine AS builder

RUN apk add --no-cache \
    build-base \
    libffi-dev \
    musl-dev \
    gcc \
    g++ \
    make \
    openssl-dev \
    zlib-dev

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install -r requirements.txt

FROM python:3.10-alpine

RUN apk add --no-cache \
    libffi \
    openssl \
    zlib

COPY --from=builder /install /usr/local

COPY . /app
WORKDIR /app

ENV PYTHONPATH=/usr/local/lib/python3.10/site-packages

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
