# TaskFlow API Backend 🐍

The backend service for TaskFlow, built with **Python 3.11**, **FastAPI**, **Pydantic V2**, **SQLAlchemy 2.0**, **SQLite**, and managed via **`uv`**.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** FastAPI
* **Package Management:** `uv` (`astral-sh/uv`)
* **ORM & Database:** SQLAlchemy 2.0 & SQLite (`tasks.db`)
* **Validation & Settings:** Pydantic V2 & `pydantic-settings`
* **Testing:** Pytest, HTTPX (`ASGITransport`), AnyIO
* **Linter & Type Checker:** Ruff & Pyright

---

## 📁 Project Structure

```
api/
├── app/
│   ├── database/       # SQLAlchemy engine, session maker, and Base model
│   ├── models/         # SQLAlchemy ORM models (Task)
│   ├── schemas/        # Pydantic request/response schemas & envelopes
│   ├── repositories/   # Database access layer (TaskRepository)
│   ├── services/       # Business logic layer (TaskService)
│   ├── routers/        # FastAPI HTTP routes (health, tasks, statistics)
│   ├── config.py       # Pydantic Settings configuration
│   └── main.py         # Application entrypoint & static SPA mounting
├── tests/              # Pytest unit & integration test suites
│   ├── conftest.py     # In-memory SQLite fixtures & HTTPX AsyncClient setup
│   ├── test_health.py
│   ├── test_task_repository.py
│   ├── test_task_service.py
│   ├── test_tasks.py
│   └── test_statistics.py
└── pyproject.toml      # Project manifest & tool configurations
```

---

## 🚀 Independent Execution

Run commands directly from the `api/` directory:

```bash
# Install dependencies
uv sync

# Run development server with auto-reload
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Run Pytest test suite (16 tests)
uv run pytest

# Run Ruff linter
uv run ruff check .

# Run Pyright type checker
uv run pyright .
```
