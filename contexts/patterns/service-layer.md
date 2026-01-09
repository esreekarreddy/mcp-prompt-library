# Service Layer Pattern

> Organizing business logic in a dedicated layer

## Concept

The Service Layer contains business logic, sitting between controllers/handlers and data access:

```
Controller → Service → Repository → Database
    ↑           ↓
    └─── Response
```

## Benefits

- **Reusability**: Same logic used by API, CLI, jobs
- **Testability**: Test business logic without HTTP
- **Separation of Concerns**: Controllers handle HTTP, services handle logic
- **Transaction Management**: Coordinate multiple operations

## Implementation

### TypeScript Example

```typescript
// services/order.service.ts
import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { PaymentService } from './payment.service';
import { EmailService } from './email.service';

interface CreateOrderInput {
  userId: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethodId: string;
}

class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private paymentService: PaymentService,
    private emailService: EmailService
  ) {}

  async createOrder(input: CreateOrderInput): Promise<Order> {
    // 1. Validate products exist and have stock
    const products = await this.validateAndGetProducts(input.items);
    
    // 2. Calculate total
    const total = this.calculateTotal(products, input.items);
    
    // 3. Process payment
    const payment = await this.paymentService.charge({
      amount: total,
      methodId: input.paymentMethodId,
      userId: input.userId,
    });
    
    if (!payment.success) {
      throw new PaymentError(payment.error);
    }
    
    // 4. Create order
    const order = await this.orderRepo.create({
      userId: input.userId,
      items: input.items,
      total,
      paymentId: payment.id,
      status: 'confirmed',
    });
    
    // 5. Update inventory
    await this.productRepo.decrementStock(input.items);
    
    // 6. Send confirmation (async, don't wait)
    this.emailService.sendOrderConfirmation(order).catch(console.error);
    
    return order;
  }

  private async validateAndGetProducts(items: OrderItem[]) {
    const productIds = items.map(i => i.productId);
    const products = await this.productRepo.findByIds(productIds);
    
    // Check all products exist
    if (products.length !== productIds.length) {
      throw new ValidationError('Some products not found');
    }
    
    // Check stock
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }
    }
    
    return products;
  }

  private calculateTotal(products: Product[], items: OrderItem[]): number {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product.price * item.quantity);
    }, 0);
  }
}
```

### Using in Controller

```typescript
// controllers/order.controller.ts
class OrderController {
  constructor(private orderService: OrderService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await this.orderService.createOrder({
        userId: req.user.id,
        items: req.body.items,
        paymentMethodId: req.body.paymentMethodId,
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof PaymentError) {
        return res.status(402).json({ error: error.message });
      }
      next(error);
    }
  }
}
```

## Service Guidelines

### Do
- Contain all business logic
- Coordinate between repositories
- Handle transactions
- Throw domain-specific errors

### Don't
- Handle HTTP request/response
- Access request objects directly
- Know about view layer
- Contain data access logic

## Service Method Patterns

```typescript
// Query methods - return data or null
async getUser(id: string): Promise<User | null> {
  return this.userRepo.findById(id);
}

// Command methods - throw on failure
async createUser(data: CreateUserInput): Promise<User> {
  // Validation
  if (await this.userRepo.findByEmail(data.email)) {
    throw new DuplicateError('Email already exists');
  }
  
  // Business logic
  const hashedPassword = await this.hashPassword(data.password);
  
  // Persistence
  return this.userRepo.create({
    ...data,
    password: hashedPassword,
  });
}

// Boolean checks
async canUserAccess(userId: string, resourceId: string): Promise<boolean> {
  const resource = await this.resourceRepo.findById(resourceId);
  return resource?.ownerId === userId;
}
```
