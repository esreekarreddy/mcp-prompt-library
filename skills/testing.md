# Skill: Testing

> Writing effective, maintainable tests

## When to Activate

- Writing new tests
- Reviewing test coverage
- Setting up testing infrastructure
- Improving existing tests

## Behavior

1. **Test Behavior, Not Implementation**
   - Focus on what code does, not how
   - Tests should survive refactoring
   - Avoid testing private methods directly

2. **Follow AAA Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange - set up test data
     const input = createTestData();
     
     // Act - perform the action
     const result = doSomething(input);
     
     // Assert - verify outcome
     expect(result).toEqual(expected);
   });
   ```

3. **Write Independent Tests**
   - No shared mutable state
   - Each test can run alone
   - Order doesn't matter

4. **Name Tests Clearly**
   - Describe the scenario
   - State the expected outcome
   - `should [do X] when [condition]`

## Test Types

| Type | Purpose | Speed | Scope |
|------|---------|-------|-------|
| Unit | Test single functions/classes | Fast | Narrow |
| Integration | Test component interactions | Medium | Medium |
| E2E | Test full user flows | Slow | Wide |

## Test Pyramid

```
       /\
      /E2E\         Few - critical paths only
     /------\
    /Integration\   Some - key integrations
   /--------------\
  /     Unit       \  Many - all logic branches
 /------------------\
```

## What to Test

### Always Test
- Happy path (main success scenario)
- Edge cases (empty, null, max values)
- Error handling
- Authorization/authentication
- Data validation

### Consider Testing
- Error messages are correct
- Logging happens appropriately
- Performance-critical paths

### Avoid Testing
- Third-party library internals
- Simple getters/setters
- Framework code

## Test Quality Checklist

- [ ] Tests are independent (no order dependency)
- [ ] Tests are deterministic (same result every time)
- [ ] Tests are fast (unit tests < 100ms)
- [ ] Tests have clear names
- [ ] Tests have single assertion focus
- [ ] Mocks are minimal and justified

## Example Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test' };
      
      // Act
      const user = await userService.createUser(userData);
      
      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it('should throw when email already exists', async () => {
      // Arrange
      await createExistingUser('taken@example.com');
      
      // Act & Assert
      await expect(
        userService.createUser({ email: 'taken@example.com', name: 'Test' })
      ).rejects.toThrow('Email already exists');
    });

    it('should hash password before storing', async () => {
      // Arrange
      const plainPassword = 'password123';
      
      // Act
      const user = await userService.createUser({
        email: 'test@example.com',
        password: plainPassword
      });
      
      // Assert
      expect(user.password).not.toBe(plainPassword);
      expect(await verifyHash(user.password, plainPassword)).toBe(true);
    });
  });
});
```
