FROM python:3.11-slim

WORKDIR /app

# Copy the requirements first for efficient caching
COPY requirements.txt .

# Install dependencies, including Celery and Redis
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

EXPOSE 8000

# The CMD is overridden in docker-compose to specify Celery or Uvicorn