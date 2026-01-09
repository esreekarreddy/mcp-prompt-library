# React Coding Standards

> Conventions for React components and hooks

## Component Structure

```tsx
// 1. Imports
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

// 2. Types
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
  className?: string;
}

// 3. Component
export function UserCard({ user, onSelect, className }: UserCardProps) {
  // 3a. Hooks (always at top)
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 3b. Derived state
  const displayName = `${user.firstName} ${user.lastName}`;
  
  // 3c. Callbacks
  const handleClick = useCallback(() => {
    onSelect?.(user);
  }, [user, onSelect]);
  
  // 3d. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // 3e. Early returns
  if (!user) return null;
  
  // 3f. Render
  return (
    <div className={cn('p-4 rounded-lg', className)}>
      <h3>{displayName}</h3>
      <Button onClick={handleClick}>Select</Button>
    </div>
  );
}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard` |
| Hooks | camelCase with 'use' | `useUserData` |
| Event handlers | handle* | `handleClick` |
| Boolean props | is*, has*, should* | `isLoading` |
| Files | kebab-case | `user-card.tsx` |

## Props

### Interface Over Type
```tsx
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
}

// Extend HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
}
```

### Default Props
```tsx
interface Props {
  size?: 'sm' | 'md' | 'lg';
}

function Component({ size = 'md' }: Props) {
  // ...
}
```

### Children
```tsx
// Explicit children type
interface Props {
  children: React.ReactNode;
}

// Or for specific children
interface Props {
  children: React.ReactElement<ChildProps>;
}
```

## Hooks

### Custom Hook Pattern
```tsx
// hooks/use-user.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchUser() {
      try {
        const data = await api.getUser(userId);
        if (!cancelled) setUser(data);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    
    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  return { user, isLoading, error };
}
```

### Hook Rules
- Only call at top level (not in conditions/loops)
- Only call in React functions
- Prefix custom hooks with 'use'
- Return consistent shape

## State Management

### Local State
```tsx
// Simple state
const [count, setCount] = useState(0);

// Object state (prefer separate states)
const [form, setForm] = useState({ name: '', email: '' });
const updateField = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
```

### Derived State (Don't Store)
```tsx
// Bad - storing derived state
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

// Good - compute during render
const [items, setItems] = useState([]);
const total = items.reduce((sum, i) => sum + i.price, 0);
```

## Performance

### Memoization (When Needed)
```tsx
// Memoize expensive calculations
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Memoize callbacks passed to children
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components (rare)
const MemoizedChild = memo(Child);
```

### When NOT to Memoize
- Simple calculations
- Primitive values
- Callbacks not passed to children
- Components that always re-render anyway

## Common Patterns

### Conditional Rendering
```tsx
// Ternary for simple cases
{isLoading ? <Spinner /> : <Content />}

// && for presence check (careful with 0)
{items.length > 0 && <List items={items} />}

// Early return for complex conditions
if (isLoading) return <Spinner />;
if (error) return <Error error={error} />;
if (!data) return null;
return <Content data={data} />;
```

### List Rendering
```tsx
// Always use unique, stable keys
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}

// Never use index as key (unless list is static)
```

### Compound Components
```tsx
// Flexible composition
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```
