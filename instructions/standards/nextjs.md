# Next.js Coding Standards

> Conventions for Next.js 14+ with App Router

## File Structure

```
app/
├── (auth)/                  # Route groups (no URL impact)
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx          # Auth-specific layout
├── (dashboard)/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── loading.tsx     # Loading UI
│   │   └── error.tsx       # Error boundary
│   └── layout.tsx
├── api/
│   └── users/
│       └── route.ts        # API route
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── globals.css
```

## Server vs Client Components

### Default: Server Components
```tsx
// No directive needed - this is a Server Component
export default async function UsersPage() {
  const users = await db.users.findMany();
  return <UserList users={users} />;
}
```

### Client Components (When Needed)
```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### When to Use Client
- useState, useEffect, useRef, etc.
- Event handlers (onClick, onChange)
- Browser APIs (window, document)
- Third-party client libraries

## Data Fetching

### In Server Components
```tsx
// Direct async/await - no useEffect needed
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache',     // Default: cache forever
    // cache: 'no-store',     // Never cache
    // next: { revalidate: 60 } // Revalidate every 60s
  });
  
  return <Display data={data} />;
}
```

### Database Queries
```tsx
import { db } from '@/lib/db';

export default async function UsersPage() {
  const users = await db.users.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  return <UserList users={users} />;
}
```

## Server Actions

```tsx
// lib/actions/users.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // Validate
  if (!name || !email) {
    return { error: 'Name and email required' };
  }
  
  // Create
  await db.users.create({ data: { name, email } });
  
  // Revalidate and redirect
  revalidatePath('/users');
  redirect('/users');
}
```

### Using Server Actions
```tsx
// In a form
<form action={createUser}>
  <input name="name" />
  <input name="email" />
  <button type="submit">Create</button>
</form>

// With useFormState for feedback
'use client';
import { useFormState } from 'react-dom';

function CreateUserForm() {
  const [state, action] = useFormState(createUser, null);
  
  return (
    <form action={action}>
      {state?.error && <p className="error">{state.error}</p>}
      {/* ... */}
    </form>
  );
}
```

## Route Handlers (API Routes)

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

## Error Handling

```tsx
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

## Metadata

```tsx
// Static metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## Patterns to Avoid

| Avoid | Instead |
|-------|---------|
| `useEffect` for data fetching | Fetch in Server Components |
| Client Component by default | Server Component by default |
| Prop drilling deeply | Server Components with direct data |
| `getServerSideProps` | Server Components or Route Handlers |
| API routes for internal data | Server Actions or direct DB |
