# Prisma Context

> Reference for Prisma ORM with TypeScript

## Key Features

- Type-safe database access
- Auto-generated client from schema
- Migrations system
- Works with PostgreSQL, MySQL, SQLite, MongoDB

## Schema Definition

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

## Client Usage

### Setup
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Or with singleton (recommended for Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### CRUD Operations

```typescript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John',
  },
});

// Read one
const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// Read many
const users = await prisma.user.findMany({
  where: { name: { contains: 'John' } },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});

// Update
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane' },
});

// Delete
await prisma.user.delete({
  where: { id: 1 },
});
```

### Relations

```typescript
// Include related data
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// Select specific fields
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    email: true,
    posts: {
      select: { title: true },
    },
  },
});

// Nested create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' },
      ],
    },
  },
});
```

### Filtering

```typescript
// Operators
await prisma.user.findMany({
  where: {
    email: { contains: '@example.com' },
    name: { startsWith: 'J' },
    createdAt: { gte: new Date('2024-01-01') },
    OR: [
      { name: 'John' },
      { name: 'Jane' },
    ],
  },
});
```

### Transactions

```typescript
// Sequential operations
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'a@b.com' } }),
  prisma.post.create({ data: { title: 'Hi', authorId: 1 } }),
]);

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'a@b.com' } });
  await tx.post.create({ data: { title: 'Hi', authorId: user.id } });
});
```

## Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Common Patterns

### Soft Delete
```prisma
model User {
  id        Int       @id
  deletedAt DateTime?
}
```

```typescript
// "Delete"
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
});

// Find active
await prisma.user.findMany({
  where: { deletedAt: null },
});
```

### Pagination
```typescript
async function paginate(page: number, perPage: number) {
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count(),
  ]);
  
  return {
    items,
    total,
    pages: Math.ceil(total / perPage),
  };
}
```
