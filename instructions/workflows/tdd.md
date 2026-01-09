# Workflow: Test-Driven Development (TDD)

> Red-Green-Refactor cycle for building reliable software

## The TDD Cycle

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   1. RED          2. GREEN        3. REFACTOR  │
│   Write a         Make it         Improve the  │
│   failing test    pass            code         │
│                                                 │
│   ────────────►  ────────────►  ───────────►   │
│                                       │        │
│   ◄───────────────────────────────────┘        │
│              Repeat                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Step-by-Step Process

### 1. RED: Write a Failing Test
```typescript
// Start with what you want the code to DO
describe('calculateTotal', () => {
  it('should sum item prices', () => {
    const items = [
      { name: 'Apple', price: 1.50 },
      { name: 'Banana', price: 0.75 }
    ];
    
    const total = calculateTotal(items);
    
    expect(total).toBe(2.25);
  });
});
```

Run the test - it should FAIL (function doesn't exist yet).

### 2. GREEN: Write Minimal Code to Pass
```typescript
// Write the simplest code that passes
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

Run the test - it should PASS.

### 3. REFACTOR: Improve Without Breaking
```typescript
// Improve code quality while tests stay green
function calculateTotal(items: Item[]): number {
  if (items.length === 0) return 0;
  
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

Run tests again - still PASS.

### 4. Repeat with Next Behavior
```typescript
// Add test for next requirement
it('should apply discount when provided', () => {
  const items = [{ name: 'Apple', price: 10 }];
  
  const total = calculateTotal(items, { discount: 0.1 });
  
  expect(total).toBe(9); // 10% off
});
```

## TDD Best Practices

### Write Small Tests
```typescript
// Good - one behavior per test
it('should return 0 for empty cart', () => { ... });
it('should sum multiple items', () => { ... });
it('should apply percentage discount', () => { ... });
it('should apply fixed discount', () => { ... });

// Bad - testing too much at once
it('should calculate total correctly', () => {
  // Tests 5 different scenarios
});
```

### Test Behavior, Not Implementation
```typescript
// Good - tests what the function does
expect(user.isActive()).toBe(true);

// Bad - tests how it does it
expect(user.status).toBe('active');
expect(user._checkLastLogin()).toBe(true);
```

### Use Descriptive Names
```typescript
// Good - describes scenario and expectation
it('should reject order when inventory is insufficient');

// Bad - vague
it('should work correctly');
```

## When to Use TDD

### Great For
- Business logic
- Data transformations
- Utility functions
- API contracts
- Complex algorithms

### Less Suited For
- UI layout (use visual testing)
- Integration points (use integration tests)
- Exploratory coding (spike first, then TDD)

## TDD Workflow Example

```markdown
Feature: User Registration

## Test 1: Valid registration
1. RED: Write test for valid email/password → user created
2. GREEN: Implement basic creation
3. REFACTOR: Extract validation

## Test 2: Duplicate email
1. RED: Write test for duplicate → error thrown
2. GREEN: Add duplicate check
3. REFACTOR: Improve error message

## Test 3: Weak password
1. RED: Write test for weak password → rejected
2. GREEN: Add password validation
3. REFACTOR: Extract password rules

## Test 4: Password hashing
1. RED: Write test for password not stored plain
2. GREEN: Add hashing
3. REFACTOR: Extract hashing utility
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Writing too much code | Lose the safety net | Only write code to pass current test |
| Skipping refactor | Technical debt builds | Always refactor when green |
| Testing implementation | Brittle tests | Test behavior/outcomes |
| Tests not independent | Order-dependent failures | Each test sets up its own state |
| Vague assertions | False positives | Be specific about expectations |
