# Git Workflow

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow follows a simplified **Git Flow** branching strategy designed to demonstrate professional software development practices.

Every feature is developed independently using feature branches, integrated through a development branch, validated in staging, and finally released to production.

The workflow is intentionally designed to satisfy the project objectives of demonstrating:

- Feature Branch Development
- Pull Request Workflow
- Continuous Integration
- Branch Protection
- Code Reviews
- Conventional Commits
- Automated Docker Publishing

---

# 2. Branch Strategy

The repository contains four long-lived branches.

```
main
 ↑
staging
 ↑
dev
 ↑
feature/*
```

Every feature branch is created from **dev**.

---

# 3. Branch Responsibilities

## main

Purpose

Production-ready code.

Rules

- Protected branch
- No direct commits
- No force pushes
- Merge only through Pull Requests
- CI must pass before merging
- Every successful merge triggers Docker image publishing

---

## staging

Purpose

Pre-production validation.

Rules

- Protected branch
- Receives Pull Requests only from `dev`
- Mirrors production as closely as possible
- Used for final verification before release

---

## dev

Purpose

Integration branch.

Rules

- Receives completed features
- Default branch for development
- All features merge here first
- CI runs on every Pull Request

---

## feature/*

Purpose

Develop a single feature.

Rules

- Created from `dev`
- One feature per branch
- Short-lived
- Deleted after merge

---

# 4. Feature Branch Naming

Feature branches should use descriptive names.

Examples

```
feature/project-setup

feature/api-bootstrap

feature/ui-bootstrap

feature/database

feature/task-api

feature/dashboard-ui

feature/create-task

feature/edit-task

feature/delete-task

feature/task-status

feature/search-filter

feature/statistics

feature/api-tests

feature/ui-tests

feature/docker

feature/ci

feature/secrets

feature/publish

feature/documentation
```

Each branch should represent one milestone or one logical feature.

---

# 5. Development Workflow

Every new feature follows the same process.

```
dev

↓

Create Feature Branch

↓

Implement Feature

↓

Commit Changes

↓

Push Branch

↓

Open Pull Request

↓

CI Runs

↓

Merge Into dev
```

---

# 6. Release Workflow

Once multiple completed features exist in `dev`.

```
dev

↓

Pull Request

↓

staging

↓

Verification

↓

Pull Request

↓

main

↓

Docker Publish
```

---

# 7. Example Development Timeline

```
main
 │
 ├────────────── staging
 │                   │
 │                   │
 │                   ▼
 │               Release
 │
 └────────────── dev
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼

feature/api     feature/ui     feature/tests

      │              │              │

      └──────────────┼──────────────┘

                     ▼

                    dev
```

Multiple feature branches may exist simultaneously.

---

# 8. Pull Request Flow

Every feature should follow:

```
feature/task-api

↓

Push

↓

Open Pull Request

↓

GitHub Actions

↓

Review

↓

Merge

↓

Delete Branch
```

No feature branch should be merged without a Pull Request.

---

# 9. Merge Strategy

Use **Squash and Merge** for feature branches.

Example

```
feature/create-task

↓

7 commits

↓

Squash

↓

1 clean commit in dev
```

Benefits

- Cleaner history
- Easier reverts
- Easier release notes
- Simpler commit log

---

# 10. Commit Strategy

Development commits may be small and frequent.

Example

```
feat(api): create task schema

feat(api): implement repository

fix(api): validate title

test(api): add create task tests
```

After review, the Pull Request should be merged using **Squash and Merge**.

---

# 11. Conventional Commits

The repository follows the Conventional Commits specification.

## Feature

```
feat(ui): add dashboard
```

---

## Fix

```
fix(api): validate empty title
```

---

## Documentation

```
docs: update API specification
```

---

## Testing

```
test(api): add CRUD tests
```

---

## Continuous Integration

```
ci: add publish workflow
```

---

## Build

```
build: update Docker image
```

---

## Chore

```
chore: initialize workspace
```

---

## Refactor

```
refactor(api): simplify repository logic
```

---

## Style

```
style(ui): improve spacing
```

---

# 12. Branch Protection

The following branches should be protected.

