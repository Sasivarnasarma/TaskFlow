import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

import app.models  # Register models for table creation
from app.config import settings
from app.database.base import Base
from app.database.engine import engine
from app.routers import auth, health, statistics, tasks


import asyncio
from datetime import UTC, datetime
from app.database.session import SessionLocal
from app.models.user import TokenBlacklist

async def cleanup_expired_tokens() -> None:
    while True:
        try:
            # Sleep for 1 hour (3600 seconds) before next run
            await asyncio.sleep(3600)
            db = SessionLocal()
            try:
                db.query(TokenBlacklist).filter(TokenBlacklist.expires_at < datetime.now(UTC)).delete()
                db.commit()
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            # Avoid crashing the loop on db locks/etc.
            print(f"Error during expired tokens cleanup background task: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)

    # Initial startup cleanup of expired blacklisted tokens
    db = SessionLocal()
    try:
        db.query(TokenBlacklist).filter(TokenBlacklist.expires_at < datetime.now(UTC)).delete()
        db.commit()
    except Exception as e:
        print(f"Error during startup expired tokens cleanup: {e}")
    finally:
        db.close()

    # Start periodic background cleanup task
    cleanup_task = asyncio.create_task(cleanup_expired_tokens())

    yield

    # Cancel background task on shutdown
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)


# Custom HTTP Exception handler to return enveloped {"success": false, "data": null, "error": "..."}
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "data": None, "error": exc.detail},
    )


# Custom Request Validation exception handler returning enveloped output
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        field = " -> ".join(str(loc) for loc in first_error.get("loc", []) if loc != "body")
        msg = first_error.get("msg", "Validation error")
        message = f"{field}: {msg}" if field else msg
    else:
        message = "Validation error"

    return JSONResponse(status_code=422, content={"success": False, "data": None, "error": message})


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
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(tasks.router, prefix=settings.API_PREFIX)
app.include_router(statistics.router, prefix=settings.API_PREFIX)

# Static file serving for SPA frontend in production
if os.path.exists(settings.STATIC_DIR):
    # Mount main static assets directory
    app.mount("/", StaticFiles(directory=settings.STATIC_DIR, html=True), name="static")

    # Fallback to index.html for unknown routes (React client-side routing)
    @app.exception_handler(404)
    async def not_found_handler(request, exc):
        if request.url.path.startswith(settings.API_PREFIX):
            error_message = exc.detail if hasattr(exc, "detail") else "Not Found"
            return JSONResponse(
                status_code=404,
                content={"success": False, "data": None, "error": error_message},
            )
        index_path = os.path.join(settings.STATIC_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return JSONResponse(
            status_code=404,
            content={"success": False, "data": None, "error": "Not Found"},
        )
