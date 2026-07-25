from collections.abc import AsyncGenerator, Generator
from typing import cast

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app

# In-memory SQLite database setup for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a clean in-memory database schema for each test function."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
async def async_client(db_session: Session) -> AsyncGenerator[AsyncClient, None]:
    """Override FastAPI get_db dependency with test database session."""

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def auth_client(async_client: AsyncClient, db_session: Session) -> AsyncClient:
    """Create a mock user and return an authenticated AsyncClient."""
    from app.models.user import User
    from app.services.auth import create_access_token, hash_secret

    hashed_password = hash_secret("ValidPassword123!")
    hashed_key = hash_secret("some_recovery_key_hex")
    user = User(
        username="test_user_auth",
        hashed_password=hashed_password,
        hashed_recovery_key=hashed_key,
        session_version=1,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(cast(int, user.id), cast(int, user.session_version))
    async_client.headers["Authorization"] = f"Bearer {token}"
    return async_client
