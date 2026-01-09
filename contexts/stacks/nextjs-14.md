# Next.js 14 Context

> Reference for Next.js 14 with App Router

## Key Concepts

### App Router vs Pages Router
Next.js 14 uses the **App Router** by default:
- Files in `app/` directory
- React Server Components by default
- New data fetching patterns
- Layouts and loading states built-in

### Server Components (Default)
```tsx
// This is a Server Component (no directive needed)
async function Page() {
  const data = await db.query(...);  // Direct database access
  return <Component data={data} />;
}
```

### Client Components (Opt-in)
```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading UI |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |
| `route.ts` | API route |

## Data Fetching

### In Server Components
```tsx
// Fetch directly - no useEffect needed
async function Page() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache',  // Default: cache
    // cache: 'no-store',  // No cache
    // next: { revalidate: 60 }  // Revalidate every 60s
  });
  const data = await res.json();
  return <Display data={data} />;
}
```

### Server Actions
```tsx
// app/actions.ts
'use server';

export async function createItem(formData: FormData) {
  const name = formData.get('name');
  await db.items.create({ data: { name } });
  revalidatePath('/items');
}

// In component
<form action={createItem}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

## Route Handlers (API)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Common Patterns

### Dynamic Routes
```
app/
├── users/
│   └── [id]/
│       └── page.tsx     → /users/123
├── blog/
│   └── [...slug]/
│       └── page.tsx     → /blog/a/b/c
```

### Route Groups
```
app/
├── (marketing)/
│   ├── about/page.tsx   → /about
│   └── layout.tsx       → Marketing layout
├── (dashboard)/
│   ├── dashboard/page.tsx → /dashboard
│   └── layout.tsx       → Dashboard layout
```

### Parallel Routes
```
app/
├── @modal/
│   └── login/page.tsx
├── @sidebar/
│   └── default.tsx
└── layout.tsx           → Renders both in parallel
```

## Caching

| Type | Default | Control |
|------|---------|---------|
| fetch() | Cached | `cache: 'no-store'` |
| Route Handlers | Not cached | `export const dynamic = 'force-static'` |
| Server Actions | Not cached | Use `revalidatePath()` |

## When to Use What

| Need | Use |
|------|-----|
| Database queries | Server Component |
| User interaction | Client Component |
| Form submission | Server Action |
| External API (frontend) | Client + SWR/React Query |
| External API (backend) | Route Handler |
| Mutations | Server Action |
