# ── Build stage ───────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copia dipendenze dal builder
COPY --from=builder /install /usr/local

# Copia sorgenti
COPY schema.py .
COPY main.py .
COPY test_in_file.py .
COPY normalizers/ ./normalizers/
COPY clients/     ./clients/
COPY queue/       ./queue/

# Variabili d'ambiente con valori di default
ENV AMQ_HOST=activemq \
    AMQ_PORT=61613 \
    BACKEND_URL=http://localhost:8080 \
    POLL_INTERVAL=5.0 \
    LOG_LEVEL=INFO

CMD ["python", "main.py"]