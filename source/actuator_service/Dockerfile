FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
# installa compilatore e librerie necessarie
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    libssl-dev \
    libsasl2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copia codice
COPY . .

CMD ["uvicorn", "actuator_service:app", "--host", "0.0.0.0", "--port", "8000"]