from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    priority: TaskPriority = TaskPriority.LOW
    status: TaskStatus = TaskStatus.TODO

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    priority: TaskPriority | None = TaskPriority.LOW

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    priority: TaskPriority | None = None
    status: TaskStatus | None = None

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
