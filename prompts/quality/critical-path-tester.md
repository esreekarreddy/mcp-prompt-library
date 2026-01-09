# Critical Path Tester

> Generate tests for critical user paths

## Variables
- `[your framework]` - Testing framework (Jest, Vitest, Playwright, etc.)

## Prompt

```
Generate tests for critical paths.

Critical = if broken, would lose money, lose data, lock users out, or cause security issues.

Test:

1. Auth flows:
   - Signup valid → user created
   - Signup existing email → error
   - Login correct → session
   - Login wrong → rejected, no info leak
   - Protected route without auth → redirect

2. Data mutations (create/update/delete):
   - Happy path
   - Invalid data rejected
   - Can't mutate others' data
   - Failed mutation = no partial state

3. Payments (if applicable):
   - Happy path
   - Webhook success
   - Webhook failure
   - No paid features without paying

Use [your framework]. AAA pattern. Test behavior not implementation. Independent tests.

Generate actual test files.
```

## Usage Tips

- Run before major releases
- Focus on **critical paths** - things that would be disasters if broken
- AAA = Arrange, Act, Assert
- Tests should be independent (no shared state)
- Test behavior, not implementation details

## Pairs Well With

- [pre-launch-checklist.md](pre-launch-checklist.md) - Part of launch prep
- [security-audit.md](security-audit.md) - Security-focused tests
- `snippets/modifiers/be-thorough.md` - More comprehensive coverage

## Test Structure Example

```typescript
// tests/auth/signup.test.ts
describe('User Signup', () => {
  // Arrange (setup) happens in beforeEach if shared
  
  it('creates user with valid data', async () => {
    // Arrange
    const userData = { email: 'new@test.com', password: 'SecurePass123!' };
    
    // Act
    const response = await request(app).post('/api/auth/signup').send(userData);
    
    // Assert
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.password).toBeUndefined(); // Not exposed
  });

  it('rejects duplicate email', async () => {
    // Arrange - user already exists
    await createUser({ email: 'existing@test.com' });
    
    // Act
    const response = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'existing@test.com', password: 'Password123!' });
    
    // Assert
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('already exists');
  });

  it('rejects weak password', async () => {
    // Arrange
    const userData = { email: 'test@test.com', password: '123' };
    
    // Act
    const response = await request(app).post('/api/auth/signup').send(userData);
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('password');
  });
});
```

## Critical Paths by Domain

### E-commerce
- User can complete purchase
- Payment processed correctly
- Order created in database
- Inventory updated
- Confirmation email sent

### SaaS
- User can sign up
- User can upgrade plan
- Billing works correctly
- Feature gating works
- User can cancel

### Content Platform
- User can create content
- Content visibility correct
- User can't access others' private content
- Delete actually deletes

## Testing Anti-Patterns

| Anti-Pattern | Problem | Better Approach |
|--------------|---------|-----------------|
| Testing implementation | Brittle tests | Test behavior/outcomes |
| Shared mutable state | Flaky tests | Independent test setup |
| Too many mocks | False confidence | Integration tests for critical paths |
| Testing frameworks | Not your code | Test your logic |
| Ignoring edge cases | Bugs in prod | Test boundaries |
