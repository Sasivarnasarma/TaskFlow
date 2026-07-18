import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.routers import health

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(health.router, prefix=settings.API_PREFIX)

# Static file serving for SPA frontend in production
if os.path.exists(settings.STATIC_DIR):
    # Mount main static assets directory
    app.mount("/", StaticFiles(directory=settings.STATIC_DIR, html=True), name="static")

    # Fallback to index.html for unknown routes (React client-side routing)
    @app.exception_handler(404)
    async def not_found_handler(request, exc):
        index_path = os.path.join(settings.STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Not Found"}
