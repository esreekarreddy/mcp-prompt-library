# Error Handling Guide

> Best practices for handling errors across the stack

## Principles

1. **Fail fast**: Validate early, throw early
2. **Be specific**: Custom errors over generic ones
3. **Don't hide**: Log everything, show appropriate messages
4. **Recover gracefully**: Degrade instead of crash

## Error Types

### Operational Errors (Expected)
- Invalid user input
- Resource not found
- Permission denied
- External service failure

**Handling**: Catch, handle gracefully, inform user

### Programmer Errors (Bugs)
- Type errors
- Null pointer exceptions
- Assertion failures

**Handling**: Crash, fix the bug, deploy

## Custom Error Classes

### TypeScript

```typescript
// Base error
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific errors
class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message: string, public details?: object) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}
```

### Python

```python
class AppError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        code: str = "INTERNAL_ERROR"
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)

class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", 404, "NOT_FOUND")

class ValidationError(AppError):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, 400, "VALIDATION_ERROR")
        self.details = details
```

## Error Handling Patterns

### Express Middleware

```typescript
// Global error handler
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Operational error - send to client
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Programmer error - generic message
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
    },
  });
}
```

### Async Handler Wrapper

```typescript
function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

### FastAPI

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}}
    )
```

## Client-Facing Errors

### Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  }
}
```

### Never Expose

- Stack traces
- Database errors
- Internal paths
- Implementation details

## Logging Errors

```typescript
// Good error log
logger.error('Failed to process payment', {
  error: err.message,
  stack: err.stack,
  userId: user.id,
  orderId: order.id,
  paymentMethod: method.type,
});

// Bad - logs sensitive data
logger.error('Payment failed', { 
  cardNumber: card.number,  // Don't log!
  error: err 
});
```
