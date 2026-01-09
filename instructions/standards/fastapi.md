# FastAPI Coding Standards

> Conventions for FastAPI applications

## Project Structure

```
app/
├── __init__.py
├── main.py                 # FastAPI app, startup
├── config.py               # Settings
├── dependencies.py         # Shared dependencies
├── api/
│   ├── __init__.py
│   ├── deps.py            # API dependencies
│   └── routes/
│       ├── __init__.py
│       ├── users.py
│       └── items.py
├── models/                 # SQLAlchemy models
│   ├── __init__.py
│   └── user.py
├── schemas/                # Pydantic schemas
│   ├── __init__.py
│   └── user.py
├── services/               # Business logic
│   ├── __init__.py
│   └── user_service.py
└── db/
    ├── __init__.py
    ├── session.py
    └── base.py
```

## Application Setup

```python
# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.api.routes import users, items
from app.db.session import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await engine.connect()
    yield
    # Shutdown
    await engine.disconnect()

app = FastAPI(
    title="My API",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(items.router, prefix="/api/items", tags=["items"])
```

## Routes

### Router Setup
```python
# app/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all users with pagination."""
    return await user_service.get_all(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user by ID."""
    user = await user_service.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user."""
    return await user_service.create(db, user_in)
```

## Schemas (Pydantic)

```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    email: EmailStr | None = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}
```

## Dependencies

```python
# app/api/deps.py
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session
from app.services import auth_service

security = HTTPBearer()

async def get_db():
    async with async_session() as session:
        yield session

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    token = credentials.credentials
    user = await auth_service.verify_token(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication"
        )
    return user

# Type alias for cleaner signatures
CurrentUser = Annotated[User, Depends(get_current_user)]
DB = Annotated[AsyncSession, Depends(get_db)]
```

## Services

```python
# app/services/user_service.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password

async def get(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def create(db: AsyncSession, user_in: UserCreate) -> User:
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hash_password(user_in.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
```

## Error Handling

```python
# app/core/exceptions.py
from fastapi import HTTPException, status

class NotFoundError(HTTPException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class BadRequestError(HTTPException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

# Custom exception handler
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )
```

## Configuration

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    
    model_config = {"env_file": ".env"}

settings = Settings()
```
