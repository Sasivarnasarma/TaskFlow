# AI Agent Instructions

> **Document Version:** 1.0.0  
> **Project:** TaskFlow  
> **Audience:** AI Coding Agents (Claude Code, Codex CLI, Gemini CLI, Cline, Roo Code, Cursor Agent, Windsurf, etc.)

---

# 1. Purpose

This document defines the rules an AI coding agent **must** follow while developing TaskFlow.

The objective is **not** to generate the complete project in a single prompt.

Instead, the AI agent should behave like a professional software engineer working on a real project.

The repository should evolve gradually through multiple feature branches, commits, pull requests, and milestones.

---

# 2. Primary Objective

Your objective is to produce a repository that demonstrates:

- Professional architecture
- Clean Git history
- Incremental development
- Testable code
- Modern DevOps practices
- Production-ready Docker image
- CI/CD pipeline

Do **not** optimize for completing the project as quickly as possible.

Optimize for **maintainability and realistic development history**.

---

# 3. Required Reading Order

Before implementing any code, you **must** understand the following documents in order:

1. `01-project-overview.md`
2. `02-architecture.md`
3. `03-tech-stack.md`
4. `04-folder-structure.md`
5. `05-api-specification.md`
6. `06-ui-design.md`
7. `07-development-roadmap.md`
8. `08-git-workflow.md`
9. `09-testing.md`
10. `10-ci-cd.md`

Do not begin implementation until these documents are understood.

---

# 4. Development Strategy

The project **must be developed incrementally**.

Never generate the entire application at once.

Every implementation request should complete **one milestone only**.

Example

Good

```
Implement Milestone 4
```

Bad

```
Implement the whole application
```

---

# 5. Milestone Rules

Each milestone should:

- Have one responsibility
- Produce a working application
- Leave the project buildable
- Include appropriate tests
- Be independently reviewable

Do not mix milestones.

---

# 6. Scope Control

Only implement the requested milestone.

Never implement future features.

Example

If asked to implement

```
Dashboard
```

Do NOT also implement

- Search
- Filters
- Statistics
- Authentication

Stay within scope.

---

# 7. Git Workflow

Assume every milestone follows this workflow.

```
dev

↓

feature/<name>

↓

Development

↓

Commit

↓

Push

↓

Pull Request

↓

CI

↓

Merge

↓

Delete Branch
```

Never assume direct commits to `main`.

---

# 8. Commit Philosophy

Write code as if every milestone will become its own Pull Request.

Keep commits:

- Small
- Logical
- Reviewable

Avoid giant commits.

---

# 9. Commit Messages

Use Conventional Commits.

Examples

```
feat(ui): add dashboard

feat(api): implement CRUD

fix(api): validate title

test(api): add CRUD tests

docs: update API specification

ci: add GitHub Actions workflow

chore: configure workspace
```

---

# 10. Code Quality

Every implementation should prioritize:

- Readability
- Simplicity
- Maintainability
- Type safety
- Reusability

Avoid unnecessary abstractions.

Avoid premature optimization.

---

# 11. Architecture Compliance

Follow the documented architecture.

UI responsibilities

- Presentation
- User interaction
- API communication

API responsibilities

- Business logic
- Validation
- Persistence

Do not violate layer boundaries.

---

# 12. Folder Structure

Do not create arbitrary folders.

Follow the documented folder structure.

Every new file should belong in an appropriate directory.

Avoid folders such as

```
misc

helpers

temp

utils2
```

unless they have a clear purpose.

---

# 13. Naming Conventions

Use descriptive names.

Good

```
TaskService

TaskRepository

CreateTaskDialog

StatisticsCard
```

Avoid

```
Helper

Manager

Data

Thing

Temp
```

---

# 14. UI Development Rules

The UI should:

- Use React
- Use TypeScript
- Use shadcn/ui
- Use Tailwind CSS
- Use TanStack Query
- Use React Router

Avoid unnecessary third-party libraries.

Prefer reusable components.

