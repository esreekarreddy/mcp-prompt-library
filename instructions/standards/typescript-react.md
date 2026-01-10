---
title: TypeScript + React Standards
description: Complete coding standards for TypeScript React/Next.js projects - with modern 2025 patterns
tags: [typescript, react, nextjs, standards, coding-style]
aliases: [ts-react, frontend-standards, nextjs-standards]
version: 2.0.0
---

# TypeScript + React Coding Standards

> Production-ready patterns used at companies like Vercel, Linear, and Stripe. These aren't theoretical best practices - they're battle-tested solutions.

## Table of Contents
1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [React Patterns](#react-patterns)
3. [Next.js 14+ Patterns](#nextjs-14-patterns)
4. [State Management](#state-management)
5. [Data Fetching](#data-fetching)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Performance](#performance)

---

## TypeScript Fundamentals

### Strict Mode Always
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Type vs Interface
```typescript
// USE TYPE for:
// - Union types
// - Mapped types
// - Computed properties
// - Most use cases

type UserStatus = 'active' | 'inactive' | 'pending';

type User = {
  id: string;
  name: string;
  status: UserStatus;
};

type UserWithPosts = User & {
  posts: Post[];
};

// USE INTERFACE for:
// - Declaration merging (extending third-party types)
// - Class implementations

interface Window {
  analytics: AnalyticsClient; // Extends global Window
}

class UserService implements IUserService {
  // ...
}
```

### Never Use `any`
```typescript
// BAD
function process(data: any) {
  return data.items.map(item => item.name);
}

// GOOD - Type the actual structure
function process(data: { items: Array<{ name: string }> }) {
  return data.items.map(item => item.name);
}

// GOOD - Use unknown with type guards
function process(data: unknown) {
  if (!isValidData(data)) {
    throw new Error('Invalid data structure');
  }
  return data.items.map(item => item.name);
}

function isValidData(data: unknown): data is { items: Array<{ name: string }> } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray(data.items)
  );
}
```

### Zod for Runtime Validation
```typescript
import { z } from 'zod';

// Define schema once, derive types
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
  metadata: z.record(z.unknown()).optional(),
});

// Derive TypeScript type from schema
type User = z.infer<typeof UserSchema>;

// Use in API routes
export async function POST(request: Request) {
  const body = await request.json();
  const result = UserSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  
  // result.data is fully typed as User
  return createUser(result.data);
}
```

### Result Pattern for Errors
```typescript
// types/result.ts
type Ok<T> = { success: true; data: T };
type Err<E> = { success: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

const Ok = <T>(data: T): Ok<T> => ({ success: true, data });
const Err = <E>(error: E): Err<E> => ({ success: false, error });

// Usage
async function getUser(id: string): Promise<Result<User, 'not_found' | 'db_error'>> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return Err('not_found');
    return Ok(user);
  } catch {
    return Err('db_error');
  }
}

// Consuming
const result = await getUser(id);
if (!result.success) {
  switch (result.error) {
    case 'not_found':
      return <NotFound />;
    case 'db_error':
      return <ErrorPage />;
  }
}
// result.data is User here
```

---

## React Patterns

### Component Structure
```typescript
// components/UserCard/UserCard.tsx

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/ui/avatar';
import type { User } from '@/types';
import styles from './UserCard.module.css';

type UserCardProps = {
  user: User;
  variant?: 'default' | 'compact';
  onSelect?: (user: User) => void;
  className?: string;
};

export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  function UserCard({ user, variant = 'default', onSelect, className }, ref) {
    const handleClick = () => {
      onSelect?.(user);
    };

    return (
      <div
        ref={ref}
        className={clsx(styles.card, styles[variant], className)}
        onClick={handleClick}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
      >
        <Avatar src={user.avatar} alt={user.name} />
        <div className={styles.info}>
          <h3 className={styles.name}>{user.name}</h3>
          {variant === 'default' && (
            <p className={styles.email}>{user.email}</p>
          )}
        </div>
      </div>
    );
  }
);
```

### Custom Hooks Pattern
```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// hooks/use-local-storage.ts
import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const newValue = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
```

### Compound Components
```typescript
// components/Tabs/Tabs.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within Tabs');
  return context;
}

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
};

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

type TabProps = {
  value: string;
  children: ReactNode;
};

Tabs.Tab = function Tab({ value, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  
  return (
    <button
      className={activeTab === value ? 'active' : ''}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ value, children }: TabProps) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;
  return <div className="panel">{children}</div>;
};

// Usage
<Tabs defaultValue="general">
  <Tabs.Tab value="general">General</Tabs.Tab>
  <Tabs.Tab value="security">Security</Tabs.Tab>
  
  <Tabs.Panel value="general">General settings...</Tabs.Panel>
  <Tabs.Panel value="security">Security settings...</Tabs.Panel>
</Tabs>
```

---

## Next.js 14+ Patterns

### Server Components (Default)
```typescript
// app/users/page.tsx
// This is a Server Component by default - no 'use client'

import { getUsers } from '@/services/users';
import { UserList } from '@/components/UserList';

export default async function UsersPage() {
  const users = await getUsers(); // Direct database access!
  
  return (
    <main>
      <h1>Users</h1>
      <UserList users={users} />
    </main>
  );
}
```

### Client Components (Interactive)
```typescript
// components/UserList.tsx
'use client';

import { useState } from 'react';
import { User } from '@/types';

type Props = {
  users: User[];
};

export function UserList({ users }: Props) {
  const [filter, setFilter] = useState('');
  
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input
        type="search"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Filter users..."
      />
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Server Actions
```typescript
// app/users/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createUser } from '@/services/users';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const result = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!result.success) {
    return { error: result.error.flatten() };
  }

  try {
    const user = await createUser(result.data);
    revalidatePath('/users');
    return { success: true, user };
  } catch (error) {
    return { error: 'Failed to create user' };
  }
}

// Usage in component
<form action={createUserAction}>
  <input name="name" required />
  <input name="email" type="email" required />
  <button type="submit">Create</button>
</form>
```

### Parallel Data Fetching
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="dashboard">
      {/* These fetch in parallel, render independently */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}

async function Stats() {
  const stats = await fetchStats(); // Runs in parallel with others
  return <StatsDisplay stats={stats} />;
}
```

---

## State Management

### React Query for Server State
```typescript
// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get<User>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<User, 'id'>) => 
      api.post<User>('/users', data),
    onSuccess: (newUser) => {
      // Update list cache
      queryClient.setQueryData<User[]>(['users'], old => 
        old ? [...old, newUser] : [newUser]
      );
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Zustand for Client State
```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIState = {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);

// Usage
function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  // ...
}
```

---

## Error Handling

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Next.js Error Pages
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

---

## Testing

### Component Testing with Vitest
```typescript
// components/Button/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing
```typescript
// hooks/__tests__/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('returns debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });
    expect(result.current).toBe('hello'); // Still old value

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('world'); // Now updated
  });
});
```

---

## Performance

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveList = memo(function ExpensiveList({ 
  items,
  onSelect 
}: {
  items: Item[];
  onSelect: (item: Item) => void;
}) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

// Usage
function Parent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items] = useState(fetchItems);

  // Memoize callback to prevent ExpensiveList re-renders
  const handleSelect = useCallback((item: Item) => {
    setSelectedId(item.id);
  }, []);

  // Memoize computed values
  const sortedItems = useMemo(
    () => items.toSorted((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return <ExpensiveList items={sortedItems} onSelect={handleSelect} />;
}
```

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const Chart = lazy(() => import('./Chart'));
const DataTable = lazy(() => import('./DataTable'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <Chart />
      </Suspense>
      
      <Suspense fallback={<TableSkeleton />}>
        <DataTable />
      </Suspense>
    </div>
  );
}
```

### Image Optimization
```typescript
import Image from 'next/image';

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL={product.blurHash}
        sizes="(max-width: 768px) 100vw, 300px"
      />
    </div>
  );
}
```

---

## Quick Reference Checklist

### Before Creating a Component
- [ ] Is there an existing component I can reuse?
- [ ] Should this be a Server or Client Component?
- [ ] What props does it need?
- [ ] Does it need error/loading states?

### Before Merging
- [ ] TypeScript strict mode passing
- [ ] All tests passing
- [ ] No console.log statements
- [ ] No `any` types
- [ ] Error handling complete
- [ ] Accessible (keyboard, screen reader)