```
main

staging
```

Recommended protection rules

✅ Require Pull Requests

✅ Require passing status checks

✅ Require branches to be up to date

✅ Block force pushes

✅ Block direct pushes

Optional

- Require approvals
- Dismiss stale reviews
- Restrict who can merge

---

# 13. Continuous Integration

Every Pull Request should automatically trigger CI.

```
feature/*

↓

Pull Request

↓

Install Dependencies

↓

Build UI

↓

Run Frontend Tests

↓

Run Backend Tests

↓

Pass

↓

Merge Allowed
```

If CI fails

```
Merge Blocked
```

---

# 14. Continuous Delivery

Only the `main` branch publishes Docker images.

```
Push

↓

main

↓

GitHub Actions

↓

Build UI

↓

Copy UI → API

↓

Build Docker Image

↓

Publish to GHCR
```

No other branch should publish production images.

---

# 15. Branch Lifecycle

Example

```
git checkout dev

git pull

git checkout -b feature/create-task
```

Development

```
Commit

Commit

Commit
```

Push

```
git push origin feature/create-task
```

Create Pull Request

```
feature/create-task

↓

dev
```

Merge

Delete branch

Repeat.

---

# 16. Release Cycle

Example

```
feature/*

↓

dev

↓

staging

↓

main

↓

Docker Publish

↓

Release
```

Each stage should complete successfully before moving to the next.

---

# 17. Git History Example

```
chore: initialize project

feat(api): bootstrap FastAPI

feat(ui): bootstrap React

feat(api): configure SQLite

feat(api): implement task CRUD

feat(ui): implement dashboard

feat(ui): add create task dialog

feat(ui): implement edit task

feat(ui): implement delete task

feat(ui): implement task status

feat(ui): add search and filtering

feat(ui): add statistics

test(api): add CRUD tests

test(ui): add component tests

feat(devops): add Docker support

ci: add GitHub Actions workflow

feat(devops): configure environment variables

ci: publish Docker image to GHCR

docs: complete project documentation
```

This history should represent the final state of the repository.

---

# 18. GitHub Labels (Optional)

Recommended labels.

```
feature

bug

documentation

testing

ci

docker

enhancement

refactor

question
```

---

# 19. Milestone Mapping

Each milestone should map to a dedicated feature branch.

| Milestone       | Branch                |
| --------------- | --------------------- |
| Project Setup   | feature/project-setup |
| API Bootstrap   | feature/api-bootstrap |
| UI Bootstrap    | feature/ui-bootstrap  |
| Database        | feature/database      |
| Task API        | feature/task-api      |
| Dashboard       | feature/dashboard-ui  |
| Create Task     | feature/create-task   |
| Edit Task       | feature/edit-task     |
| Delete Task     | feature/delete-task   |
| Task Status     | feature/task-status   |
| Search & Filter | feature/search-filter |
| Statistics      | feature/statistics    |
| API Tests       | feature/api-tests     |
| UI Tests        | feature/ui-tests      |
| Docker          | feature/docker        |
| CI              | feature/ci            |
| Secrets         | feature/secrets       |
| Publish         | feature/publish       |
| Documentation   | feature/documentation |

---

# 20. Workflow Rules

The following rules must always be followed.

- Never commit directly to `main`.
- Never commit directly to `staging`.
- Every feature must have its own feature branch.
- Every merge must occur through a Pull Request.
- Every Pull Request must pass CI.
- Every feature should have meaningful commit messages.
- Use Conventional Commits consistently.
- Delete feature branches after merging.
- Keep Pull Requests focused on a single feature.
- Keep the repository in a deployable state after every merge.

---

# 21. AI Agent Instructions

When implementing features, the AI agent must:

1. Work on only one feature branch at a time.
2. Implement only the assigned milestone.
3. Avoid unrelated changes.
4. Produce logical commits throughout development.
5. Assume every milestone ends with a Pull Request into `dev`.
6. Never skip milestones.
7. Never merge directly into `main`.
8. Ensure the project remains buildable and testable after each milestone.

The objective is to produce a repository with a realistic Git history that accurately reflects professional software development practices rather than a single large code generation task.
