# TaskFlow 🚀

> A modern, full-stack Task Management application built as a high-performance monorepo using **React 19**, **Vite**, **Tailwind CSS v4**, **FastAPI**, **SQLAlchemy**, and **Relational Databases (SQLite, PostgreSQL, MySQL)**, with multi-stage **Docker** containerization and **GitHub Actions** CI/CD.

---

## 🌟 Key Features

* **Task Lifecycle Management:** Create, view, update, cycle statuses (`TODO` ➔ `IN_PROGRESS` ➔ `DONE`), and delete tasks with instant feedback toasts.
* **Real-time Filtering & Search:** Search tasks by title/description, filter by status or priority (`LOW`, `MEDIUM`, `HIGH`), and sort dynamically (Newest, Oldest, Priority, Title).
* **Live Statistics Dashboard:** Aggregated completion rates, pending vs. completed metrics, and visual progress indicators.
* **Modern Premium UI:** Built with Tailwind CSS v4, glassmorphism aesthetics, dark/light/system theme switcher, and responsive grid layouts.
* **Clean REST API Envelopes:** Standardized JSON responses (`{"success": true, "data": ..., "error": null}`) and robust HTTP exception handling.
* **31 Unit & Component Tests:** Comprehensive test suite featuring 16 Pytest backend tests and 15 Vitest React component tests running in parallel with 0 warnings.
* **Multi-Stage Docker & Compose:** Production-ready containerization serving both the FastAPI REST API and static React SPA from a single container on port `5279`.
* **Parallel CI/CD Pipelines:** Automated GitHub Actions workflows running linting (Oxlint & Ruff), typechecking (`tsc` & Pyright), unit tests, builds, and publishing multi-arch images to GitHub Container Registry (`ghcr.io`).

---

## 🛠️ Tech Stack & Architecture

```
                               ┌─────────────────────────────────────────┐
                               │             React 19 SPA                │
                               │  Vite • Tailwind v4 • Lucide • Vitest   │
                               └────────────────────┬────────────────────┘
                                                    │ REST API (/api/v1)
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         FastAPI REST API                                        │
│                        Pydantic V2 • SQLAlchemy 2.0 • SQLite • Pytest                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Domain | Technologies |
| :--- | :--- |
| **Monorepo & Tooling** | `pnpm` workspaces, `uv` Python package manager, `concurrently` |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI primitives, Lucide Icons, Vitest, Testing Library |
| **Backend** | Python 3.11, FastAPI, Pydantic V2, SQLAlchemy 2.0, SQLite, Pytest, HTTPX, AnyIO, Pyright, Ruff |
| **DevOps & Containerization** | Docker multi-stage builds, Docker Compose, GitHub Actions CI/CD, GHCR (`ghcr.io`) |

---

## 📁 Monorepo Directory Structure

```
TaskFlow/
├── .github/
│   ├── actions/setup/          # Reusable composite setup action (pnpm, Node, Python, uv caching)
│   └── workflows/
│       ├── ci.yml              # Parallel CI pipeline (lint, typecheck, test, build, PR summary bot)
│       └── publish.yml         # Multi-arch Docker image builder & publisher (GHCR)
├── api/                        # FastAPI Python Backend
│   ├── app/                    # Application source (routers, models, schemas, database, config)
│   ├── tests/                  # Pytest unit & integration test suites
│   ├── pyproject.toml          # Python project & dependency configuration
│   └── uv.lock                 # Hermetic Python lockfile
├── ui/                         # React TypeScript Frontend
│   ├── src/                    # Source code (components, pages, lib, test setups)
│   ├── package.json            # Frontend dependencies & Vitest config
│   └── vite.config.ts          # Vite & Vitest configuration
├── scripts/                    # Build & environment helper scripts
├── Dockerfile                  # Production multi-stage Docker build file
├── docker-compose.yml          # Local container orchestration file
├── docker-compose.prod.yml     # Production image-based container deployment file
├── pnpm-workspace.yaml         # Monorepo workspace configuration
└── package.json                # Root monorepo scripts & dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites

* **Node.js:** v22+
* **pnpm:** v10+ (`corepack enable`)
* **Python:** v3.11+
* **uv:** v0.5+ (`pip install uv` or `curl -sSf https://astral.sh/uv/install.sh | sh`)
* **Docker & Docker Compose** *(Optional, for containerized running)*

---

### Option 1: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sasivarnasarma/TaskFlow.git
   cd TaskFlow
   ```

2. **Install dependencies & set up environments:**
   ```bash
   pnpm install
   ```
   *(This automatically triggers `pnpm prepare`, syncing Python `uv` dependencies in `api/`)*

3. **Start the development server:**
   ```bash
   pnpm dev
   ```
   * **Frontend UI:** `http://localhost:5173`
   * **Backend API:** `http://localhost:8000`
   * **API Docs (Swagger):** `http://localhost:8000/docs`

---

### Option 2: Docker Compose (Local Build)

Build and run both backend REST API and React SPA from source in a single container:

```bash
docker compose up -d --build
```
* **Application URL:** `http://localhost:5279`
* **Health Endpoint:** `http://localhost:5279/api/health`

To stop the container:
```bash
docker compose down
```

---

### Option 3: Production Deployment (No Source Code Required)

Deploy the pre-built, multi-architecture Docker image from GitHub Container Registry:

```bash
# Run latest production release
docker compose -f docker-compose.prod.yml up -d

# Run preview development build
TAG=dev docker compose -f docker-compose.prod.yml up -d
```

---

## 📜 Monorepo Scripts Reference

Execute these commands from the root workspace directory:

| Script | Command | Description |
| :--- | :--- | :--- |
| `pnpm dev` | `concurrently ...` | Launches React dev server and FastAPI Uvicorn reloader in parallel. |
| `pnpm test` | `concurrently ...` | Runs 15 Vitest UI component tests and 16 Pytest API tests in parallel. |
| `pnpm lint` | `concurrently ...` | Inspects code quality with Oxlint (React) and Ruff (Python). |
| `pnpm format` | `concurrently ...` | Auto-formats code with Prettier and Ruff. |
| `pnpm typecheck` | `concurrently ...` | Validates static types with `tsc -b` and Pyright. |
| `pnpm build` | `node scripts/build.js` | Compiles Vite React SPA and deploys static assets to `api/app/static/`. |

---

## 📡 REST API Endpoints Summary

All API endpoints return enveloped JSON structures: `{"success": true, "data": ..., "error": null}`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check (`{"status": "ok"}`). |
| `GET` | `/api/tasks` | Fetch tasks list with optional `search`, `status`, `priority`, and `sort_by` parameters. |
| `POST` | `/api/tasks` | Create a new task (body: `title`, `description`, `priority`, `status`). |
| `GET` | `/api/tasks/{id}` | Fetch a single task by ID. |
| `PUT` | `/api/tasks/{id}` | Update an existing task. |
| `DELETE` | `/api/tasks/{id}` | Delete a task (returns HTTP 204 No Content). |
| `GET` | `/api/statistics` | Retrieve task count metrics (`total`, `completed`, `pending`, `completionRate`). |

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./taskflow.db` | SQLAlchemy database connection string (SQLite, PostgreSQL, MySQL). |
| `CORS_ORIGINS` | `["*"]` | Allowed origins list for CORS middleware. |
| `VITE_DEV_API_URL` | `http://127.0.0.1:8000` | Vite dev-server proxy target (development only); production uses relative `/api` URLs. |
| `HOST_IP` | `0.0.0.0` | Host IP interface binding for Docker Compose. |
| `HOST_PORT` | `5279` | Host port mapping for Docker Compose. |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
