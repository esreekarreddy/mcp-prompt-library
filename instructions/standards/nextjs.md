# Next.js Coding Standards

> Conventions for Next.js 15+ with App Router (January 2026)

## File Structure (Next.js 15)

```
app/
├── (auth)/                  # Route groups (no URL impact)
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx          # Auth-specific layout
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── loading.tsx     # Streaming loading UI
│   │   └── error.tsx       # Error boundary
│   └── layout.tsx
├── api/
│   └── users/
│       └── route.ts        # API route
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── not-found.tsx           # 404 page
└── globals.css
```

## Server vs Client Components (Default: Server)

### Server Components (No directive needed)
```tsx
// This is a Server Component by default
export default async function UsersPage() {
  const users = await db.users.findMany();
  return <UserList users={users} />;
}
```

### Client Components (Only when required)
```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### When to Use 'use client'
- `useState`, `useEffect`, `useRef`, etc.
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `document`)
- Third-party client libraries (charts, maps)

## Data Fetching (Next.js 15)

### In Server Components (Direct async/await)
```tsx
export default async function Page() {
  // Default: cached indefinitely
  const data = await fetch('https://api.example.com/data');
  
  // Revalidate every 60 seconds
  const freshData = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  });
  
  // Never cache (dynamic data)
  const dynamicData = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
  
  return <Display data={data} />;
}
```

### Database Queries (Direct in Server Components)
```tsx
import { db } from '@/lib/db';

export default async function UsersPage() {
  // Direct database access - no API layer needed
  const users = await db.users.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  return <UserList users={users} />;
}
```

### Parallel Data Fetching
```tsx
export default async function Dashboard() {
  // Parallel fetching - much faster
  const [user, posts, analytics] = await Promise.all([
    getUser(),
    getPosts(),
    getAnalytics()
  ]);
  
  return (
    <>
      <UserCard user={user} />
      <PostList posts={posts} />
      <AnalyticsChart data={analytics} />
    </>
  );
}
```

## Server Actions (Next.js 15)

### Defining Server Actions
```tsx
// lib/actions/users.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  // Validate with Zod
  const result = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }
  
  // Create user
  await db.users.create({ data: result.data });
  
  // Revalidate and redirect
  revalidatePath('/users');
  redirect('/users');
}
```

### Using Server Actions with Forms
```tsx
// Simple form
<form action={createUser}>
  <input name="name" required />
  <input name="email" type="email" required />
  <button type="submit">Create</button>
</form>
```

### With useActionState (React 19)
```tsx
'use client';
import { useActionState } from 'react';
import { createUser } from '@/lib/actions/users';

export function CreateUserForm() {
  const [state, action, isPending] = useActionState(createUser, null);
  
  return (
    <form action={action}>
      {state?.error && <p className="text-red-500">{state.error}</p>}
      <input name="name" disabled={isPending} />
      <input name="email" type="email" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Optimistic Updates (React 19)
```tsx
'use client';
import { useOptimistic } from 'react';

export function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );
  
  async function handleSubmit(formData: FormData) {
    const newTodo = { title: formData.get('title') as string };
    addOptimisticTodo(newTodo);
    await addTodo(newTodo);
  }
  
  return (
    <>
      <form action={handleSubmit}>
        <input name="title" />
        <button>Add</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </>
  );
}
```

## Route Handlers (API Routes)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const users = await db.users.findMany({ take: limit });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validate
  const result = UserSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const user = await db.users.create({ data: result.data });
  return NextResponse.json(user, { status: 201 });
}
```

## Streaming & Suspense

### Loading UI (Automatic Suspense)
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

### Manual Suspense Boundaries
```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </>
  );
}
```

## Error Handling

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 rounded">
      <h2 className="text-red-800 font-bold">Something went wrong!</h2>
      <p className="text-red-600">{error.message}</p>
      <button 
        onClick={reset}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

## Metadata (SEO)

```tsx
// Static metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/og-image.png'],
  },
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return {
    title: product.name,
    description: product.description,
  };
}
```

## Patterns to Avoid (Anti-patterns)

| ❌ Avoid | ✅ Instead |
|----------|-----------|
| `useEffect` for data fetching | Fetch in Server Components |
| `'use client'` by default | Server Components by default |
| Deep prop drilling | Server Components with direct data |
| `getServerSideProps` | Server Components or Route Handlers |
| API routes for internal data | Server Actions or direct DB access |
| `useState` for server data | Server Components + Suspense |
| Manual loading states | `loading.tsx` + Suspense |

## Performance Checklist

- [ ] Use Server Components by default
- [ ] Parallel data fetching with `Promise.all`
- [ ] Streaming with Suspense for slow data
- [ ] Image optimization with `next/image`
- [ ] Font optimization with `next/font`
- [ ] Route prefetching enabled (default)
- [ ] Static generation where possible
