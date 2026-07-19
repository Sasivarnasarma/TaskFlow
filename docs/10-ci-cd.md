# Continuous Integration & Continuous Delivery (CI/CD)

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow follows a modern CI/CD workflow built with **GitHub Actions**.

The workflow is intentionally designed to demonstrate professional DevOps practices while satisfying the project objectives.

The CI/CD pipeline is responsible for:

- Verifying code quality
- Running automated tests
- Preventing broken code from being merged
- Building production artifacts
- Publishing Docker images automatically

The pipeline should be fully automated and require minimal manual intervention.

---

# 2. CI/CD Philosophy

The project separates **Continuous Integration** and **Continuous Delivery** into independent workflows.

```
Continuous Integration

↓

Validate Code

↓

Run Tests

↓

Allow Merge

-------------------------

Continuous Delivery

↓

Build Application

↓

Package Docker Image

↓

Publish Image
```

This separation keeps workflows simple, reusable, and easier to maintain.

---

# 3. Workflow Overview

TaskFlow uses two GitHub Actions workflows.

| Workflow    | Purpose                |
| ----------- | ---------------------- |
| ci.yml      | Validate Pull Requests |
| publish.yml | Publish Docker image   |

---

# 4. Continuous Integration

## Workflow

```
ci.yml
```

Purpose

Validate every Pull Request before it can be merged.

---

## Trigger

Run on Pull Requests targeting:

```
dev

staging

main
```

Example

```yaml
on:
  pull_request:
    branches:
      - dev
      - staging
      - main
```

---

# 5. CI Pipeline

Every Pull Request executes the following pipeline.

```
Checkout Repository

↓

Setup Node.js

↓

Install UI Dependencies

↓

Build UI

↓

Run UI Tests

↓

Setup Python

↓

Install API Dependencies

↓

Run API Tests

↓

CI Passed

↓

Merge Allowed
```

Any failure must stop the workflow immediately.

---

# 6. CI Responsibilities

The CI workflow should verify:

- Repository can be cloned
- Dependencies install correctly
- UI builds successfully
- API dependencies install successfully
- Backend tests pass
- Frontend tests pass
- Application is production-ready

The workflow should **not** publish Docker images.

---

# 7. Continuous Delivery

Continuous Delivery is handled by a separate workflow.

```
publish.yml
```

---

## Trigger

Runs only after successful pushes to:

```
main
```

Example

```yaml
on:
  push:
    branches:
      - main
```

---

# 8. Publish Pipeline

```
Checkout Repository

↓

Setup Node.js

↓

Install UI Dependencies

↓

Build UI

↓

Copy UI Build

↓

api/app/static

↓

Setup Python

↓

Build Docker Image

↓

Login to GHCR

↓

Push Docker Image

↓

Completed
```

This workflow should only execute if the code has already passed CI and been merged into `main`.

---

# 9. Docker Build Strategy

TaskFlow is distributed as **one Docker image**.

Unlike traditional deployments with separate frontend and backend containers, TaskFlow packages both applications together.

Build process

```
React

↓

Production Build

↓

dist/

↓

Copy

↓

api/app/static

↓

Docker Build

↓

Single Image
```

---

# 10. Docker Image Contents

The published image contains:

- FastAPI
- React production build
- SQLite database
- Python runtime
- Static assets

The image should expose only one application port.

```
8000
```

The container should run using the following Uvicorn command:

```json
[
  "uvicorn",
  "main:app",
  "--host",
  "0.0.0.0",
  "--port",
  "8000",
  "--proxy-headers",
  "--forwarded-allow-ips=*"
]
```

Running the image should immediately provide access to both the UI and API.

---

# 11. GitHub Container Registry

Docker images are published to:

```
ghcr.io/<owner>/taskflow
```

The workflow should automatically authenticate using GitHub's built-in token.

No personal access token should be required for publishing within the repository.

---

# 12. Image Tags

Each successful publish should generate multiple tags.

Recommended tags

```
latest

main

sha-<commit-sha>
```

Example

```
ghcr.io/example/taskflow:latest

ghcr.io/example/taskflow:main

ghcr.io/example/taskflow:sha-a1b2c3d
```

