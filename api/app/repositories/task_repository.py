from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.task import Task


class TaskRepository:
    def get_all(
        self,
        db: Session,
        user_id: int,
        status: str | None = None,
        priority: str | None = None,
        search: str | None = None,
        sort: str | None = None,
    ) -> list[Task]:
        query = db.query(Task).filter(Task.user_id == user_id)

        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if search:
            query = query.filter(
                or_(
                    Task.title.ilike(f"%{search}%"),
                    Task.description.ilike(f"%{search}%"),
                )
            )

        if sort == "oldest":
            query = query.order_by(Task.created_at.asc())
        elif sort == "title_asc":
            query = query.order_by(Task.title.asc())
        elif sort == "title_desc":
            query = query.order_by(Task.title.desc())
        elif sort == "priority":
            query = query.order_by(Task.priority.asc())
        elif sort == "due_date_asc":
            query = query.order_by(Task.due_date.asc().nulls_last())
        elif sort == "due_date_desc":
            query = query.order_by(Task.due_date.desc().nulls_last())
        else:
            query = query.order_by(Task.created_at.desc())

        return query.all()

    def get_by_id(self, db: Session, task_id: int, user_id: int) -> Task | None:
        return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    def create(self, db: Session, task: Task) -> Task:
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def update(self, db: Session, task: Task, updates: dict) -> Task:
        for key, value in updates.items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task

    def delete(self, db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()
