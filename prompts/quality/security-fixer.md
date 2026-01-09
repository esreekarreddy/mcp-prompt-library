# Security Fixer

> Fix identified security vulnerabilities

## Variables
- `[paste scan results]` - Output from security scanner or audit

## Prompt

```
Fix all these vulnerabilities:

[paste scan results]
```

## Usage Tips

- Use **after** [security-audit.md](security-audit.md) or a security scanner
- Fix in order of severity (critical → high → medium → low)
- Test each fix before moving to the next
- Document any fixes that might affect functionality
- Re-run audit after fixes to verify

## Pairs Well With

- [security-audit.md](security-audit.md) - Run audit first
- [pre-launch-checklist.md](pre-launch-checklist.md) - Verify fixes complete
- `snippets/modifiers/step-by-step.md` - Methodical fixes

## Common Fix Patterns

### SQL Injection
```typescript
// Before (vulnerable)
const query = `SELECT * FROM users WHERE id = ${userId}`;

// After (safe)
const query = `SELECT * FROM users WHERE id = $1`;
const result = await db.query(query, [userId]);
```

### XSS Prevention
```typescript
// Before (vulnerable)
element.innerHTML = userInput;

// After (safe)
element.textContent = userInput;
// Or use a sanitization library
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Hardcoded Secrets
```typescript
// Before (vulnerable)
const apiKey = "sk-1234567890";

// After (safe)
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not configured');
```

### Missing Rate Limiting
```typescript
// Add to auth routes
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many attempts, try again later'
});

app.use('/api/auth', authLimiter);
```

### IDOR Prevention
```typescript
// Before (vulnerable) - any user can access
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  return res.json(order);
});

// After (safe) - verify ownership
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(order);
});
```

### Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet());
// Or configure individually:
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}));
```

## Verification Checklist

After fixing, verify:
- [ ] Vulnerability is no longer exploitable
- [ ] Fix doesn't break functionality
- [ ] Tests still pass
- [ ] Re-run security scan shows issue resolved
