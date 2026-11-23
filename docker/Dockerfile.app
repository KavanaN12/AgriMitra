# ==========================================
# Multi-stage Dockerfile for AgriMitra Application
# Bundles React PWA Frontend + FastAPI Backend
# ==========================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_USE_MSW=false \
    VITE_API_URL=/api/v1
RUN npm run build

# Stage 2: Production Python Backend + Static Files
FROM python:3.10-slim AS runner

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production \
    PORT=8000 \
    FRONTEND_DIST_DIR=/app/static \
    UPLOAD_DIR=/app/uploads

# Install system dependencies for PostgreSQL driver
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ /app/

# Copy compiled frontend from Stage 1 into /app/static
COPY --from=frontend-builder /build/dist /app/static

# Ensure upload directory exists
RUN mkdir -p /app/uploads

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/v1/health || exit 1

EXPOSE 8000

CMD ["sh", "-c", "python -m alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
