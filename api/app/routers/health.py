from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "success": True,
        "data": {
            "status": "ok",
            "version": settings.VERSION,
            "allowRegistration": settings.ALLOW_REGISTRATION,
        },
        "error": None,
    }


@router.get("/version")
async def get_version():
    return {
        "success": True,
        "data": {
            "version": settings.VERSION,
            "allowRegistration": settings.ALLOW_REGISTRATION,
        },
        "error": None,
    }
