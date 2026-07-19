# TaskFlow

TaskFlow is a modern full-stack task management application designed to showcase professional software development practices, including Git Flow branching, gated Continuous Integration (CI), automated Docker publishing to GitHub Container Registry (GHCR), conventional commit logs, and clean modular code.

## Key Goals & Philosophy

- **Incremental Development:** The codebase is built step-by-step through 18 distinct milestones.
- **DevOps Excellence:** Includes branch protection configurations, automated testing on pull requests, and automated image publishing.
- **Single Container Deployment:** Serves both frontend and backend from a single production Docker container using FastAPI's static file serving capabilities.

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

#### 1. Install Node.js & pnpm

- **Node.js**: (v18+ recommended)
- **pnpm** installation:
  - **via npm** (if Node is already installed):
    ```bash
    npm install -g pnpm
    ```
  - **via Standalone Script**:
    - **Windows (PowerShell)**:
      ```powershell
      iwr https://get.pnpm.io/install.ps1 -useb | iex
      ```
    - **macOS/Linux**:
      ```bash
      curl -fsSL https://get.pnpm.io/install.sh | sh -
      ```

#### 2. Install Python & uv

- **Python**: (v3.11+ recommended)
- **uv** (fast Python package installer/manager) installation:
  - **Windows (PowerShell)**:
    ```powershell
    irm https://astral.sh/uv/install.ps1 | iex
    ```
  - **macOS/Linux**:
    ```bash
    curl -LsSf https://astral.sh/uv/install.sh | sh
    ```
  - **via pip**:
    ```bash
    pip install uv
    ```

---

### Monorepo Setup (Recommended)

You can set up and run the entire application directly from the **monorepo root directory**:

```bash
# 1. Install all Node and Python dependencies in one step (runs uv sync automatically)
pnpm install

# 2. Start frontend (Vite) and backend (Uvicorn) concurrently
pnpm dev

# 3. Format all React and Python codebase files
pnpm format

# 4. Lint both frontend and backend codebases
pnpm lint
```

---

### Individual Folder Setup (Alternative)

#### 1. Backend (API) Setup

Navigate to the `api` folder:

```bash
cd api
uv sync
# In development:
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API endpoint: `http://localhost:8000/api`
- Swagger docs: `http://localhost:8000/docs`

#### 2. Frontend (UI) Setup

Navigate to the `ui` folder:

```bash
cd ui
pnpm install
pnpm dev
```

- Dev Server: `http://localhost:5173`

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
