from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self):
        self.repository = TaskRepository()

    def get_tasks(
        self,
        db: Session,
        status: str | None = None,
        priority: str | None = None,
        search: str | None = None,
        sort: str | None = None,
    ) -> list[Task]:
        return self.repository.get_all(db, status, priority, search, sort)

    def get_task_by_id(self, db: Session, task_id: int) -> Task:
        task = self.repository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def create_task(self, db: Session, task_data: TaskCreate) -> Task:
        if not task_data.title.strip():
            raise HTTPException(status_code=422, detail="Title cannot be empty")

        task = Task(
            title=task_data.title.strip(),
            description=task_data.description,
            priority=task_data.priority.value if task_data.priority else "LOW",
        )
        return self.repository.create(db, task)

    def update_task(self, db: Session, task_id: int, task_data: TaskUpdate) -> Task:
        task = self.get_task_by_id(db, task_id)

        updates = {}
        if task_data.title is not None:
            if not task_data.title.strip():
                raise HTTPException(status_code=422, detail="Title cannot be empty")
            updates["title"] = task_data.title.strip()

        if task_data.description is not None:
            updates["description"] = task_data.description

        if task_data.priority is not None:
            updates["priority"] = task_data.priority.value

        if task_data.status is not None:
            updates["status"] = task_data.status.value

        return self.repository.update(db, task, updates)

    def delete_task(self, db: Session, task_id: int) -> None:
        task = self.get_task_by_id(db, task_id)
        self.repository.delete(db, task)
