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
        user_id: int,
        status: str | None = None,
        priority: str | None = None,
        search: str | None = None,
        sort: str | None = None,
    ) -> list[Task]:
        return self.repository.get_all(db, user_id, status, priority, search, sort)

    def get_task_by_id(self, db: Session, task_id: int, user_id: int) -> Task:
        task = self.repository.get_by_id(db, task_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def create_task(self, db: Session, task_data: TaskCreate, user_id: int) -> Task:
        if not task_data.title.strip():
            raise HTTPException(status_code=422, detail="Title cannot be empty")

        task = Task(
            title=task_data.title.strip(),
            description=task_data.description,
            priority=task_data.priority.value if task_data.priority else "LOW",
            due_date=task_data.due_date,
            user_id=user_id,
        )
        return self.repository.create(db, task)

    def update_task(self, db: Session, task_id: int, task_data: TaskUpdate, user_id: int) -> Task:
        task = self.get_task_by_id(db, task_id, user_id)

        # Get only the fields explicitly provided in the request payload
        updates = task_data.model_dump(exclude_unset=True)

        if "title" in updates:
            if updates["title"] is not None:
                if not updates["title"].strip():
                    raise HTTPException(status_code=422, detail="Title cannot be empty")
                updates["title"] = updates["title"].strip()
            else:
                # If title is explicitly set to None, block it
                raise HTTPException(status_code=422, detail="Title cannot be empty")

        if "priority" in updates and updates["priority"] is not None:
            updates["priority"] = updates["priority"].value

        if "status" in updates and updates["status"] is not None:
            updates["status"] = updates["status"].value

        return self.repository.update(db, task, updates)

    def delete_task(self, db: Session, task_id: int, user_id: int) -> None:
        task = self.get_task_by_id(db, task_id, user_id)
        self.repository.delete(db, task)
