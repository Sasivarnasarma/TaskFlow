from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("")
def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(Task).filter(Task.user_id == current_user.id).count()
    completed = db.query(Task).filter(Task.user_id == current_user.id, Task.status == TaskStatus.DONE.value).count()
    pending = total - completed
    completion_rate = round((completed / total) * 100) if total > 0 else 0

    return {
        "success": True,
        "data": {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completionRate": completion_rate,
        },
        "error": None,
    }
