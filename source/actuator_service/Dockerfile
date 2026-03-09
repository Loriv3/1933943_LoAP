FROM docker.io/python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
# Install compiler and libraries
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    libssl-dev \
    libsasl2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy code
COPY . .

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
