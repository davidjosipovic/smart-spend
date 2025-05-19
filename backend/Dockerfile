FROM python:3.11-slim

WORKDIR /app

# Copy the requirements first for efficient caching
COPY requirements.txt .

# Install dependencies, including Celery and Redis
RUN pip install --no-cache-dir -r requirements.txt

# Install PostgreSQL client tools for database connectivity testing
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy all backend files
COPY . .

EXPOSE 8000

# The CMD is overridden in docker-compose to specify Celery or Uvicorn