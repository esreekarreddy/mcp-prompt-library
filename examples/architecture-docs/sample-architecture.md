# Sample Architecture Document

> Example of a well-structured architecture analysis

---

# Architecture Analysis: E-Commerce Platform

**Date**: January 2024  
**Analyst**: Engineering Team  
**Scope**: Full application architecture

---

## 1. Architecture Overview

### Pattern: Clean Architecture with Domain-Driven Design

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (Next.js App Router, React Server Components, API)     │
├─────────────────────────────────────────────────────────┤
│                   Application Layer                      │
│  (Use Cases, DTOs, Application Services)                │
├─────────────────────────────────────────────────────────┤
│                     Domain Layer                         │
│  (Entities, Value Objects, Domain Services, Events)     │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                    │
│  (Repositories, External Services, Database)            │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

### User Action → Database

```
1. User clicks "Add to Cart"
2. React component calls server action
3. Server action invokes CartService.addItem()
4. CartService validates business rules
5. CartRepository.save() persists to database
6. Cache invalidated
7. UI updates via revalidation
```

### Request Lifecycle

```
Request
    ↓
Middleware (auth, logging, rate limiting)
    ↓
Route Handler / Server Action
    ↓
Application Service (orchestration)
    ↓
Domain Service (business logic)
    ↓
Repository (data access)
    ↓
Database
    ↓
Response
```

---

## 3. Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (shop)/              # Main shop routes
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   ├── api/                 # API routes
│   │   └── webhooks/
│   └── layout.tsx
│
├── components/              # React components
│   ├── ui/                 # Base components (Button, Input)
│   └── features/           # Feature components (ProductCard)
│
├── lib/                    # Shared utilities
│   ├── actions/           # Server actions
│   ├── api/               # API client
│   └── utils/             # Helpers
│
├── domain/                 # Domain layer
│   ├── entities/          # Business entities
│   ├── value-objects/     # Value objects
│   ├── services/          # Domain services
│   └── events/            # Domain events
│
├── application/           # Application layer
│   ├── use-cases/        # Use case implementations
│   ├── dtos/             # Data transfer objects
│   └── services/         # Application services
│
├── infrastructure/        # Infrastructure layer
│   ├── database/         # Prisma client, migrations
│   ├── repositories/     # Data access
│   ├── external/         # External service clients
│   └── cache/            # Caching layer
│
└── types/                # TypeScript types
```

---

## 4. Key Files & Responsibilities

### Routing & Presentation

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout, providers |
| `app/(shop)/products/page.tsx` | Product listing page |
| `app/api/webhooks/stripe/route.ts` | Stripe webhook handler |
| `middleware.ts` | Auth, rate limiting |

### Business Logic

| File | Purpose |
|------|---------|
| `domain/entities/Order.ts` | Order entity with business rules |
| `domain/services/PricingService.ts` | Price calculation logic |
| `application/use-cases/CreateOrder.ts` | Order creation use case |

### Data Access

| File | Purpose |
|------|---------|
| `infrastructure/database/client.ts` | Prisma client singleton |
| `infrastructure/repositories/OrderRepository.ts` | Order data access |
| `infrastructure/cache/redis.ts` | Redis cache client |

### Configuration

| File | Purpose |
|------|---------|
| `lib/config/env.ts` | Environment variables |
| `prisma/schema.prisma` | Database schema |
| `next.config.js` | Next.js configuration |

---

## 5. Patterns to Follow

### Creating a New Entity

```typescript
// domain/entities/Product.ts
export class Product {
  private constructor(
    public readonly id: ProductId,
    public readonly name: string,
    public readonly price: Money,
    public readonly inventory: number
  ) {}

  static create(props: ProductProps): Result<Product> {
    // Validation
    if (props.price.amount < 0) {
      return Result.fail('Price cannot be negative');
    }
    return Result.ok(new Product(...));
  }

  canPurchase(quantity: number): boolean {
    return this.inventory >= quantity;
  }
}
```

### Creating a Use Case

```typescript
// application/use-cases/CreateOrder.ts
export class CreateOrderUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private paymentService: IPaymentService
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    // 1. Load products
    // 2. Validate inventory
    // 3. Calculate total
    // 4. Process payment
    // 5. Create order
    // 6. Emit events
  }
}
```

### Creating a Repository

```typescript
// infrastructure/repositories/OrderRepository.ts
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: OrderId): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id: id.value },
      include: { items: true }
    });
    return data ? OrderMapper.toDomain(data) : null;
  }
}
```

---

## 6. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.x | Framework |
| react | 18.x | UI library |
| prisma | 5.x | ORM |
| zod | 3.x | Validation |
| stripe | 14.x | Payments |
| @tanstack/react-query | 5.x | Data fetching |
| tailwindcss | 3.x | Styling |

---

## 7. Potential Issues

### Performance
- **N+1 queries in product listing**: Use Prisma `include` for eager loading
- **No caching on product pages**: Add Redis caching with 5-min TTL

### Security
- **Rate limiting missing on checkout**: Add rate limiter middleware
- **Webhook signature not verified**: Add Stripe signature verification

### Maintainability
- **Some business logic in components**: Extract to domain services
- **Inconsistent error handling**: Implement global error boundary

---

## 8. Adding New Feature: Wishlist

If adding a wishlist feature, you would touch:

1. **Domain**: `domain/entities/Wishlist.ts` - New entity
2. **Database**: `prisma/schema.prisma` - Add Wishlist model
3. **Repository**: `infrastructure/repositories/WishlistRepository.ts`
4. **Use Cases**: `application/use-cases/AddToWishlist.ts`
5. **API/Actions**: `lib/actions/wishlist.ts`
6. **UI**: `components/features/WishlistButton.tsx`
7. **Pages**: `app/(shop)/wishlist/page.tsx`

---

*This architecture document was created using the Architecture Analyzer prompt from ai-library.*
