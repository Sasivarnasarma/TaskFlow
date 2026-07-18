# TaskFlow

TaskFlow is a modern full-stack task management application designed to showcase professional software development practices, including Git Flow branching, gated Continuous Integration (CI), automated Docker publishing to GitHub Container Registry (GHCR), conventional commit logs, and clean modular code.

## Key Goals & Philosophy
* **Incremental Development:** The codebase is built step-by-step through 18 distinct milestones.
* **DevOps Excellence:** Includes branch protection configurations, automated testing on pull requests, and automated image publishing.
* **Single Container Deployment:** Serves both frontend and backend from a single production Docker container using FastAPI's static file serving capabilities.

---

## Project Structure
The repository is managed as a monorepo:
```
taskflow/
├── ui/          # React SPA (TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query)
├── api/         # REST API (Python, FastAPI, SQLAlchemy, SQLite, Pydantic)
├── docker/      # Multi-stage production Docker configurations
├── docs/        # Project documentation and specifications
└── scripts/     # Local development and build scripts
```

---

## Setup & Local Development

### Prerequisites
* **Node.js** (v18+ recommended) & **pnpm**
* **Python** (v3.11+ recommended) & **uv** (fast Python package installer/manager)

### 1. Backend (API) Setup
Navigate to the `api` folder:
```bash
cd api
uv sync
uv run fastapi dev app/main.py
```
The backend API will run at: `http://localhost:8000/api`
FastAPI's Swagger documentation: `http://localhost:8000/docs`

### 2. Frontend (UI) Setup
Navigate to the `ui` folder:
```bash
cd ui
pnpm install
pnpm dev
```
The dev server will run at: `http://localhost:5173`

---

## Testing

### API Tests
Inside the `api` directory:
```bash
uv run pytest
```

### UI Tests
Inside the `ui` directory:
```bash
pnpm test
```

---

## Production Build & Run
To run the production bundle locally using Docker:
```bash
docker build -t taskflow:latest -f docker/Dockerfile .
docker run -p 8000:8000 taskflow:latest
```
Visit `http://localhost:8000` to interact with the application.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
