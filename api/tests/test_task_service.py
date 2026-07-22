from typing import cast

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.task import TaskCreate, TaskPriority, TaskStatus, TaskUpdate
from app.services.task_service import TaskService

service = TaskService()


def test_service_create_task_validation(db_session: Session):
    # Test valid creation
    task_data = TaskCreate(
        title="  Clean Code  ",
        description="Service test",
        priority=TaskPriority.HIGH,
    )
    task = service.create_task(db_session, task_data, 1)
    assert str(task.title) == "Clean Code"  # Stripped
    assert str(task.priority) == "HIGH"
    assert str(task.status) == "TODO"

    # Test empty title validation error
    invalid_data = TaskCreate(title="   ")
    with pytest.raises(HTTPException) as exc_info:
        service.create_task(db_session, invalid_data, 1)
    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "Title cannot be empty"


def test_service_get_by_id_and_not_found(db_session: Session):
    task_data = TaskCreate(title="Test Task")
    created = service.create_task(db_session, task_data, 1)
    created_id = cast(int, created.id)

    fetched = service.get_task_by_id(db_session, created_id, 1)
    assert cast(int, fetched.id) == created_id

    with pytest.raises(HTTPException) as exc_info:
        service.get_task_by_id(db_session, 99999, 1)
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Task not found"


def test_service_update_task_validation(db_session: Session):
    task_data = TaskCreate(title="Original Title")
    created = service.create_task(db_session, task_data, 1)
    created_id = cast(int, created.id)

    # Test valid update
    update_data = TaskUpdate(title="New Title", status=TaskStatus.DONE)
    updated = service.update_task(db_session, created_id, update_data, 1)
    assert str(updated.title) == "New Title"
    assert str(updated.status) == "DONE"

    # Test updating non-existent task 404
    with pytest.raises(HTTPException) as exc_info:
        service.update_task(db_session, 99999, update_data, 1)
    assert exc_info.value.status_code == 404

    # Test updating with whitespace empty title 422
    invalid_update = TaskUpdate(title="   ")
    with pytest.raises(HTTPException) as exc_info:
        service.update_task(db_session, created_id, invalid_update, 1)
    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "Title cannot be empty"


def test_service_delete_task(db_session: Session):
    task_data = TaskCreate(title="To Delete")
    created = service.create_task(db_session, task_data, 1)
    created_id = cast(int, created.id)

    service.delete_task(db_session, created_id, 1)

    with pytest.raises(HTTPException) as exc_info:
        service.get_task_by_id(db_session, created_id, 1)
    assert exc_info.value.status_code == 404
