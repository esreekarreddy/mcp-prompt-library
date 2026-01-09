# Node.js Coding Standards

> Conventions for Node.js/Express backend services

## Project Structure

```
src/
├── index.ts              # Entry point
├── app.ts                # Express app setup
├── config/
│   ├── env.ts           # Environment variables
│   └── database.ts      # DB configuration
├── routes/
│   ├── index.ts         # Route aggregator
│   └── users.ts         # User routes
├── controllers/
│   └── users.controller.ts
├── services/
│   └── users.service.ts
├── repositories/
│   └── users.repository.ts
├── middleware/
│   ├── auth.ts
│   ├── error-handler.ts
│   └── validate.ts
├── schemas/              # Zod schemas
│   └── user.schema.ts
├── types/
│   └── index.ts
└── utils/
    ├── logger.ts
    └── errors.ts
```

## Express App Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

## Routes

```typescript
// src/routes/users.ts
import { Router } from 'express';
import * as controller from '../controllers/users.controller';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.get);
router.post('/', validate(createUserSchema), controller.create);
router.patch('/:id', authenticate, validate(updateUserSchema), controller.update);
router.delete('/:id', authenticate, controller.remove);

export default router;
```

## Controllers

```typescript
// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/users.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
```

## Services

```typescript
// src/services/users.service.ts
import * as userRepo from '../repositories/users.repository';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';
import { AppError } from '../utils/errors';
import { hashPassword } from '../utils/auth';

export async function findAll() {
  return userRepo.findMany();
}

export async function findById(id: string) {
  return userRepo.findById(id);
}

export async function create(data: CreateUserInput) {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    throw new AppError('Email already exists', 409);
  }
  
  const hashedPassword = await hashPassword(data.password);
  return userRepo.create({
    ...data,
    password: hashedPassword
  });
}
```

## Validation with Zod

```typescript
// src/schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(2, 'Name too short').max(100),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional()
  }),
  params: z.object({
    id: z.string()
  })
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
```

## Validation Middleware

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues
      });
    }
    
    next();
  };
}
```

## Error Handling

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code }
    });
  }
  
  logger.error('Unhandled error', { error: err, path: req.path });
  res.status(500).json({ error: { message: 'Internal server error' } });
}
```

## Configuration

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string()
});

export const env = envSchema.parse(process.env);
```

## Async Handler Wrapper

```typescript
// Avoid try/catch in every controller
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
router.get('/', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
}));
```
