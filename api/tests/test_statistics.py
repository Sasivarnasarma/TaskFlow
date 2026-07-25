import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_get_statistics_empty_database(auth_client: AsyncClient):
    response = await auth_client.get("/api/statistics")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["error"] is None
    assert body["data"] == {
        "total": 0,
        "completed": 0,
        "pending": 0,
        "completionRate": 0,
    }


@pytest.mark.anyio
async def test_get_statistics_calculated(auth_client: AsyncClient):
    # Create 1 TODO, 1 IN_PROGRESS, 1 DONE task
    await auth_client.post("/api/tasks", json={"title": "Task 1"})
    res2 = await auth_client.post("/api/tasks", json={"title": "Task 2"})
    t2 = res2.json()["data"]["id"]
    res3 = await auth_client.post("/api/tasks", json={"title": "Task 3"})
    t3 = res3.json()["data"]["id"]

    await auth_client.put(f"/api/tasks/{t2}", json={"status": "IN_PROGRESS"})
    await auth_client.put(f"/api/tasks/{t3}", json={"status": "DONE"})

    response = await auth_client.get("/api/statistics")
    assert response.status_code == 200
    data = response.json()["data"]

    assert data["total"] == 3
    assert data["completed"] == 1
    assert data["pending"] == 2
    assert data["completionRate"] == 33  # round((1/3)*100) = 33
