# CLAUDE.md - Next.js App Template

> Project context for Next.js 14+ applications with App Router

Copy this file to your project root as `CLAUDE.md`.

---

# Project: [Project Name]

A Next.js application using the App Router.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm test          # Run tests
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: [Prisma/Drizzle with PostgreSQL]
- **Auth**: [NextAuth.js / Clerk / Custom]
- **Testing**: Vitest + Testing Library

## Project Structure

```
.
├── app/
│   ├── (auth)/           # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Protected route group
│   │   └── dashboard/
│   ├── api/              # API routes
│   │   └── [resource]/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css
├── components/
│   ├── ui/               # Reusable UI (buttons, inputs)
│   └── [feature]/        # Feature components
├── lib/
│   ├── actions/          # Server actions
│   ├── db/               # Database client & queries
│   ├── auth/             # Auth utilities
│   └── utils.ts          # Helpers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

## Next.js Conventions

### Server vs Client Components
```tsx
// Default: Server Component (no directive needed)
export default function ServerComponent() { ... }

// Client Component (when needed)
'use client';
export default function ClientComponent() { ... }
```

**Use Client Components when:**
- Using hooks (useState, useEffect, etc.)
- Browser APIs (window, document)
- Event handlers (onClick, onChange)
- Client-side libraries

### Server Actions
```tsx
// lib/actions/user.ts
'use server';

export async function createUser(formData: FormData) {
  // Validate input
  // Database operation
  // Return result or revalidate
  revalidatePath('/users');
}
```

### Data Fetching
```tsx
// In Server Components - fetch directly
async function Page() {
  const data = await db.query.users.findMany();
  return <UserList users={data} />;
}

// For mutations - use Server Actions
<form action={createUser}>
  ...
</form>
```

### Route Handlers (API Routes)
```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.query.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Validate and create
  return NextResponse.json(user, { status: 201 });
}
```

## Coding Standards

### Component Pattern
```tsx
// components/feature/user-card.tsx
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
  return (
    <div className={cn('rounded-lg p-4', className)}>
      {user.name}
    </div>
  );
}
```

### File Naming
- Components: `kebab-case.tsx` → `user-card.tsx`
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- API: `route.ts`

### Imports
```tsx
// Use path aliases
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
```

## Important Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, providers |
| `lib/db/index.ts` | Database client |
| `lib/auth/index.ts` | Auth utilities |
| `middleware.ts` | Route protection |
| `tailwind.config.ts` | Tailwind config |

## Common Patterns

### Protected Routes
```tsx
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession();
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

### Loading States
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

### Error Handling
```tsx
// app/dashboard/error.tsx
'use client';
export default function Error({ error, reset }) {
  return <ErrorBoundary error={error} onReset={reset} />;
}
```

## Environment Variables

```bash
# .env.local (never commit)
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

Required in `.env.example`:
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_SECRET` - Auth secret (generate with `openssl rand -base64 32`)
