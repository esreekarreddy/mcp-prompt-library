# API Specification Template

> API Documentation for [API Name]

**Version**: 1.0.0  
**Base URL**: `https://api.example.com/v1`  
**Last Updated**: [Date]

---

## Overview

[Brief description of what this API does and who it's for]

## Authentication

All requests require authentication via Bearer token.

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/v1/endpoint
```

### Getting a Token

```bash
POST /auth/token
Content-Type: application/json

{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret"
}
```

---

## Common Response Formats

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## Rate Limiting

| Tier | Limit |
|------|-------|
| Free | 100 requests/minute |
| Pro | 1000 requests/minute |

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Endpoints

### Users

#### List Users

```
GET /users
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| per_page | integer | No | Items per page (default: 20, max: 100) |
| search | string | No | Search by name or email |

**Response:**
```json
{
  "data": [
    {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

---

#### Get User

```
GET /users/{id}
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User ID |

**Response:**
```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-16T14:30:00Z"
  }
}
```

---

#### Create User

```
POST /users
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| email | Required, valid email, unique |
| name | Required, 2-100 characters |
| password | Required, min 8 characters |

**Response:** `201 Created`
```json
{
  "data": {
    "id": "usr_456",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-17T09:00:00Z"
  }
}
```

---

#### Update User

```
PATCH /users/{id}
```

**Request Body:** (all fields optional)
```json
{
  "name": "Jane Doe"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "Jane Doe",
    "updated_at": "2024-01-17T10:00:00Z"
  }
}
```

---

#### Delete User

```
DELETE /users/{id}
```

**Response:** `204 No Content`

---

## Webhooks

### Event Types

| Event | Description |
|-------|-------------|
| `user.created` | New user registered |
| `user.updated` | User profile updated |
| `user.deleted` | User deleted |

### Webhook Payload

```json
{
  "id": "evt_789",
  "type": "user.created",
  "created_at": "2024-01-17T09:00:00Z",
  "data": {
    "id": "usr_456",
    "email": "user@example.com"
  }
}
```

### Verifying Webhooks

Webhooks include a signature header `X-Webhook-Signature`:
```
X-Webhook-Signature: sha256=abc123...
```

Verify by computing HMAC-SHA256 of the payload with your webhook secret.

---

## SDKs

- [JavaScript SDK](https://github.com/YOUR_ORG/YOUR_PROJECT-js) <!-- Update with actual SDK URL -->
- [Python SDK](https://github.com/YOUR_ORG/YOUR_PROJECT-python) <!-- Update with actual SDK URL -->
- [Go SDK](https://github.com/YOUR_ORG/YOUR_PROJECT-go) <!-- Update with actual SDK URL -->

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-01 | Initial release |
