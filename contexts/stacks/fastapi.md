# FastAPI Context

> Reference for FastAPI Python web framework

## Key Features

- Fast (async support, Starlette + Pydantic)
- Automatic OpenAPI/Swagger docs
- Type hints for validation
- Dependency injection system

## Basic Structure

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id}

@app.post("/items/")
async def create_item(item: Item):
    return item
```

## Request Handling

### Path Parameters
```python
@app.get("/users/{user_id}")
async def get_user(user_id: int):  # Validated as int
    return {"user_id": user_id}
```

### Query Parameters
```python
@app.get("/items/")
async def list_items(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None
):
    return {"skip": skip, "limit": limit, "search": search}
```

### Request Body
```python
class CreateUser(BaseModel):
    email: str
    name: str
    password: str

@app.post("/users/")
async def create_user(user: CreateUser):
    return {"email": user.email}
```

## Pydantic Models

```python
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}
```

## Dependencies

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db():
    async with async_session() as session:
        yield session

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    user = await verify_token(db, token)
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user
```

## Error Handling

```python
from fastapi import HTTPException, status

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    item = await get_item_by_id(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item
```

## Background Tasks

```python
from fastapi import BackgroundTasks

async def send_email(email: str, message: str):
    # Send email
    pass

@app.post("/notify/")
async def notify(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, "Hello")
    return {"message": "Notification scheduled"}
```

## Middleware

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"{request.method} {request.url}")
    response = await call_next(request)
    return response
```

## Routers

```python
# routers/users.py
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def list_users():
    return []

# main.py
from routers import users
app.include_router(users.router)
```

## OpenAPI Docs

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`
