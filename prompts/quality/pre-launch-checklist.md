# Pre-Launch Checklist

> Complete checklist before deploying to production

## Prompt

```
Deploying to production. Run pre-launch checklist:

Environment:
- Secrets in env vars (not hardcoded)?
- Different configs for dev/prod?
- .env.example exists?
- Debug mode off?

Security:
- Auth on sensitive routes?
- Rate limiting on public endpoints?
- Input validation everywhere?
- HTTPS enforced?
- Security headers set?

Errors:
- Global error handler?
- Friendly errors to users?
- Errors logged with context?

Database:
- Migrations current?
- Indexes on queried columns?
- Connection pooling?

For each: 
✅ Good, 
⚠️ Needs attention (what to fix), 
or ❌ Missing (how to add).
```

## Usage Tips

- Run **before every production deployment**
- Don't skip items - each has caused real outages
- Fix all ❌ items before deploying
- Document ⚠️ items for future improvement
- Add project-specific checks as needed

## Pairs Well With

- [security-audit.md](security-audit.md) - Deeper security review
- [critical-path-tester.md](critical-path-tester.md) - Test critical paths
- `chains/production-launch.md` - Full launch workflow

## Extended Checklist

### Environment
- [ ] All secrets in environment variables
- [ ] No hardcoded API keys, passwords, tokens
- [ ] Separate configs for dev/staging/prod
- [ ] `.env.example` exists and is current
- [ ] Debug mode / verbose logging OFF
- [ ] Production URLs configured

### Security
- [ ] All sensitive routes require authentication
- [ ] Authorization checks on all endpoints
- [ ] Rate limiting on public endpoints
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all user inputs
- [ ] HTTPS enforced (redirect HTTP)
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] CORS properly configured
- [ ] No sensitive data in URLs

### Error Handling
- [ ] Global error handler configured
- [ ] Friendly error messages to users
- [ ] No stack traces exposed to users
- [ ] Errors logged with context
- [ ] Error monitoring/alerting set up

### Database
- [ ] All migrations applied
- [ ] Indexes on frequently queried columns
- [ ] Connection pooling configured
- [ ] Backup strategy in place
- [ ] Data retention policy defined

### Performance
- [ ] Assets minified/compressed
- [ ] Caching headers configured
- [ ] CDN configured (if applicable)
- [ ] Database queries optimized
- [ ] No N+1 query issues

### Monitoring
- [ ] Health check endpoint exists
- [ ] Logging configured
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Uptime monitoring

### Documentation
- [ ] README is current
- [ ] API documentation exists
- [ ] Deployment process documented
- [ ] Rollback procedure documented

## Expected Output

```markdown
# Pre-Launch Checklist

## Environment
✅ Secrets in env vars - All API keys use process.env
✅ Different configs - config/production.ts exists
⚠️ .env.example - Missing DATABASE_URL entry
✅ Debug mode off - NODE_ENV=production verified

## Security
✅ Auth on sensitive routes - middleware applied
❌ Rate limiting - Not implemented on /api/auth/*
  → Fix: Add express-rate-limit to auth routes
✅ Input validation - Zod schemas on all inputs
✅ HTTPS enforced - Redirect middleware in place
⚠️ Security headers - CSP not configured
  → Consider: Add helmet.js with CSP

[Continue for all sections...]

## Summary
- ✅ Good: 15
- ⚠️ Needs attention: 3
- ❌ Missing: 1

## Must Fix Before Launch
1. Add rate limiting to auth routes
```