Using commit SHA tags makes every published image traceable to a specific Git commit.

---

# 13. Branch Workflow

The complete development workflow is:

```
feature/*

↓

Pull Request

↓

dev

↓

CI

↓

Merge

↓

staging

↓

CI

↓

Merge

↓

main

↓

CI

↓

Merge

↓

publish.yml

↓

Docker Image

↓

GHCR
```

Only the `main` branch is allowed to publish production images.

---

# 14. Branch Protection

The following branches should be protected.

```
main

staging
```

Recommended protection rules

✅ Require Pull Requests

✅ Require successful CI

✅ Require branch to be up to date

✅ Prevent force pushes

✅ Prevent direct commits

---

# 15. Secrets Management

Secrets must never be committed to the repository.

GitHub Repository Secrets should be used.

Examples

```
GITHUB_TOKEN

(optional future)

DOCKERHUB_USERNAME

DOCKERHUB_TOKEN
```

TaskFlow currently publishes only to GHCR.

The automatically provided `GITHUB_TOKEN` is sufficient.

---

# 16. Environment Variables

Development uses local `.env` files.

Production uses GitHub Secrets where required.

The repository should contain

```
.env.example
```

but never

```
.env
```

---

# 17. Build Rules

The UI must always be built before the Docker image.

Build order

```
Install UI

↓

Build UI

↓

Copy UI

↓

Build Docker

↓

Push Docker
```

The Docker build should never rely on a development build.

---

# 18. Failure Strategy

The workflow should fail immediately when:

- Dependency installation fails
- UI build fails
- Backend tests fail
- Frontend tests fail
- Docker build fails
- Image push fails

A failed workflow should never publish an image.

---

# 19. Deployment Strategy

TaskFlow is designed to be deployment-agnostic.

Because the frontend is bundled into FastAPI, deployment only requires one container.

Example

```bash
docker run -p 8000:8000 ghcr.io/<owner>/taskflow:latest
```

No reverse proxy is required.

No frontend environment variables are required.

No API URL configuration is required.

The UI communicates with the backend using relative `/api/*` endpoints.

---

# 20. Future CD Enhancements

The architecture should allow future workflows such as:

- Automatic VPS deployment
- Kubernetes deployment
- Helm chart publishing
- Docker Hub publishing
- Multi-platform Docker builds
- Security scanning
- Dependency updates
- Release automation
- Semantic versioning
- GitHub Releases

These are intentionally outside the scope of the initial implementation.

---

# 21. CI/CD Rules

Every workflow should follow these rules.

### CI

- Run on Pull Requests.
- Never publish artifacts.
- Fail fast.
- Block merges on failure.

---

### Publish

- Run only on `main`.
- Publish only after successful CI.
- Build a production-ready Docker image.
- Push images to GHCR.

---

### Repository

- Keep workflows independent.
- Avoid duplicated steps where practical.
- Prefer official GitHub Actions.
- Keep workflows readable and maintainable.

---

# 22. Success Criteria

The CI/CD implementation is considered complete when:

- Pull Requests automatically run CI.
- Failing tests block merges.
- `main` is protected.
- Merging into `main` automatically publishes a Docker image.
- The published image can be started with a single Docker command.
- No secrets are stored in the repository.
- The workflows require no manual intervention during normal development.

---

# 23. AI Agent Instructions

When implementing the CI/CD pipeline, the AI agent must:

1. Create **two separate GitHub Actions workflows**:
   - `ci.yml`
   - `publish.yml`
2. Keep Continuous Integration and Continuous Delivery independent.
3. Ensure CI validates the application before allowing merges.
4. Ensure only `main` triggers Docker image publishing.
5. Build the React application before packaging the Docker image.
6. Copy the production UI build into `api/app/static` before the Docker build.
7. Publish images to GitHub Container Registry using the repository's `GITHUB_TOKEN`.
8. Never hardcode secrets or credentials.
9. Keep workflows simple, modular, and easy to understand.
10. Design the workflows so they can be extended later without major restructuring.

The objective is to demonstrate a realistic CI/CD pipeline that mirrors professional software development practices while remaining appropriate for a university DevOps project.
