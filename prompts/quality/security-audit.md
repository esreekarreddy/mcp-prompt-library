# Security Audit

> Comprehensive security audit before production

## Prompt

```
Security audit before production.

Check:

1. Injection: SQL injection, command injection, XSS

2. Auth: Hardcoded secrets, weak passwords, missing rate limiting, non-expiring sessions

3. Authorization: IDOR, missing auth checks, bypassable role checks

4. Data exposure: Sensitive data in logs, stack traces to users, PII leaks

5. Config: Debug mode, permissive CORS, missing security headers

For each issue: severity, file/line, how to exploit, how to fix with code.

Be thorough. Ultrathink.
```

## Usage Tips

- Run **before every production deployment**
- Run after adding auth/payment/sensitive features
- "How to exploit" helps prioritize severity
- Fix critical/high before shipping
- Document accepted risks for medium/low

## Pairs Well With

- [security-fixer.md](security-fixer.md) - Fix the issues found
- [pre-launch-checklist.md](pre-launch-checklist.md) - Full pre-launch review
- `snippets/modifiers/ultrathink.md` - Deeper analysis

## Expected Output Format

```markdown
# Security Audit Report

## Critical

### 1. SQL Injection in User Search
- **Severity**: CRITICAL
- **File**: `src/api/users/search.ts:34`
- **Issue**: User input concatenated into SQL query
- **Exploit**: `search?q='; DROP TABLE users; --`
- **Fix**:
```typescript
// Before
const query = `SELECT * FROM users WHERE name LIKE '%${search}%'`;

// After
const query = `SELECT * FROM users WHERE name LIKE $1`;
const result = await db.query(query, [`%${search}%`]);
```

---

## High

### 2. Missing Rate Limiting on Login
- **Severity**: HIGH
- **File**: `src/api/auth/login.ts`
- **Issue**: No rate limiting on login endpoint
- **Exploit**: Brute force password attacks
- **Fix**: Add rate limiter middleware

---

## Medium
[...]

## Low
[...]

## Summary
- Critical: X issues
- High: X issues
- Medium: X issues
- Low: X issues
```

## Security Checklist Quick Reference

### Injection
- [ ] All SQL uses parameterized queries
- [ ] No shell command execution with user input
- [ ] HTML output is escaped/sanitized

### Authentication
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Sessions expire appropriately
- [ ] Rate limiting on auth endpoints
- [ ] No secrets in code

### Authorization
- [ ] Every endpoint checks permissions
- [ ] Can't access other users' data
- [ ] Role checks can't be bypassed

### Data
- [ ] No PII in logs
- [ ] Errors don't leak stack traces
- [ ] Sensitive data encrypted at rest

### Config
- [ ] Debug mode off in production
- [ ] CORS properly configured
- [ ] Security headers set (CSP, HSTS, etc.)
