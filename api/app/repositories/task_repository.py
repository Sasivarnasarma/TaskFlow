from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.task import Task

class TaskRepository:
    def get_all(
        self,
        db: Session,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        sort: Optional[str] = None
    ) -> List[Task]:
        query = db.query(Task)

        if status:
            query = query.filter(Task.status == status)
        if priority:
            query = query.filter(Task.priority == priority)
        if search:
            query = query.filter(
                or_(
                    Task.title.ilike(f"%{search}%"),
                    Task.description.ilike(f"%{search}%")
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
        else:
            query = query.order_by(Task.created_at.desc())

        return query.all()

    def get_by_id(self, db: Session, task_id: int) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    def create(self, db: Session, task: Task) -> Task:
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def update(self, db: Session, task: Task, updates: dict) -> Task:
        for key, value in updates.items():
            if value is not None:
                setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task

    def delete(self, db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()
