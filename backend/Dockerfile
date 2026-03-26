FROM python:3.12-slim-trixie

# Set environment variables.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies.
RUN apt update
RUN pip install gunicorn

COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

# Set working directory.
WORKDIR /usr/src/app/backend

# Copy project files.
COPY . .

# Create a directory for Gunicorn logs (production).
RUN mkdir -p /usr/src/app/logs

# Expose port.
EXPOSE 8000
