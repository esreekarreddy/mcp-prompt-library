# TypeScript Coding Standards

> Conventions for TypeScript projects

## Strict Mode

Always enable strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

## Types

### Prefer Interfaces for Objects
```typescript
// Good
interface User {
  id: string;
  email: string;
  name: string;
}

// Use types for unions/intersections
type Result<T> = Success<T> | Failure;
type UserWithPosts = User & { posts: Post[] };
```

### No `any`
```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: unknown) {
  if (isValidData(data)) {
    // Now data is typed
  }
}

// Or be explicit
function process<T extends Record<string, unknown>>(data: T) { ... }
```

### Const Assertions
```typescript
// Good - literal types
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'

const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
} as const;
```

### Utility Types
```typescript
// Use built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;
type NameOnly = Pick<User, 'name'>;
type WithoutEmail = Omit<User, 'email'>;
```

## Functions

### Explicit Return Types (Exports)
```typescript
// Good - exported functions have return types
export function getUser(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}

// Internal functions can rely on inference
const formatName = (first: string, last: string) => `${first} ${last}`;
```

### Parameter Objects for 3+ Params
```typescript
// Bad
function createUser(name: string, email: string, role: string, active: boolean) {}

// Good
interface CreateUserParams {
  name: string;
  email: string;
  role: Role;
  active?: boolean;
}
function createUser(params: CreateUserParams) {}
```

## Error Handling

### Custom Error Classes
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
```

### Result Types (Alternative to Exceptions)
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function parseConfig(raw: string): Result<Config, ParseError> {
  try {
    return { success: true, data: JSON.parse(raw) };
  } catch (e) {
    return { success: false, error: new ParseError(e.message) };
  }
}
```

## Async/Await

```typescript
// Always handle errors in async functions
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UserNotFoundError(id);
    }
    throw error;
  }
}

// Use Promise.all for parallel operations
const [user, posts] = await Promise.all([
  getUser(id),
  getUserPosts(id),
]);
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | camelCase | `getUserById` |
| Classes/Interfaces | PascalCase | `UserService` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Type Parameters | Single uppercase | `T`, `K`, `V` |
| Files | kebab-case | `user-service.ts` |
| Enums | PascalCase | `UserRole.Admin` |

## Imports

```typescript
// Order: external → internal → relative
import { z } from 'zod';
import { Request, Response } from 'express';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import { validateUser } from './validation';
import type { User } from './types';
```
