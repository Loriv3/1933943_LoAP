# ── Build stage ───────────────────────────────────────────────────────────────
FROM docker.io/python:3.12-slim AS builder

WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    libssl-dev \
    libsasl2-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM docker.io/python:3.12-slim

WORKDIR /app


# Copia dipendenze dal builder
COPY --from=builder /install /usr/local

# Copia sorgenti
COPY schema.py .
COPY main.py .
COPY normalizers/ ./normalizers/
COPY clients/     ./clients/
COPY amq/       ./amq/

# Variabili d'ambiente con valori di default
ENV AMQ_HOST=activemq \
    AMQ_PORT=61613 \
    BACKEND_URL=http://localhost:8080 \
    POLL_INTERVAL=5.0 \
    LOG_LEVEL=INFO

CMD ["python", "main.py"]