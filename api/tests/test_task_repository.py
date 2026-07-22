from typing import cast

from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus
from app.repositories.task_repository import TaskRepository

repository = TaskRepository()


def test_create_and_get_by_id(db_session: Session):
    task = Task(
        title="Repo Test Task",
        description="Testing repository create",
        priority=TaskPriority.HIGH.value,
        status=TaskStatus.TODO.value,
        user_id=1,
    )
    created_task = repository.create(db_session, task)
    created_id = cast(int, created_task.id)
    assert created_id is not None
    assert str(created_task.title) == "Repo Test Task"

    fetched = repository.get_by_id(db_session, created_id, 1)
    assert fetched is not None
    assert cast(int, fetched.id) == created_id
    assert str(fetched.priority) == TaskPriority.HIGH.value


def test_get_all_filtering_and_sorting(db_session: Session):
    task1 = Task(
        title="Alpha Task",
        description="First description",
        priority=TaskPriority.LOW.value,
        status=TaskStatus.TODO.value,
        user_id=1,
    )
    task2 = Task(
        title="Beta Task",
        description="Second description",
        priority=TaskPriority.HIGH.value,
        status=TaskStatus.DONE.value,
        user_id=1,
    )
    repository.create(db_session, task1)
    repository.create(db_session, task2)

    # Filter by status
    done_tasks = repository.get_all(db_session, 1, status=TaskStatus.DONE.value)
    assert len(done_tasks) == 1
    assert str(done_tasks[0].title) == "Beta Task"

    # Filter by priority
    high_tasks = repository.get_all(db_session, 1, priority=TaskPriority.HIGH.value)
    assert len(high_tasks) == 1
    assert str(high_tasks[0].title) == "Beta Task"

    # Filter by search
    searched_tasks = repository.get_all(db_session, 1, search="Alpha")
    assert len(searched_tasks) == 1
    assert str(searched_tasks[0].title) == "Alpha Task"

    # Sort title asc vs desc
    asc_tasks = repository.get_all(db_session, 1, sort="title_asc")
    assert str(asc_tasks[0].title) == "Alpha Task"

    desc_tasks = repository.get_all(db_session, 1, sort="title_desc")
    assert str(desc_tasks[0].title) == "Beta Task"


def test_update_and_delete(db_session: Session):
    task = Task(title="To Update", priority=TaskPriority.LOW.value, status=TaskStatus.TODO.value, user_id=1)
    created = repository.create(db_session, task)
    created_id = cast(int, created.id)

    updated = repository.update(db_session, created, {"title": "Updated Title", "status": TaskStatus.IN_PROGRESS.value})
    assert str(updated.title) == "Updated Title"
    assert str(updated.status) == TaskStatus.IN_PROGRESS.value

    repository.delete(db_session, updated)
    assert repository.get_by_id(db_session, created_id, 1) is None
