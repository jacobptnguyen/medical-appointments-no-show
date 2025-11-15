FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    libgomp1 \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
COPY backend/requirements.txt backend/
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY . .

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]