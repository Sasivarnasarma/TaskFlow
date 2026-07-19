# Folder Structure

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow follows a clean and maintainable monorepo structure.

Each top-level directory has a single responsibility.

The project should remain easy to navigate for both contributors and automated development agents.

The folder structure should avoid unnecessary nesting while keeping related files together.

---

# 2. Root Directory

```
taskflow/
│
├── ui/
├── api/
├── docker/
├── docs/
├── scripts/
├── .github/
│
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── README.md
├── LICENSE
└── .editorconfig
```

---

# 3. Root Folder Responsibilities

| Folder  | Purpose                      |
| ------- | ---------------------------- |
| ui      | React application            |
| api     | FastAPI application          |
| docker  | Docker-related files         |
| docs    | Project documentation        |
| scripts | Utility scripts              |
| .github | GitHub Actions and templates |

---

# 4. UI Structure

```
ui/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── task/
│   │   └── ui/
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── store/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── tests/
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# 5. UI Directory Responsibilities

## assets/

Contains:

- Images
- Logos
- Icons
- Fonts (if required)

---

## components/

Reusable React components.

Example:

```
components/

common/

forms/

layout/

task/

ui/
```

Components should be small and reusable.

---

## hooks/

Custom React hooks.

Examples:

```
useTasks()

useTheme()

useDebounce()
```

---

## layouts/

Application layouts.

Example:

```
MainLayout

DashboardLayout
```

---

## lib/

Framework configuration.

Examples:

- Query Client
- Utility libraries
- Theme configuration

---

## pages/

Application pages.

Example:

```
Dashboard

Settings

NotFound
```

Each page represents a route.

---

## routes/

React Router configuration.

---

## services/

API communication.

Example:

```
task.service.ts
statistics.service.ts
```

Only HTTP communication belongs here.

---

## store/

Client-side state management if needed.

If the project does not require global state, this directory may remain empty.

---

## types/

Shared TypeScript interfaces.

Example:

```
Task

CreateTaskRequest

UpdateTaskRequest
```

---

## utils/

Reusable utility functions.

Example:

```
formatDate()

calculateProgress()
```

---

## tests/

Frontend tests.

Example:

```
components/

pages/

hooks/
```

---

# 6. API Structure

```
api/
│
├── app/
│   │
│   ├── core/
│   │
│   ├── database/
│   │
│   ├── models/
│   │
│   ├── repositories/
│   │
│   ├── routers/
│   │
│   ├── schemas/
│   │
│   ├── services/
│   │
│   ├── static/
│   │
│   ├── main.py
│   └── config.py
│
├── tests/
│
├── pyproject.toml
└── uv.lock
```

---

# 7. API Directory Responsibilities

## core/

Application configuration.

Examples:

```
settings.py

logging.py

security.py
```

---

## database/

Database configuration.

Examples:

```
engine.py

session.py

base.py
```

---

## models/

SQLAlchemy models.

One file per model.

Example:

```
task.py
```

---

## repositories/

Database access layer.

Responsible only for persistence.

Example:

```
task_repository.py
```

Repositories should not contain business logic.

---

## routers/

REST API endpoints.

Example:

```
health.py

tasks.py
```

Routers should be thin.

---

## schemas/

Pydantic models.

Example:

```
task.py
statistics.py
```

Responsible for:

- Request validation
- Response serialization

---

## services/

Business logic.

Example:

```
task_service.py
statistics_service.py
```

This layer contains the majority of application logic.

---

## static/

Generated frontend build.

After production build:

```
static/

index.html

assets/
```

Nothing inside this folder should be edited manually.

Its contents are generated automatically.

---

## tests/

Backend tests.

Suggested structure:

```
tests/

routers/

services/

repositories/
```

---

# 8. Docker Directory

```
docker/
│
├── Dockerfile
└── .dockerignore
```

Responsibilities:

- Docker image
- Multi-stage build
- Production packaging

Only Docker-related files belong here.

---

# 9. Scripts Directory

```
scripts/
│
├── build-ui.sh
├── copy-ui.sh
├── dev.sh
└── clean.sh
```

Responsibilities:

- Helper scripts
- Local development automation
- Build automation

Scripts should avoid containing business logic.

---

# 10. Documentation Directory

```
docs/
│
├── 01-project-overview.md
├── 02-architecture.md
├── 03-tech-stack.md
├── 04-folder-structure.md
├── 05-api-specification.md
├── 06-ui-design.md
├── 07-development-roadmap.md
├── 08-git-workflow.md
├── 09-testing.md
├── 10-ci-cd.md
└── 11-ai-agent-instructions.md
```

Each document focuses on a single topic.

---

# 11. GitHub Directory

```
.github/
│
├── workflows/
│   ├── ci.yml
│   └── publish.yml
│
├── ISSUE_TEMPLATE/
│
└── pull_request_template.md
```

Responsibilities:

- CI/CD workflows
- GitHub templates
- Repository automation

---

# 12. Generated Files

The following files are generated automatically and should **never** be edited manually.

```
ui/dist/

api/app/static/

node_modules/

__pycache__/

.pytest_cache/

.coverage/
```

These directories should be ignored by Git whenever appropriate.

---

# 13. Folder Naming Rules

Directory names should:

- Use lowercase letters.
- Use hyphens only when necessary.
- Avoid spaces.
- Clearly describe their purpose.

Good:

```
task/

services/

repositories/

database/
```

Avoid:

```
TaskFiles/

Helpers/

Misc/

Temp/
```

---

# 14. File Naming Rules

## Python

Use snake_case.

Examples:

```
task_service.py

database.py

task_repository.py
```

---

## TypeScript

Use PascalCase for React components.

Examples:

```
TaskCard.tsx

TaskForm.tsx

Dashboard.tsx
```

Use camelCase or kebab-case for utility files.

Examples:

```
task.service.ts

date-utils.ts
```

Maintain consistency throughout the project.

---

# 15. Architectural Rules

The folder structure should enforce separation of concerns.

### UI

- Responsible only for presentation and user interaction.
- No backend business logic.
- No database access.

---

### API

- Owns all business logic.
- Owns validation.
- Owns persistence.
- Serves the production UI.

---

### Services

- Contain business rules.
- Coordinate repositories.
- Never perform HTTP routing.

---

### Repositories

- Perform only database operations.
- Never contain business logic.

---

### Routers

- Receive requests.
- Validate input.
- Call services.
- Return responses.

Keep routers as thin as possible.

---

# 16. Scalability

The folder structure should allow future expansion without major refactoring.

Future additions may include:

```
authentication/

notifications/

users/

roles/

uploads/

websocket/
```

These features should integrate naturally into the existing structure.

---

# 17. Folder Structure Principles

The structure should always prioritize:

- Simplicity
- Readability
- Maintainability
- Testability
- Modularity
- Clear ownership
- Low coupling
- High cohesion

Every file should have a clear purpose, and every directory should represent a single responsibility.

The goal is to create a repository that is easy to understand for new contributors, maintainers, and AI development agents.
