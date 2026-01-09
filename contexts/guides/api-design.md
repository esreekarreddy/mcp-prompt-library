# API Design Guide

> Best practices for designing REST APIs

## URL Structure

### Resource-Based URLs
```
GET    /users              # List users
GET    /users/123          # Get user 123
POST   /users              # Create user
PUT    /users/123          # Replace user 123
PATCH  /users/123          # Update user 123
DELETE /users/123          # Delete user 123

# Nested resources
GET    /users/123/posts    # Posts by user 123
POST   /users/123/posts    # Create post for user 123
```

### URL Guidelines

| Do | Don't |
|----|-------|
| `/users` | `/getUsers` |
| `/users/123` | `/user?id=123` |
| `/orders/456/items` | `/getOrderItems?orderId=456` |
| Use plural nouns | Use verbs in URLs |
| Use kebab-case | Use camelCase in URLs |

## HTTP Methods

| Method | Use | Idempotent | Body |
|--------|-----|------------|------|
| GET | Read | Yes | No |
| POST | Create | No | Yes |
| PUT | Replace | Yes | Yes |
| PATCH | Update | Yes | Yes |
| DELETE | Delete | Yes | No |

## Status Codes

### Success
- `200 OK` - General success
- `201 Created` - Resource created
- `204 No Content` - Success, no body (DELETE)

### Client Errors
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate, state conflict
- `422 Unprocessable Entity` - Validation failed

### Server Errors
- `500 Internal Server Error` - Server bug
- `503 Service Unavailable` - Temporary outage

## Request/Response Format

### Request Body
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Success Response
```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid format" }
    ]
  }
}
```

### Collection Response
```json
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## Pagination

### Query Parameters
```
GET /users?page=2&per_page=20
GET /users?offset=20&limit=20
GET /users?cursor=abc123
```

### Response Headers
```
Link: <https://api.example.com/users?page=3>; rel="next",
      <https://api.example.com/users?page=1>; rel="prev"
X-Total-Count: 100
```

## Filtering & Sorting

```
# Filtering
GET /products?category=electronics&min_price=100

# Sorting
GET /products?sort=price
GET /products?sort=-createdAt  # Descending
GET /products?sort=category,price

# Searching
GET /products?search=laptop
GET /products?q=laptop

# Field selection
GET /users?fields=id,name,email
```

## Versioning

### URL Versioning (Recommended)
```
/api/v1/users
/api/v2/users
```

### Header Versioning
```
Accept: application/vnd.api+json;version=1
```

## Authentication

### Bearer Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key
```
X-API-Key: your-api-key
```

## Rate Limiting

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Response (429 Too Many Requests)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Common Patterns

### Partial Updates (PATCH)
```json
// Only update provided fields
PATCH /users/123
{
  "name": "New Name"
}
```

### Bulk Operations
```
POST /users/bulk
{
  "operations": [
    { "action": "create", "data": {...} },
    { "action": "update", "id": "123", "data": {...} }
  ]
}
```

### Async Operations
```
POST /reports
→ 202 Accepted
{
  "id": "job-123",
  "status": "processing",
  "statusUrl": "/jobs/job-123"
}

GET /jobs/job-123
→ 200 OK
{
  "status": "completed",
  "result": {...}
}
```
