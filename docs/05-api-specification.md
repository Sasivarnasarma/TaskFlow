# API Specification

> **Document Version:** 1.0.0  
> **Project:** TaskFlow

---

# 1. Overview

TaskFlow exposes a RESTful API used by the UI.

The API is responsible for:

- Business logic
- Data validation
- Data persistence
- Statistics generation

The API is **not** responsible for rendering the UI. It only serves the built frontend as static files in production.

All REST endpoints must be prefixed with:

```
/api
```

Example:

```
GET /api/tasks
```

---

# 2. API Design Principles

The API should follow these principles.

- RESTful
- Stateless
- JSON only
- Predictable URLs
- Proper HTTP status codes
- Consistent response structure
- Validation on every request
- Meaningful error messages

---

# 3. Base URL

Development

```
http://localhost:8000/api
```

Production

```
https://example.com/api
```

The frontend must always communicate using relative URLs.

Example

```
/api/tasks
```

---

# 4. API Versioning

Versioning is intentionally omitted in the first release.

Future versions may adopt:

```
/api/v1
```

without changing the application architecture.

---

# 5. Authentication

Authentication is **not** part of the initial release.

All endpoints are publicly accessible.

The architecture should allow authentication to be added later without major refactoring.

---

# 6. Content Type

All requests and responses use JSON.

Request

```http
Content-Type: application/json
```

Response

```http
Content-Type: application/json
```

---

# 7. Data Model

## Task

```json
{
  "id": 1,
  "title": "Complete DevOps Assignment",
  "description": "Finish CI pipeline activity",
  "priority": "HIGH",
  "status": "TODO",
  "createdAt": "2026-07-18T10:00:00Z",
  "updatedAt": "2026-07-18T10:00:00Z"
}
```

---

# 8. Enumerations

## Priority

```
LOW

MEDIUM

HIGH
```

---

## Status

```
TODO

IN_PROGRESS

DONE
```

---

# 9. Standard Response Format

Successful responses should return JSON objects.

Example

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Collections

```json
{
  "success": true,
  "data": [],
  "error": null
}
```

---

Errors

```json
{
  "success": false,
  "data": null,
  "error": "Task not found"
}
```

The API should remain simple and use standard response envelopes.

---

# 10. Endpoints

---

## Health Check

### GET

```
/api/health
```

Purpose

Checks whether the API is running.

---

Response

```json
{
  "status": "ok"
}
```

HTTP

```
200 OK
```

---

# Get All Tasks

### GET

```
/api/tasks
```

Purpose

Returns all tasks.

---

Query Parameters

Optional.

```
status

priority

search

sort
```

Example

```
GET /api/tasks?status=TODO
```

---

Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Write Tests"
    }
  ],
  "error": null
}
```

HTTP

```
200 OK
```

---

# Get Task

### GET

```
/api/tasks/{id}
```

Example

```
GET /api/tasks/10
```

---

Response

```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Write Tests"
  },
  "error": null
}
```

Errors

```
404 Not Found
```

---

# Create Task

### POST

```
/api/tasks
```

Request

```json
{
  "title": "Write Documentation",
  "description": "Finish project docs",
  "priority": "HIGH"
}
```

Rules

- title is required
- title cannot be empty
- priority is optional
- status defaults to TODO

---

Response

```json
{
  "success": true,
  "data": {
    "id": 20,
    "title": "Write Documentation"
  },
  "error": null
}
```

HTTP

```
201 Created
```

---

# Update Task

### PUT

```
/api/tasks/{id}
```

Request

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "priority": "LOW",
  "status": "DONE"
}
```

Response

```json
{
  "success": true,
  "data": {
    "id": 20
  },
  "error": null
}
```

Errors

```
404

422
```

---

# Delete Task

### DELETE

```
/api/tasks/{id}
```

Response

```
204 No Content
```

Errors

```
404
```

---

# Complete Task

### PATCH

```
/api/tasks/{id}/complete
```

Purpose

Marks a task as completed.

Equivalent to:

```
status = DONE
```

Response

```json
{
  "success": true,
  "data": {
    "status": "DONE"
  },
  "error": null
}
```

---

# Reopen Task

### PATCH

```
/api/tasks/{id}/reopen
```

Purpose

Moves task back to TODO.

Response

```json
{
  "success": true,
  "data": {
    "status": "TODO"
  },
  "error": null
}
```

---

# Task Statistics

### GET

```
/api/statistics
```

Response

```json
{
  "success": true,
  "data": {
    "total": 12,
    "completed": 8,
    "pending": 4,
    "completionRate": 67
  },
  "error": null
}
```

---

# 11. Validation Rules

## Title

- Required
- Minimum 1 character
- Maximum 150 characters

---

## Description

- Optional
- Maximum 1000 characters

---

## Priority

Allowed values

```
LOW

MEDIUM

HIGH
```

---

## Status

Allowed values

```
TODO

IN_PROGRESS

DONE
```

---

# 12. HTTP Status Codes

Successful requests

```
200 OK

201 Created

204 No Content
```

Client errors

```
400 Bad Request

404 Not Found

409 Conflict

422 Validation Error
```

Server

```
500 Internal Server Error
```

---

# 13. Error Response

Validation Error

```json
{
  "success": false,
  "data": null,
  "error": "Title cannot be empty"
}
```

Not Found

```json
{
  "success": false,
  "data": null,
  "error": "Task not found"
}
```

Unexpected Error

```json
{
  "success": false,
  "data": null,
  "error": "Internal server error"
}
```

Sensitive implementation details should never be returned to clients.

---

# 14. Database Operations

The API owns all persistence.

UI components must never communicate directly with SQLite.

Flow

```
Browser

↓

Router

↓

Service

↓

Repository

↓

SQLite
```

---

# 15. API Documentation

FastAPI automatically generates OpenAPI documentation.

Swagger UI

```
/docs
```

ReDoc

```
/redoc
```

These endpoints should remain enabled during development.

They may be disabled in production if required.

---

# 16. Future API Extensions

The API should be designed to support future endpoints such as:

```
/api/users

/api/auth

/api/projects

/api/tags

/api/files

/api/notifications
```

Adding these endpoints should not require restructuring the existing architecture.

---

# 17. Testing Requirements

Every endpoint should be covered by automated tests.

Minimum test coverage includes:

- Health endpoint
- Create task
- Read task
- Update task
- Delete task
- Complete task
- Reopen task
- Statistics endpoint
- Validation failures
- Not found responses

Tests should be deterministic and independent.

---

# 18. API Development Rules

Every new endpoint should:

- Follow REST conventions.
- Use appropriate HTTP verbs.
- Validate all input.
- Return correct status codes.
- Return JSON only.
- Be documented with type hints and Pydantic models.
- Include automated tests.
- Keep routers thin by delegating business logic to services.

The API should remain simple, predictable, and maintainable while providing a solid foundation for future enhancements.
