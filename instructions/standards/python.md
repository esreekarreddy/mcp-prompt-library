# Python Coding Standards

> Conventions for Python projects

## Python Version

- Target Python 3.11+
- Use modern features and syntax

## Type Hints

### Always Use Type Hints
```python
def get_user(user_id: int) -> User | None:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id).first()

async def create_user(data: UserCreate) -> User:
    """Create a new user."""
    user = User(**data.model_dump())
    db.add(user)
    await db.commit()
    return user
```

### Common Types
```python
from typing import Any
from collections.abc import Sequence, Mapping

# Use | for unions (Python 3.10+)
def process(value: str | int | None) -> str:
    ...

# Generic containers
def get_items(ids: list[int]) -> list[Item]:
    ...

def get_config() -> dict[str, Any]:
    ...

# Callable
from collections.abc import Callable
def apply(func: Callable[[int], int], value: int) -> int:
    return func(value)
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables | snake_case | `user_count` |
| Functions | snake_case | `get_user_by_id` |
| Classes | PascalCase | `UserService` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Private | _leading_underscore | `_internal_helper` |
| Modules | snake_case | `user_service.py` |

## Imports

```python
# Standard library
import os
from pathlib import Path
from typing import Any

# Third-party
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import httpx

# Local
from app.models import User
from app.services import user_service
from app.config import settings
```

Order: standard library → third-party → local (separated by blank lines)

## Functions

### Docstrings
```python
def create_user(
    email: str,
    name: str,
    *,
    role: str = "user"
) -> User:
    """Create a new user in the database.
    
    Args:
        email: The user's email address.
        name: The user's display name.
        role: The user's role. Defaults to "user".
    
    Returns:
        The created User object.
    
    Raises:
        ValueError: If email is invalid.
        DuplicateError: If email already exists.
    """
    ...
```

### Keyword-Only Arguments
```python
# Use * to require keyword arguments
def send_email(
    to: str,
    subject: str,
    *,  # Everything after is keyword-only
    html: bool = False,
    priority: str = "normal"
) -> None:
    ...

# Call with keywords
send_email("user@example.com", "Hello", html=True)
```

## Error Handling

### Custom Exceptions
```python
class AppError(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, code: str = "UNKNOWN"):
        self.message = message
        self.code = code
        super().__init__(message)

class NotFoundError(AppError):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, id: Any):
        super().__init__(f"{resource} with id {id} not found", "NOT_FOUND")
```

### Try/Except
```python
# Be specific about exceptions
try:
    result = risky_operation()
except ValueError as e:
    logger.warning(f"Invalid value: {e}")
    raise
except ConnectionError as e:
    logger.error(f"Connection failed: {e}")
    return None
```

## Classes

### Dataclasses
```python
from dataclasses import dataclass, field

@dataclass
class User:
    id: int
    email: str
    name: str
    roles: list[str] = field(default_factory=list)
    
    @property
    def display_name(self) -> str:
        return self.name or self.email
```

### Pydantic Models
```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    
    model_config = {"from_attributes": True}
```

## Best Practices

### Use pathlib
```python
from pathlib import Path

# Good
config_path = Path(__file__).parent / "config.json"
if config_path.exists():
    content = config_path.read_text()

# Avoid
import os
config_path = os.path.join(os.path.dirname(__file__), "config.json")
```

### Context Managers
```python
# Good
async with httpx.AsyncClient() as client:
    response = await client.get(url)

# For custom resources
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_connection():
    conn = await create_connection()
    try:
        yield conn
    finally:
        await conn.close()
```

### Comprehensions
```python
# List comprehension
squares = [x ** 2 for x in range(10)]

# With condition
evens = [x for x in range(10) if x % 2 == 0]

# Dict comprehension
user_map = {user.id: user for user in users}

# Generator for large data
large_sum = sum(x ** 2 for x in range(1000000))
```

## Anti-Patterns

| Avoid | Instead |
|-------|---------|
| Mutable default args | `= None` then `or []` |
| Bare `except:` | Specific exceptions |
| `type()` for type check | `isinstance()` |
| String concatenation in loops | `"".join()` |
| `== None` | `is None` |
