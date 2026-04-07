FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# We'll use the docker-compose command array to determine whether this runs the API or the Consumer
