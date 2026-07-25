from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class UserCreate(UserBase):
    password: str = Field(..., min_length=12)
    confirm_password: str = Field(..., min_length=12)

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UserLogin(UserBase):
    password: str = Field(..., min_length=1)

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UserRecovery(UserBase):
    recovery_key: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=12)
    confirm_password: str = Field(..., min_length=12)

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class RecoveryKeyResponse(BaseModel):
    recovery_key: str

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
