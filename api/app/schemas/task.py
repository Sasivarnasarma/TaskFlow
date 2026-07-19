from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from app.models.task import TaskPriority, TaskStatus

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    priority: TaskPriority = TaskPriority.LOW
    status: TaskStatus = TaskStatus.TODO

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[TaskPriority] = TaskPriority.LOW

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