---

# 15. API Development Rules

The API should:

- Use FastAPI
- Use SQLAlchemy
- Use Pydantic
- Follow REST principles

Business logic belongs inside services.

Routers should remain thin.

Repositories should only access the database.

---

# 16. Database Rules

Use SQLite.

All database access should go through repositories.

Never access the database directly from routes.

Future database replacement should require minimal changes.

---

# 17. Frontend Communication

The UI must always communicate using relative URLs.

Correct

```
/api/tasks
```

Incorrect

```
http://localhost:8000/api/tasks

https://example.com/api/tasks

VITE_API_URL
```

The frontend should never contain environment-specific API URLs.

---

# 18. Production Architecture

During production

```
React

↓

Build

↓

dist/

↓

Copy

↓

api/app/static

↓

FastAPI

↓

Docker
```

The final Docker image contains both applications.

Do not introduce a reverse proxy.

---

# 19. Docker Rules

Build one Docker image.

Do not build separate frontend and backend production images.

The published image should run using

```bash
docker run -p 8000:8000 ghcr.io/<owner>/taskflow:latest
```

without additional configuration.

---

# 20. Testing Rules

Every feature should include appropriate tests.

Never remove existing tests.

Never disable tests to make CI pass.

Write tests that verify behavior rather than implementation.

---

# 21. CI Rules

The project contains two workflows.

```
ci.yml
```

Responsible for

- Build
- Tests

```
publish.yml
```

Responsible for

- Docker image
- GHCR publish

Do not combine these workflows.

---

# 22. Secrets

Never commit

```
.env
```

Use

```
.env.example
```

Production secrets belong in GitHub Secrets.

---

# 23. Documentation

Whenever a new feature changes architecture or usage, update the relevant documentation.

Documentation is part of the implementation.

---

# 24. Dependency Management

Frontend

Use

```
pnpm
```

Backend

Use

```
uv
```

Do not introduce additional package managers.

---

# 25. Error Handling

Errors should be:

- Predictable
- User-friendly
- Consistent

Never expose stack traces to users.

---

# 26. UI Principles

The UI should feel like a modern SaaS application.

Prioritize

- Simplicity
- Accessibility
- Consistency

Avoid unnecessary animations.

Avoid excessive visual effects.

---

# 27. Performance

Do not optimize prematurely.

Prefer clean architecture over micro-optimizations.

Only optimize when necessary.

---

# 28. Refactoring

Small improvements are encouraged.

Large architectural refactors should not occur unless explicitly requested.

Avoid changing unrelated files.

---

# 29. Pull Request Mindset

Every implementation should be written as though it will be reviewed by another developer.

Ask yourself:

- Is this easy to review?
- Is this logically scoped?
- Is this documented?
- Is this tested?

If the answer is no, improve it before considering the milestone complete.

---

# 30. Definition of Done

A milestone is complete only when:

- Requested functionality is implemented.
- Code builds successfully.
- Existing tests pass.
- New tests are added where appropriate.
- Documentation is updated if required.
- Code follows the documented architecture.
- No unrelated changes are introduced.

---

# 31. Things You Must NOT Do

Never:

- Implement multiple milestones together.
- Skip testing.
- Skip documentation.
- Ignore architecture documents.
- Hardcode secrets.
- Hardcode API URLs.
- Introduce unnecessary frameworks.
- Refactor unrelated code.
- Break existing functionality.
- Create overly large files or components without justification.

---

# 32. Final Goal

The goal is **not simply to build TaskFlow**.

The goal is to create a repository that looks like it was developed by a professional software engineer over time.

A successful repository should demonstrate:

- Clean architecture
- Small, meaningful commits
- Logical feature branches
- High-quality documentation
- Automated testing
- CI/CD automation
- Docker publishing
- Maintainable codebase

If two solutions are functionally equivalent, always choose the one that is:

- Simpler
- Easier to maintain
- Easier to review
- More consistent with the existing architecture
- Better aligned with modern software engineering practices