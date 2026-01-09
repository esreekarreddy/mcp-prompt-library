# CLAUDE.md - Node.js Service Template

> Project context for Node.js/Express backend services

Copy this file to your project root as `CLAUDE.md`.

---

# Project: [Project Name]

A Node.js backend service.

## Quick Start

```bash
npm install
npm run dev        # Development with hot reload
npm run build      # Compile TypeScript
npm start          # Run production build
npm test           # Run tests
```

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma
- **Testing**: Jest
- **Validation**: Zod

## Project Structure

```
.
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app setup
│   ├── config/
│   │   ├── env.ts            # Environment config
│   │   └── database.ts       # DB config
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── users.ts
│   │   └── items.ts
│   ├── controllers/
│   │   ├── users.controller.ts
│   │   └── items.controller.ts
│   ├── services/
│   │   ├── users.service.ts
│   │   └── items.service.ts
│   ├── repositories/
│   │   ├── users.repository.ts
│   │   └── items.repository.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── error-handler.ts
│   │   └── validate.ts
│   ├── schemas/              # Zod validation schemas
│   │   └── user.schema.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── logger.ts
│       └── errors.ts
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── setup.ts
│   └── users.test.ts
├── package.json
└── tsconfig.json
```

## Architecture

```
Request → Route → Controller → Service → Repository → Database
                     ↓
Response ← Controller ← Service ← Repository ←───────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| Routes | HTTP routing, middleware chain |
| Controllers | Request/response handling, validation |
| Services | Business logic |
| Repositories | Database access |

## Coding Standards

### Route Definition
```typescript
// src/routes/users.ts
import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { validate } from '../middleware/validate';
import { createUserSchema } from '../schemas/user.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, usersController.list);
router.get('/:id', authenticate, usersController.get);
router.post('/', validate(createUserSchema), usersController.create);

export default router;
```

### Controller Pattern
```typescript
// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
};
```

### Service Layer
```typescript
// src/services/users.service.ts
import { usersRepository } from '../repositories/users.repository';
import { CreateUserInput } from '../schemas/user.schema';
import { AppError } from '../utils/errors';

export const usersService = {
  async findAll() {
    return usersRepository.findMany();
  },

  async create(data: CreateUserInput) {
    const existing = await usersRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Email already exists', 409);
    }
    return usersRepository.create(data);
  },
};
```

### Validation with Zod
```typescript
// src/schemas/user.schema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    password: z.string().min(8),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
```

### Error Handling
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

// src/middleware/error-handler.ts
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { message: err.message, code: err.code }
    });
  }
  
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
```

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## Testing

```typescript
// tests/users.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('Users API', () => {
  it('should create a user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@example.com');
  });
});
```

## Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost/dbname
JWT_SECRET=your-jwt-secret
```
