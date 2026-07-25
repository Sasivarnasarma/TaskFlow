from typing import cast

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.services.auth import hash_secret, verify_secret


@pytest.mark.anyio
async def test_register_endpoint_success(async_client: AsyncClient, db_session: Session):
    payload = {
        "username": "new_user_reg",
        "password": "SecurePassword123!",
        "confirmPassword": "SecurePassword123!",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert "recovery_key" in body["data"]

    # Verify user exists in database
    db_user = db_session.query(User).filter(User.username == "new_user_reg").first()
    assert db_user is not None
    assert verify_secret(str(db_user.hashed_password), "SecurePassword123!") is True
    assert verify_secret(str(db_user.hashed_recovery_key), body["data"]["recovery_key"]) is True


@pytest.mark.anyio
async def test_register_endpoint_password_strength(async_client: AsyncClient):
    # Too short - fails Pydantic schema validation, returning HTTP 422
    res1 = await async_client.post(
        "/api/auth/register",
        json={"username": "user1", "password": "Sh1!", "confirmPassword": "Sh1!"},
    )
    assert res1.status_code == 422
    assert "error" in res1.json()

    # No uppercase - passes Pydantic length but fails custom validator (returns HTTP 400)
    res2 = await async_client.post(
        "/api/auth/register",
        json={"username": "user2", "password": "lowercase123!", "confirmPassword": "lowercase123!"},
    )
    assert res2.status_code == 400
    assert "uppercase" in res2.json()["error"]

    # Mismatch confirm - returns HTTP 400 (both have valid length >= 12 but differ)
    res3 = await async_client.post(
        "/api/auth/register",
        json={"username": "user3", "password": "ValidPassword123!", "confirmPassword": "mismatchPassword123!"},
    )
    assert res3.status_code == 400
    assert "match" in res3.json()["error"]


@pytest.mark.anyio
async def test_register_endpoint_disabled(async_client: AsyncClient):
    settings.ALLOW_REGISTRATION = False
    try:
        payload = {
            "username": "disabled_reg",
            "password": "SecurePassword123!",
            "confirmPassword": "SecurePassword123!",
        }
        response = await async_client.post("/api/auth/register", json=payload)
        assert response.status_code == 400
        assert "disabled" in response.json()["error"]
    finally:
        settings.ALLOW_REGISTRATION = True


@pytest.mark.anyio
async def test_register_duplicate_username(async_client: AsyncClient, db_session: Session):
    # Register first user
    user = User(
        username="duplicate_user",
        hashed_password=hash_secret("ValidPassword123!"),
        hashed_recovery_key=hash_secret("some_recovery"),
    )
    db_session.add(user)
    db_session.commit()

    # Try duplicate
    payload = {
        "username": "duplicate_user",
        "password": "AnotherPassword123!",
        "confirmPassword": "AnotherPassword123!",
    }
    response = await async_client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "taken" in response.json()["error"]


@pytest.mark.anyio
async def test_login_endpoint_success(async_client: AsyncClient, db_session: Session):
    user = User(
        username="login_user",
        hashed_password=hash_secret("ValidPassword123!"),
        hashed_recovery_key=hash_secret("some_recovery"),
        session_version=1,
    )
    db_session.add(user)
    db_session.commit()

    payload = {"username": "login_user", "password": "ValidPassword123!"}
    response = await async_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert body["data"]["user"]["username"] == "login_user"


@pytest.mark.anyio
async def test_login_endpoint_invalid_credentials(async_client: AsyncClient, db_session: Session):
    user = User(
        username="login_user2",
        hashed_password=hash_secret("ValidPassword123!"),
        hashed_recovery_key=hash_secret("some_recovery"),
    )
    db_session.add(user)
    db_session.commit()

    # Bad password
    res1 = await async_client.post("/api/auth/login", json={"username": "login_user2", "password": "WrongPassword!"})
    assert res1.status_code == 401

    # Bad username
    res2 = await async_client.post(
        "/api/auth/login", json={"username": "non_existent", "password": "ValidPassword123!"}
    )
    assert res2.status_code == 401


@pytest.mark.anyio
async def test_recover_password_success(async_client: AsyncClient, db_session: Session):
    user = User(
        username="recover_user",
        hashed_password=hash_secret("OldPassword123!"),
        hashed_recovery_key=hash_secret("recovery_key_123"),
        session_version=1,
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "username": "recover_user",
        "recoveryKey": "recovery_key_123",
        "newPassword": "NewSecurePassword123!",
        "confirmPassword": "NewSecurePassword123!",
    }
    response = await async_client.post("/api/auth/recover", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "recovery_key" in body["data"]

    # Verify changes in DB
    db_session.refresh(user)
    assert verify_secret(str(user.hashed_password), "NewSecurePassword123!") is True
    assert verify_secret(str(user.hashed_recovery_key), body["data"]["recovery_key"]) is True
    assert cast(int, user.session_version) == 2


@pytest.mark.anyio
async def test_recover_password_invalid_key(async_client: AsyncClient, db_session: Session):
    user = User(
        username="recover_user2",
        hashed_password=hash_secret("OldPassword123!"),
        hashed_recovery_key=hash_secret("recovery_key_123"),
    )
    db_session.add(user)
    db_session.commit()

    payload = {
        "username": "recover_user2",
        "recoveryKey": "wrong_key",
        "newPassword": "NewSecurePassword123!",
        "confirmPassword": "NewSecurePassword123!",
    }
    response = await async_client.post("/api/auth/recover", json=payload)
    assert response.status_code == 401
    assert "Invalid username or recovery key" in response.json()["error"]


@pytest.mark.anyio
async def test_logout_endpoint_blacklists_token(auth_client: AsyncClient, db_session: Session):
    # Verify we can fetch tasks before logout
    res1 = await auth_client.get("/api/tasks")
    assert res1.status_code == 200

    # Logout
    logout_res = await auth_client.post("/api/auth/logout")
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Verify we can no longer fetch tasks
    res2 = await auth_client.get("/api/tasks")
    assert res2.status_code == 401


@pytest.mark.anyio
async def test_password_recovery_invalidates_active_jwt(async_client: AsyncClient, db_session: Session):
    # Create user
    user = User(
        username="session_inv_user",
        hashed_password=hash_secret("OldPassword123!"),
        hashed_recovery_key=hash_secret("recovery_key_inv"),
        session_version=1,
    )
    db_session.add(user)
    db_session.commit()

    # Login to get JWT
    login_res = await async_client.post(
        "/api/auth/login", json={"username": "session_inv_user", "password": "OldPassword123!"}
    )
    token = login_res.json()["data"]["access_token"]

    # Verify JWT works
    res_task = await async_client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert res_task.status_code == 200

    # Recover / Reset password
    await async_client.post(
        "/api/auth/recover",
        json={
            "username": "session_inv_user",
            "recoveryKey": "recovery_key_inv",
            "newPassword": "NewPassword321!",
            "confirmPassword": "NewPassword321!",
        },
    )

    # Verify old JWT is now rejected (session_version mismatch)
    res_task_invalid = await async_client.get("/api/tasks", headers={"Authorization": f"Bearer {token}"})
    assert res_task_invalid.status_code == 401
    assert "session has been invalidated" in res_task_invalid.json()["error"].lower()


@pytest.mark.anyio
async def test_multitenant_task_scoping(async_client: AsyncClient, db_session: Session):
    # 1. Create two users
    u1 = User(
        username="user_alice",
        hashed_password=hash_secret("AlicePassword123!"),
        hashed_recovery_key=hash_secret("alice_key"),
        session_version=1,
    )
    u2 = User(
        username="user_bob",
        hashed_password=hash_secret("BobPassword123!"),
        hashed_recovery_key=hash_secret("bob_key"),
        session_version=1,
    )
    db_session.add_all([u1, u2])
    db_session.commit()

    # 2. Login Alice and create a task
    alice_login = await async_client.post(
        "/api/auth/login", json={"username": "user_alice", "password": "AlicePassword123!"}
    )
    alice_token = alice_login.json()["data"]["access_token"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}

    create_res = await async_client.post("/api/tasks", json={"title": "Alice Private Task"}, headers=alice_headers)
    assert create_res.status_code == 201
    alice_task_id = create_res.json()["data"]["id"]

    # 3. Login Bob
    bob_login = await async_client.post("/api/auth/login", json={"username": "user_bob", "password": "BobPassword123!"})
    bob_token = bob_login.json()["data"]["access_token"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}

    # 4. Verify Bob cannot see Alice's task in lists
    bob_list = await async_client.get("/api/tasks", headers=bob_headers)
    assert bob_list.status_code == 200
    assert len(bob_list.json()["data"]) == 0

    # 5. Verify Bob cannot get Alice's task by ID (404 Not Found)
    bob_get = await async_client.get(f"/api/tasks/{alice_task_id}", headers=bob_headers)
    assert bob_get.status_code == 404

    # 6. Verify Bob cannot update Alice's task
    bob_update = await async_client.put(f"/api/tasks/{alice_task_id}", json={"title": "Hack Task"}, headers=bob_headers)
    assert bob_update.status_code == 404

    # 7. Verify Bob cannot delete Alice's task
    bob_delete = await async_client.delete(f"/api/tasks/{alice_task_id}", headers=bob_headers)
    assert bob_delete.status_code == 404
