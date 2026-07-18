# Technology Stack

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow is built using a modern, production-ready technology stack that emphasizes developer experience, maintainability, and DevOps best practices.

The technologies selected for this project are intentionally lightweight while still reflecting tools commonly used in professional software development.

---

# 2. Technology Overview

| Category | Technology |
|----------|------------|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Routing | React Router |
| Data Fetching | TanStack Query |
| Backend | FastAPI |
| Language | Python |
| Validation | Pydantic |
| ORM | SQLAlchemy |
| Database | SQLite |
| Python Package Manager | uv |
| JavaScript Package Manager | pnpm |
| Testing (UI) | Vitest + React Testing Library |
| Testing (API) | pytest |
| Containerization | Docker |
| CI/CD | GitHub Actions |
| Image Registry | GitHub Container Registry (GHCR) |
| Version Control | Git |
| Repository Hosting | GitHub |

---

# 3. Frontend Stack

## React

React is used to build the user interface.

Reasons:

- Component-based architecture
- Large ecosystem
- Easy testing
- Excellent TypeScript support
- Industry standard

React is responsible only for rendering the user interface and communicating with the API.

Business logic should remain inside the backend whenever possible.

---

## TypeScript

TypeScript is used instead of JavaScript.

Reasons:

- Static type checking
- Better IDE support
- Easier refactoring
- Fewer runtime errors
- Better maintainability

All new frontend code should use TypeScript.

---

## Vite

Vite is used as the frontend build tool.

Reasons:

- Extremely fast startup
- Fast Hot Module Reload (HMR)
- Optimized production builds
- Excellent React support

During development:

```
pnpm dev
```

During production:

```
pnpm build
```

---

## Tailwind CSS

Tailwind CSS provides utility-first styling.

Reasons:

- Rapid UI development
- Small production bundle
- Consistent design
- No custom CSS required for most components

Custom CSS should only be written when Tailwind utilities cannot achieve the desired result.

---

## shadcn/ui

shadcn/ui provides reusable UI components.

Reasons:

- Accessible components
- Modern design
- Fully customizable
- No runtime dependency
- Easy integration with Tailwind

The project should reuse existing components whenever possible instead of building custom components from scratch.

---

## Lucide React

Lucide provides SVG icons.

Reasons:

- Lightweight
- Consistent icon style
- Tree-shakeable
- Modern icon set

---

## React Router

React Router manages client-side navigation.

Responsibilities:

- Page routing
- Navigation
- URL management
- Nested routes

---

## TanStack Query

TanStack Query manages server state.

Responsibilities:

- Data fetching
- Request caching
- Background refetching
- Loading states
- Error handling

The application should avoid manual API state management where TanStack Query provides a better solution.

---

# 4. Backend Stack

## FastAPI

FastAPI is the backend framework.

Reasons:

- High performance
- Automatic OpenAPI documentation
- Excellent typing support
- Easy testing
- Modern Python ecosystem

Responsibilities:

- REST API
- Request validation
- Business logic
- Static file serving
- Health endpoints

---

## Python

Python is the primary backend language.

Reasons:

- Readable syntax
- Excellent ecosystem
- Fast development
- Strong testing support

The project should target the latest stable Python version available at development time.

---

## Pydantic

Pydantic handles request and response validation.

Responsibilities:

- Request validation
- Response serialization
- Configuration management
- Data models

---

## SQLAlchemy

SQLAlchemy is used as the ORM.

Responsibilities:

- Database models
- Queries
- Relationships
- Transactions

Database access should always go through SQLAlchemy.

Raw SQL should be avoided unless absolutely necessary.

---

## SQLite

SQLite is used as the database.

Reasons:

- Zero configuration
- Easy Docker deployment
- Fast setup
- Ideal for CI
- Lightweight

The project should abstract database access so SQLite can be replaced in the future if necessary.

---

# 5. Development Tools

## pnpm

pnpm is the JavaScript package manager.

Reasons:

- Fast
- Efficient disk usage
- Workspace support
- Reliable dependency management

All frontend dependencies should be installed using pnpm.

---

## uv

uv manages Python environments and dependencies.

Reasons:

- Extremely fast
- Modern Python tooling
- Reliable dependency resolution
- Simpler workflow than traditional virtual environments

All backend commands should use `uv`.

Example:

```
uv sync
uv run pytest
uv run fastapi dev
```

---

# 6. Testing Stack

Testing is a mandatory part of the project.

Every feature should be testable.

---

## Frontend Testing

### Vitest

Responsibilities:

- Unit testing
- Component testing
- Fast execution

---

### React Testing Library

Responsibilities:

- User interaction testing
- Component rendering
- Accessibility-focused testing

Tests should focus on user behavior rather than implementation details.

---

## Backend Testing

### pytest

Responsibilities:

- Unit tests
- API tests
- Validation tests
- Integration tests

Business logic should always be tested.

---

# 7. DevOps Stack

## Docker

Docker provides application packaging.

Responsibilities:

- Build reproducible images
- Simplify deployment
- Ensure consistent environments

The final Docker image contains:

- React production build
- FastAPI
- SQLite
- Python runtime

---

## GitHub Actions

GitHub Actions provides Continuous Integration and Continuous Delivery.

Responsibilities:

- Run automated tests
- Verify builds
- Publish Docker images
- Validate pull requests

Two workflows will be implemented.

### CI

Runs on Pull Requests.

Responsibilities:

- Install dependencies
- Build UI
- Execute frontend tests
- Execute backend tests

---

### Publish

Runs after successful pushes to `main`.

Responsibilities:

- Build React
- Copy UI build into API
- Build Docker image
- Push image to GitHub Container Registry

---

## GitHub Container Registry

GHCR stores published Docker images.

Example:

```
ghcr.io/<owner>/taskflow
```

Images should include multiple tags.

Example:

```
latest

main

sha-xxxxxxxx
```

---

# 8. Version Control

## Git

Git manages source control.

Development follows Git Flow.

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

Conventional Commits should be used.

Example:

```
feat(ui): add task creation dialog

fix(api): validate task title

test(api): add CRUD tests

ci: add publish workflow

docs: update architecture
```

---

# 9. Repository Hosting

GitHub hosts:

- Source code
- Pull Requests
- Issues
- Actions
- Container Registry
- Releases

All development should occur through GitHub Pull Requests.

---

# 10. Future Technologies

The architecture should allow future integration with technologies such as:

- PostgreSQL
- Redis
- OAuth
- JWT Authentication
- OpenTelemetry
- Prometheus
- Grafana
- Kubernetes
- Helm
- Argo CD

These technologies are intentionally excluded from the initial implementation to keep the project focused on the assignment objectives.

---

# 11. Technology Selection Principles

Every technology selected for this project should satisfy the following principles.

## Simplicity

Prefer simple solutions over complex frameworks.

---

## Maintainability

The project should remain easy to understand for new contributors.

---

## Developer Experience

The development workflow should be fast and enjoyable.

---

## Testability

Every layer should be independently testable.

---

## Performance

Choose tools that provide fast builds and efficient execution.

---

## Community Support

Technologies should have active communities and long-term support.

---

## Open Source

Whenever possible, prefer mature open-source technologies.

---

# 12. Summary

The chosen technology stack provides:

- Modern frontend development
- High-performance backend
- Type safety
- Automated testing
- Containerized deployment
- Professional CI/CD workflow
- Excellent developer experience
- Easy onboarding for contributors
- Clean separation of concerns

The stack intentionally avoids unnecessary complexity while remaining scalable enough for future enhancements.