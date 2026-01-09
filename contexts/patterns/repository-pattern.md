# Repository Pattern

> Abstracting data access from business logic

## Concept

The Repository Pattern separates the data access layer from business logic:

```
Business Logic → Repository Interface → Repository Implementation → Database
```

## Benefits

- **Testability**: Mock repositories in tests
- **Flexibility**: Switch databases without changing business logic
- **Single Responsibility**: Data access logic in one place
- **Abstraction**: Business logic doesn't know about SQL/ORM

## Implementation

### TypeScript Example

```typescript
// types/user.ts
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface CreateUserInput {
  email: string;
  name: string;
}

// repositories/user.repository.interface.ts
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: CreateUserInput): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

// repositories/user.repository.ts
class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
  
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  
  async create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
  
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
```

### Using in Service Layer

```typescript
// services/user.service.ts
class UserService {
  constructor(private userRepo: IUserRepository) {}
  
  async registerUser(email: string, name: string): Promise<User> {
    // Business logic here
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }
    
    return this.userRepo.create({ email, name });
  }
  
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }
}
```

### Testing with Mock Repository

```typescript
// tests/user.service.test.ts
class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  
  async findById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }
  
  async findByEmail(email: string) {
    return this.users.find(u => u.email === email) || null;
  }
  
  async create(data: CreateUserInput) {
    const user = { id: '1', ...data, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
  
  // ... other methods
}

describe('UserService', () => {
  it('should register new user', async () => {
    const repo = new MockUserRepository();
    const service = new UserService(repo);
    
    const user = await service.registerUser('test@example.com', 'Test');
    
    expect(user.email).toBe('test@example.com');
  });
  
  it('should reject duplicate email', async () => {
    const repo = new MockUserRepository();
    const service = new UserService(repo);
    
    await service.registerUser('test@example.com', 'Test');
    
    await expect(
      service.registerUser('test@example.com', 'Test2')
    ).rejects.toThrow('Email already exists');
  });
});
```

## When to Use

**Good for:**
- Large applications with complex data access
- When you might switch databases
- When extensive testing is needed
- Multi-database scenarios

**Overkill for:**
- Simple CRUD apps
- Prototypes
- Small projects with single database
