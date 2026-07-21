# Stage 1: UI Builder (Node.js + pnpm)
FROM node:22-alpine AS ui-builder

WORKDIR /app

# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy workspace and UI package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ui/package.json ./ui/

# Install Node dependencies (ignoring root prepare script requiring uv)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy UI source code and build script
COPY ui/ ./ui/
COPY scripts/ ./scripts/

# Build React production bundle (dist/)
RUN pnpm --filter ui build

# Stage 2: Production API Runtime (Python + uv + FastAPI)
FROM python:3.11-slim AS api-runtime

# Install uv binary from official Astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Set production environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/api/.venv/bin:$PATH"

# Copy API package manifests
COPY api/pyproject.toml api/uv.lock ./api/

# Install Python backend dependencies using uv
RUN uv sync --frozen --directory api

# Copy FastAPI backend code
COPY api/app ./api/app

# Copy compiled React SPA assets from Stage 1 into FastAPI static directory
COPY --from=ui-builder /app/ui/dist ./api/app/static

# Expose production port
EXPOSE 5279

# Launch Uvicorn server serving FastAPI REST API and static React SPA
CMD ["uv", "run", "--directory", "api", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5279", "--proxy-headers", "--forwarded-allow-ips=*"]
