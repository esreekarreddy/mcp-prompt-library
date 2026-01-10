---
title: Full CLAUDE.md Template
description: Production-ready CLAUDE.md that gives Claude all context needed for any codebase
tags: [template, claude-md, project-context, configuration]
aliases: [claude-md-full, project-setup, ai-context]
version: 2.0.0
---

# Full CLAUDE.md Template

> Copy this entire file to your project root as `CLAUDE.md` and fill in the sections. This gives Claude (and other AI tools) maximum context for working with your codebase.

---

```markdown
# Project: [project_name]

> [one_line_description]

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint and format |
| `npm run typecheck` | TypeScript checks |

## Architecture Overview

### Tech Stack
- **Runtime:** Node.js 20 / Bun 1.x
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Database:** PostgreSQL 15 + Prisma ORM
- **Cache:** Redis 7.x
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest + Playwright

### Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth-required routes (grouped)
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn)
│   ├── features/         # Feature-specific components
│   └── layouts/          # Layout components
├── lib/                   # Core utilities
│   ├── db/               # Database client and queries
│   ├── auth/             # Authentication utilities
│   ├── api/              # API client and helpers
│   └── utils/            # General utilities
├── services/              # Business logic layer
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── prisma/                # Database schema and migrations
└── tests/                 # Test files
    ├── unit/             # Unit tests
    ├── integration/      # Integration tests
    └── e2e/              # End-to-end tests
```

## Code Conventions

### TypeScript
- Strict mode enabled (`"strict": true`)
- No `any` types - use `unknown` with type guards
- Prefer `type` over `interface` unless extending
- Export types from the file that uses them

```typescript
// GOOD
type User = {
  id: string;
  email: string;
  createdAt: Date;
};

async function getUser(id: string): Promise<User | null> {
  // ...
}

// BAD
async function getUser(id: any): Promise<any> {
  // ...
}
```

### React Components
- Functional components only
- Props type defined inline for simple components
- Separate types file for complex components
- Use `forwardRef` when exposing DOM elements

```typescript
// Simple component
function Button({ children, onClick }: { 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return <button onClick={onClick}>{children}</button>;
}

// Complex component with separate types
// components/DataTable/types.ts
// components/DataTable/DataTable.tsx
// components/DataTable/index.ts
```

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Utilities: `kebab-case.ts`
- Types: `types.ts` (co-located) or `*.types.ts`
- Tests: `*.test.ts` or `*.spec.ts`

### Import Order
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { z } from 'zod';
import { clsx } from 'clsx';

// 3. Internal aliases (@/)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 4. Relative imports
import { UserAvatar } from './UserAvatar';
import type { UserCardProps } from './types';
```

## Error Handling

### API Routes
```typescript
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/services/users';
import { AppError, handleApiError } from '@/lib/errors';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = paramsSchema.parse(params);
    const user = await getUser(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Client-Side
```typescript
// Use React Query for data fetching
const { data, error, isLoading } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  retry: 3,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

if (error) {
  return <ErrorDisplay error={error} />;
}
```

## Database Patterns

### Prisma Queries
```typescript
// lib/db/users.ts
import { prisma } from '@/lib/db/client';
import type { User, Prisma } from '@prisma/client';

export async function getUsers(
  options: {
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const { search, page = 1, limit = 20 } = options;
  
  const where: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

### Migrations
```bash
# Create migration
npx prisma migrate dev --name add_user_profile

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Authentication

### Protected Routes
```typescript
// middleware.ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtected = req.nextUrl.pathname.startsWith('/dashboard');
  
  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Server Components
```typescript
// app/(auth)/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return <Dashboard user={session.user} />;
}
```

## Testing

### Unit Tests
```typescript
// services/__tests__/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice } from '../pricing';

describe('calculatePrice', () => {
  it('applies discount for bulk orders', () => {
    const result = calculatePrice({ quantity: 100, unitPrice: 10 });
    expect(result.discount).toBe(0.1); // 10% bulk discount
    expect(result.total).toBe(900);
  });

  it('throws for negative quantities', () => {
    expect(() => 
      calculatePrice({ quantity: -1, unitPrice: 10 })
    ).toThrow('Quantity must be positive');
  });
});
```

### E2E Tests
```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout-button"]');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4242424242424242');
  await page.click('[data-testid="place-order"]');
  
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.getByText('Order Confirmed')).toBeVisible();
});
```

## Environment Variables

### Required Variables
```bash
# .env.local (development)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Validation
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
});

export const env = envSchema.parse(process.env);
```

## Common Tasks

### Adding a New Feature
1. Create database migration if needed
2. Add types in `types/`
3. Implement service layer in `services/`
4. Create API route in `app/api/`
5. Build UI components in `components/features/`
6. Add page in `app/`
7. Write tests
8. Update this file if new patterns introduced

### Adding a New API Endpoint
```typescript
// Template: app/api/[resource]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const schema = z.object({
  // Define your schema
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    
    // Your logic here
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

## AI Instructions

When working with this codebase:

1. **Follow existing patterns** - Look at similar code before creating new patterns
2. **Type everything** - No `any`, use proper TypeScript types
3. **Error handling** - Every API route needs try/catch, every async operation needs error handling
4. **Security first** - Validate all inputs, check auth on protected routes
5. **Test critical paths** - Business logic and API endpoints need tests
6. **Performance awareness** - Use React Query caching, avoid N+1 queries

### Don't
- Add `@ts-ignore` or `any` types
- Skip error handling "for now"
- Create god components (>300 lines)
- Put business logic in React components
- Commit secrets or environment variables

### Do
- Ask clarifying questions before big changes
- Run tests before considering work complete
- Explain trade-offs when making architectural decisions
- Update this file when adding new patterns
```

---

## Customization Notes

### For Smaller Projects
Remove sections you don't need:
- Database patterns if no database
- Auth section if using simple auth
- E2E tests if only unit testing

### For Larger Projects
Add sections for:
- Microservices communication
- Feature flags
- A/B testing
- Analytics tracking
- Internationalization

### For Different Tech Stacks
Replace sections with your stack:
- Flask/FastAPI instead of Next.js
- MySQL/MongoDB instead of PostgreSQL
- Pytest instead of Vitest
