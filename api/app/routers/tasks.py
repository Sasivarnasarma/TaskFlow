from typing import cast

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.auth import get_current_user
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])
service = TaskService()


@router.get("")
def get_tasks(
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = service.get_tasks(db, cast(int, current_user.id), status, priority, search, sort)
    return {
        "success": True,
        "data": [TaskResponse.model_validate(t) for t in tasks],
        "error": None,
    }


@router.get("/{id}")
def get_task(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = service.get_task_by_id(db, id, cast(int, current_user.id))
    return {"success": True, "data": TaskResponse.model_validate(task), "error": None}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = service.create_task(db, task_data, cast(int, current_user.id))
    return {"success": True, "data": TaskResponse.model_validate(task), "error": None}


@router.put("/{id}")
def update_task(
    id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = service.update_task(db, id, task_data, cast(int, current_user.id))
    return {"success": True, "data": TaskResponse.model_validate(task), "error": None}


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service.delete_task(db, id, cast(int, current_user.id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
