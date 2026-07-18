# Architecture

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow follows a **modern monorepo architecture** consisting of two independent applications:

- **UI** — React-based Single Page Application (SPA)
- **API** — FastAPI REST API

During development, both applications run independently to provide a fast developer experience.

During production, the UI is compiled into static assets and embedded inside the API application. FastAPI then serves both the REST API and the frontend from a **single Docker image**.

This architecture combines the flexibility of independent development with the simplicity of a single deployment artifact.

---

# 2. High-Level Architecture

```
                   Development

        ┌────────────────────────────┐
        │                            │
        │       React + Vite          │
        │       (UI Application)      │
        │                            │
        └─────────────┬──────────────┘
                      │
                  /api│
                      ▼
        ┌────────────────────────────┐
        │                            │
        │        FastAPI API         │
        │                            │
        └─────────────┬──────────────┘
                      │
                      ▼
                 SQLite Database
```

---

## Production

```
                Browser
                   │
                   ▼
          ┌────────────────────┐
          │                    │
          │      FastAPI       │
          │                    │
          │  /api/*            │
          │  Static Files      │
          │  React SPA         │
          │                    │
          └─────────┬──────────┘
                    │
                    ▼
               SQLite Database
```

---

# 3. Why This Architecture?

Most React applications require the backend API URL to be injected during build time.

Example:

```
https://api.example.com
```

This creates problems when publishing reusable Docker images because every deployment requires rebuilding the frontend.

Instead, TaskFlow uses a simpler architecture.

The frontend communicates using only relative URLs.

Example:

```
/api/tasks
/api/health
/api/statistics
```

Because both frontend and backend are served by FastAPI, the application works correctly regardless of where it is deployed.

Benefits include:

- No frontend environment variables
- No runtime configuration
- No API URL replacement
- No reverse proxy requirement
- One Docker image
- One exposed port
- Easy deployment

---

# 4. Monorepo Structure

```
taskflow/
│
├── ui/
│
├── api/
│
├── docker/
│
├── docs/
│
├── scripts/
│
├── .github/
│
├── README.md
│
├── LICENSE
│
└── .gitignore
```

Each directory has a single responsibility.

---

# 5. UI Architecture

```
ui/
│
├── src/
│
│   ├── components/
│
│   ├── layouts/
│
│   ├── pages/
│
│   ├── hooks/
│
│   ├── services/
│
│   ├── lib/
│
│   ├── types/
│
│   ├── assets/
│
│   ├── App.tsx
│
│   └── main.tsx
│
├── public/
│
├── package.json
│
└── vite.config.ts
```

### Responsibilities

The UI is responsible for:

- Rendering pages
- User interaction
- API communication
- Form validation
- State management
- Routing

The UI should **not** contain business logic that belongs in the API.

---

# 6. API Architecture

```
api/
│
├── app/
│
│   ├── routers/
│
│   ├── services/
│
│   ├── repositories/
│
│   ├── database/
│
│   ├── models/
│
│   ├── schemas/
│
│   ├── core/
│
│   ├── static/
│
│   ├── main.py
│
│   └── config.py
│
├── tests/
│
├── pyproject.toml
│
└── uv.lock
```

---

# 7. Layered Architecture

The API should follow a layered architecture.

```
HTTP Request

↓

Router

↓

Service

↓

Repository

↓

Database
```

### Router

Responsible for:

- HTTP endpoints
- Request validation
- Response generation

Should contain minimal logic.

---

### Service

Responsible for:

- Business rules
- Validation
- Application logic

This is where most application logic belongs.

---

### Repository

Responsible for:

- Database access
- SQLAlchemy operations
- Data persistence

Repositories should never contain business rules.

---

### Database

Responsible for:

- Data storage
- Transactions
- Persistence

---

# 8. Database Architecture

SQLite is used for this project.

Reasons:

- Zero configuration
- Lightweight
- Fast
- Ideal for CI
- Easy Docker deployment

Future database systems should be replaceable without changing the service layer.

---

# 9. Static File Architecture

After the UI build completes:

```
ui/dist
```

is copied into

```
api/app/static/
```

Result:

```
api/

app/

static/

index.html

assets/

favicon.ico
```

FastAPI serves these files directly.

---

# 10. Request Flow

### API Request

```
Browser

↓

GET /api/tasks

↓

FastAPI Router

↓

Service

↓

Repository

↓

SQLite

↓

JSON Response
```

---

### Frontend Request

```
Browser

↓

GET /

↓

FastAPI

↓

index.html

↓

React
```

---

### React Router Request

```
Browser

↓

GET /tasks

↓

FastAPI

↓

index.html

↓

React Router

↓

Task Page
```

---

# 11. Build Flow

Development

```
UI

↓

npm run dev
```

```
API

↓

uv run fastapi dev
```

Production

```
Build React

↓

Generate dist/

↓

Copy dist/

↓

api/app/static

↓

Build Docker Image

↓

Publish Image
```

---

# 12. Docker Architecture

The Docker image should contain:

```
React Production Build

+

FastAPI

+

SQLite

+

Python Runtime
```

The container exposes only one port.

```
8000
```

Application access:

```
http://localhost:8000
```

API access:

```
http://localhost:8000/api/*
```

---

# 13. Communication

The UI communicates with the backend using only relative URLs.

Correct:

```
/api/tasks
/api/health
/api/statistics
```

Incorrect:

```
http://localhost:8000/api/tasks

https://example.com/api/tasks

VITE_API_URL
```

No absolute URLs should exist inside the frontend application.

---

# 14. Design Principles

The project should follow these principles.

## Separation of Concerns

Each layer has a single responsibility.

---

## Modularity

Features should remain independent whenever possible.

---

## Maintainability

Readable code is preferred over clever code.

---

## Testability

Business logic should be easy to unit test.

---

## Simplicity

Avoid unnecessary abstraction.

The project is intentionally small.

---

## Scalability

Although designed for a university project, the architecture should support future growth without major refactoring.

---

# 15. Future Expansion

The architecture should allow future additions such as:

- User authentication
- PostgreSQL
- Role-based permissions
- File uploads
- REST API versioning
- WebSocket notifications
- Kubernetes deployment
- Automatic VPS deployment

These additions should require minimal architectural changes.

---

# 16. Architecture Rules

The following rules must always be respected.

### UI

- Never access the database directly.
- Never contain backend business logic.
- Never hardcode API URLs.

---

### API

- Own all business logic.
- Validate incoming requests.
- Serve the production UI.
- Expose REST endpoints under `/api`.

---

### Repository

- Only perform database operations.
- Never contain application logic.

---

### General

- Prefer composition over duplication.
- Keep modules loosely coupled.
- Keep responsibilities clearly separated.
- Every layer should be independently testable.
- The architecture should remain simple, readable, and suitable for a professional open-source project.