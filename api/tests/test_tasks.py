import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_create_task_endpoint_success(auth_client: AsyncClient):
    payload = {
        "title": "Integration Task",
        "description": "API test payload",
        "priority": "HIGH",
    }
    response = await auth_client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["success"] is True
    assert body["error"] is None
    assert body["data"]["title"] == "Integration Task"
    assert body["data"]["priority"] == "HIGH"
    assert body["data"]["status"] == "TODO"
    assert "id" in body["data"]


@pytest.mark.anyio
async def test_create_task_endpoint_empty_title_validation(auth_client: AsyncClient):
    payload = {"title": "   ", "priority": "LOW"}
    response = await auth_client.post("/api/tasks", json=payload)
    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"] == "Title cannot be empty"


@pytest.mark.anyio
async def test_get_tasks_list_endpoint(auth_client: AsyncClient):
    await auth_client.post(
        "/api/tasks",
        json={"title": "Task One", "priority": "LOW", "description": "findme"},
    )
    await auth_client.post(
        "/api/tasks",
        json={"title": "Task Two", "priority": "HIGH", "description": "other"},
    )

    # Test get all
    res = await auth_client.get("/api/tasks")
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) == 2

    # Test filtering by search
    res_search = await auth_client.get("/api/tasks?search=findme")
    assert res_search.status_code == 200
    data_search = res_search.json()["data"]
    assert len(data_search) == 1
    assert data_search[0]["title"] == "Task One"


@pytest.mark.anyio
async def test_get_task_by_id_endpoint(auth_client: AsyncClient):
    create_res = await auth_client.post("/api/tasks", json={"title": "Fetch Me"})
    task_id = create_res.json()["data"]["id"]

    res = await auth_client.get(f"/api/tasks/{task_id}")
    assert res.status_code == 200
    assert res.json()["data"]["title"] == "Fetch Me"

    res_404 = await auth_client.get("/api/tasks/99999")
    assert res_404.status_code == 404
    assert res_404.json()["success"] is False
    assert res_404.json()["error"] == "Task not found"


@pytest.mark.anyio
async def test_update_task_endpoint(auth_client: AsyncClient):
    create_res = await auth_client.post("/api/tasks", json={"title": "Original"})
    task_id = create_res.json()["data"]["id"]

    update_payload = {"title": "Updated", "status": "IN_PROGRESS"}
    res = await auth_client.put(f"/api/tasks/{task_id}", json=update_payload)
    assert res.status_code == 200
    body = res.json()
    assert body["data"]["title"] == "Updated"
    assert body["data"]["status"] == "IN_PROGRESS"


@pytest.mark.anyio
async def test_delete_task_endpoint(auth_client: AsyncClient):
    create_res = await auth_client.post("/api/tasks", json={"title": "To Delete"})
    task_id = create_res.json()["data"]["id"]

    delete_res = await auth_client.delete(f"/api/tasks/{task_id}")
    assert delete_res.status_code == 204

    # Verify task is deleted
    get_res = await auth_client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 404
