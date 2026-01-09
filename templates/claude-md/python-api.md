# CLAUDE.md - Python API Template

> Project context for Python FastAPI/Flask applications

Copy this file to your project root as `CLAUDE.md`.

---

# Project: [Project Name]

A Python API service.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run development server
uvicorn app.main:app --reload  # FastAPI
# or
flask run --debug              # Flask

# Run tests
pytest
```

## Tech Stack

- **Framework**: FastAPI / Flask
- **Language**: Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy
- **Migrations**: Alembic
- **Testing**: pytest
- **Validation**: Pydantic

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py              # Application entry
│   ├── config.py            # Configuration
│   ├── dependencies.py      # Dependency injection
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/          # API endpoints
│   │   │   ├── users.py
│   │   │   └── items.py
│   │   └── deps.py          # Route dependencies
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── user_service.py
│   └── db/
│       ├── __init__.py
│       ├── session.py       # Database session
│       └── base.py          # Base model
├── alembic/                 # Migrations
├── tests/
│   ├── conftest.py
│   ├── test_users.py
│   └── factories/
├── requirements.txt
├── requirements-dev.txt
└── .env.example
```

## Coding Standards

### Type Hints
```python
# Always use type hints
def get_user(user_id: int) -> User | None:
    ...

async def create_user(user: UserCreate) -> User:
    ...
```

### Pydantic Schemas
```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    
    class Config:
        from_attributes = True  # For ORM mode
```

### FastAPI Routes
```python
# app/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
) -> User:
    user = await user_service.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=201)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> User:
    return await user_service.create(db, user_in)
```

### Service Layer
```python
# app/services/user_service.py
from sqlalchemy.orm import Session
from app.models import User
from app.schemas import UserCreate

class UserService:
    async def get(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()
    
    async def create(self, db: Session, user_in: UserCreate) -> User:
        user = User(**user_in.model_dump())
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

user_service = UserService()
```

### SQLAlchemy Models
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

## Database Commands

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## Testing

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def db_session():
    # Set up test database
    yield session
    # Cleanup

# tests/test_users.py
def test_create_user(client):
    response = client.post("/users/", json={
        "email": "test@example.com",
        "name": "Test User",
        "password": "securepassword"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

## Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
DEBUG=true
```

## Important Files

| File | Purpose |
|------|---------|
| `app/main.py` | Application entry, middleware |
| `app/config.py` | Settings from environment |
| `app/db/session.py` | Database connection |
| `alembic.ini` | Alembic configuration |
