# TypeScript Coding Standards

> Conventions for TypeScript 5.7+ projects (January 2026)

## Strict Mode (Non-negotiable)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "verbatimModuleSyntax": true
  }
}
```

## Types

### Prefer Interfaces for Objects
```typescript
// Good - interfaces for object shapes
interface User {
  id: string;
  email: string;
  name: string;
}

// Use types for unions/intersections/utilities
type Result<T> = Success<T> | Failure;
type UserWithPosts = User & { posts: Post[] };
```

### No `any` (Ever)
```typescript
// ❌ Bad
function process(data: any) { ... }

// ✅ Good - use unknown and narrow
function process(data: unknown) {
  if (isValidData(data)) {
    // data is now typed
  }
}

// ✅ Good - use generics
function process<T extends Record<string, unknown>>(data: T) { ... }
```

### Const Assertions & Satisfies (TS 5.0+)
```typescript
// Const assertions for literal types
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'

// Satisfies for type-safe object literals (preserves literal types)
const config = {
  maxRetries: 3,
  timeout: 5000,
  env: 'production',
} satisfies Config;

// config.env is 'production', not string
```

### Utility Types
```typescript
// Built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;
type NameOnly = Pick<User, 'name'>;
type WithoutEmail = Omit<User, 'email'>;

// NoInfer (TS 5.4+) - prevent inference
function createState<T>(initial: NoInfer<T>): State<T>;
```

### Template Literal Types
```typescript
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${string}`;
type Route = `${HTTPMethod} ${Endpoint}`;

const route: Route = 'GET /api/users'; // ✅
const bad: Route = 'PATCH /api/users'; // ❌ Error
```

## Functions

### Explicit Return Types (Public APIs)
```typescript
// ✅ Good - exported functions have explicit return types
export function getUser(id: string): Promise<User | null> {
  return db.users.findUnique({ where: { id } });
}

// Internal functions can rely on inference
const formatName = (first: string, last: string) => `${first} ${last}`;
```

### Parameter Objects for 3+ Params
```typescript
// ❌ Bad
function createUser(name: string, email: string, role: string, active: boolean) {}

// ✅ Good
interface CreateUserParams {
  name: string;
  email: string;
  role: Role;
  active?: boolean;
}
function createUser(params: CreateUserParams) {}
```

### Function Overloads (When Needed)
```typescript
function parse(input: string): ParsedString;
function parse(input: Buffer): ParsedBuffer;
function parse(input: string | Buffer): ParsedString | ParsedBuffer {
  // Implementation
}
```

## Error Handling

### Result Types (Prefer over Exceptions)
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function parseConfig(raw: string): Result<Config, ParseError> {
  try {
    const parsed = JSON.parse(raw);
    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, error: new ParseError(e.message) };
  }
}

// Usage
const result = parseConfig(rawConfig);
if (result.success) {
  console.log(result.data); // Config
} else {
  console.error(result.error); // ParseError
}
```

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
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
  }
}
```

## Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  metadata: z.record(z.unknown()).optional(),
});

// Infer type from schema
type User = z.infer<typeof UserSchema>;

// Validate
function createUser(input: unknown): User {
  return UserSchema.parse(input); // Throws on invalid
}

// Safe validate
function safeCreateUser(input: unknown): Result<User, z.ZodError> {
  const result = UserSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
```

## Async/Await

```typescript
// Always handle errors
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

// Parallel operations
const [user, posts] = await Promise.all([
  getUser(id),
  getUserPosts(id),
]);

// With error handling per promise
const results = await Promise.allSettled([
  riskyOperation1(),
  riskyOperation2(),
]);
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | camelCase | `getUserById` |
| Classes/Interfaces | PascalCase | `UserService` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Type Parameters | Single uppercase or descriptive | `T`, `TUser` |
| Files | kebab-case | `user-service.ts` |
| Enums | PascalCase | `UserRole.Admin` |

## Imports

```typescript
// Order: external → internal → relative → types
import { z } from 'zod';
import { Request, Response } from 'express';

import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

import { validateUser } from './validation';
import type { User, CreateUserParams } from './types';
```

## Modern Patterns

### Using `using` (TS 5.2+ Explicit Resource Management)
```typescript
class DatabaseConnection implements Disposable {
  [Symbol.dispose]() {
    this.close();
  }
}

async function query() {
  using connection = new DatabaseConnection();
  // Connection automatically closed when scope exits
  return connection.query('SELECT * FROM users');
}
```

### Decorators (TS 5.0+ Stage 3)
```typescript
function log(target: any, context: ClassMethodDecoratorContext) {
  return function (...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.apply(this, args);
  };
}

class UserService {
  @log
  getUser(id: string) {
    return db.users.find(id);
  }
}
```
