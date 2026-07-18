# Project Overview

> **Project Name:** TaskFlow  
> **Version:** 1.0.0  
> **Project Type:** Full-Stack Web Application  

---

# 1. Introduction

TaskFlow is a modern full-stack task management application designed to demonstrate professional software development practices rather than simply building a CRUD application.

Although TaskFlow provides a clean and functional task management experience, its primary purpose is to showcase:

- Git Flow branching strategy
- Continuous Integration (CI)
- Docker image publishing
- GitHub Actions
- Secrets Management
- Branch Protection
- Automated Testing
- Modern project architecture

This project is intentionally developed in multiple milestones so that each feature is implemented independently through Git feature branches, resulting in a realistic Git history.

---

# 2. Project Objectives

The main objective of this project is to build a production-quality repository that demonstrates modern DevOps workflows.

The application itself should remain simple while the development workflow reflects real-world software engineering practices.

Upon completion, the project should demonstrate:

- Feature branch development
- Pull Request based workflow
- Protected production branch
- Automated CI pipeline
- Automated Docker image publishing
- Conventional Commit history
- Automated testing
- GitHub Container Registry publishing

---

# 3. Application Overview

TaskFlow allows users to manage daily tasks through a clean web interface.

Users will be able to:

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Mark tasks as completed
- Search tasks
- Filter tasks
- View task statistics

The application is intentionally lightweight so the primary focus remains on the CI/CD pipeline rather than business complexity.

---

# 4. Development Philosophy

This project **must never be developed in a single implementation**.

Instead, development will follow an incremental milestone-based approach.

Each milestone should:

- implement one logical feature
- be fully functional
- include testing when appropriate
- be committed independently
- be merged through Git Flow
- leave the application in a working state

The goal is to simulate a real software development lifecycle rather than generating an entire application in one commit.

---

# 5. Target Users

This project is intended for:

- University assessment
- DevOps portfolio
- GitHub portfolio
- Learning GitHub Actions
- Learning Git Flow
- Learning Docker publishing
- Demonstrating CI/CD pipelines

---

# 6. Core Features

## Task Management

- Create Task
- Edit Task
- Delete Task
- Complete Task

## Organization

- Search Tasks
- Filter Tasks
- Sort Tasks
- Task Statistics

## User Interface

- Responsive design
- Modern UI
- Light/Dark theme
- Fast loading
- Clean user experience

---

# 7. Technical Goals

The project should demonstrate modern development practices including:

- Modular architecture
- Clean code
- Layered API design
- Reusable UI components
- Type safety
- Automated testing
- Continuous Integration
- Continuous Delivery

---

# 8. Technology Stack

## UI

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query

## API

- FastAPI
- Python
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

## Development Tools

- pnpm
- uv
- Git
- GitHub

## Testing

UI

- Vitest
- React Testing Library

API

- pytest

## DevOps

- Docker
- GitHub Actions
- GitHub Container Registry (GHCR)

---

# 9. Project Architecture

The project follows a monorepo architecture.

```
taskflow/
│
├── ui/
├── api/
├── docker/
├── docs/
├── scripts/
├── .github/
└── README.md
```

The UI and API are developed independently during development.

During production:

1. The UI is built.
2. The generated static files are copied into the API project.
3. FastAPI serves both the REST API and the React application.
4. A single Docker image is produced.

This architecture eliminates the need for runtime frontend API configuration while providing a simple deployment experience.

---

# 10. Deployment Strategy

The application will be distributed as a single Docker image.

The Docker image will contain:

- FastAPI application
- React production build
- SQLite database
- Static assets

Running the application should only require:

```bash
docker run -p 8000:8000 ghcr.io/<owner>/taskflow:latest
```

No reverse proxy should be required.

No frontend API URL configuration should be required.

The frontend must communicate with the backend using relative `/api/*` endpoints.

---

# 11. Git Workflow

Development must follow Git Flow.

```
feature/*
      │
      ▼
dev
      │
      ▼
staging
      │
      ▼
main
```

Rules:

- Never develop directly on `main`
- Never commit directly to `staging`
- Every feature must have its own branch
- Every merge should occur through a Pull Request
- CI must pass before merging

---

# 12. Continuous Integration

Every Pull Request should automatically execute the CI pipeline.

The pipeline should verify:

- Dependencies install successfully
- UI builds successfully
- API starts successfully
- Backend tests pass
- Frontend tests pass

Any failure must block merging.

---

# 13. Continuous Delivery

After a successful merge into `main`:

1. Build the UI
2. Copy the production build into the API
3. Build the Docker image
4. Tag the image
5. Publish the image to GitHub Container Registry

Only successful builds should be published.

---

# 14. Secrets Management

Sensitive configuration must never be committed to the repository.

The project should use:

- `.env.example` for documentation
- GitHub Repository Secrets for CI
- Local `.env` files during development

The repository must not contain any real secrets.

---

# 15. Definition of Done

The project is considered complete when:

- All planned milestones are implemented.
- Every feature has its own Git history.
- All tests pass.
- CI passes successfully.
- Branch protection is enforced.
- Docker images are automatically published.
- Documentation is complete.
- The application can be started using a single Docker image.

---

# 16. Important Notes for AI Agents

This repository **must be developed incrementally**.

Do **NOT** implement multiple milestones in a single task.

For every milestone:

1. Implement only the requested functionality.
2. Do not work on future milestones.
3. Keep the application runnable.
4. Keep commits small and focused.
5. Follow the documented architecture.
6. Avoid introducing unnecessary complexity.
7. Prefer readability and maintainability over clever solutions.

The objective is to produce a repository that resembles a real professional software project with a clean commit history, rather than a single large code generation task.