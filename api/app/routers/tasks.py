from typing import Optional
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])
service = TaskService()

@router.get("")
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    db: Session = Depends(get_db)
):
    tasks = service.get_tasks(db, status, priority, search, sort)
    return {
        "success": True,
        "data": [TaskResponse.model_validate(t) for t in tasks],
        "error": None
    }

@router.get("/{id}")
def get_task(id: int, db: Session = Depends(get_db)):
    task = service.get_task_by_id(db, id)
    return {
        "success": True,
        "data": TaskResponse.model_validate(task),
        "error": None
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    task = service.create_task(db, task_data)
    return {
        "success": True,
        "data": TaskResponse.model_validate(task),
        "error": None
    }

@router.put("/{id}")
def update_task(id: int, task_data: TaskUpdate, db: Session = Depends(get_db)):
    task = service.update_task(db, id, task_data)
    return {
        "success": True,
        "data": TaskResponse.model_validate(task),
        "error": None
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(id: int, db: Session = Depends(get_db)):
    service.delete_task(db, id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
