# Chain: Security Hardening

> Comprehensive workflow for securing an application

## Overview

```
Audit → Prioritize → Fix → Verify → Monitor
```

---

## Step 1: Security Audit

**Prompt:**
```
Security audit this codebase.

Check for:

1. Injection: SQL injection, command injection, XSS
2. Auth: Hardcoded secrets, weak passwords, missing rate limiting, non-expiring sessions
3. Authorization: IDOR, missing auth checks, bypassable role checks
4. Data exposure: Sensitive data in logs, stack traces to users, PII leaks
5. Config: Debug mode, permissive CORS, missing security headers

For each issue: severity (critical/high/medium/low), file/line, how to exploit, how to fix with code.

Be thorough. Ultrathink.
```

**Expected Output:**
- Comprehensive issue list
- Severity ratings
- Exploitation details
- Fix recommendations

---

## Step 2: Prioritize Fixes

**Prompt:**
```
Based on the security audit, help me prioritize:

Issues found:
[List issues]

For each severity:
1. Critical: Must fix immediately, could be actively exploited
2. High: Fix this sprint, significant risk
3. Medium: Plan to fix soon
4. Low: Address opportunistically

Also consider:
- Dependencies between fixes
- Quick wins vs. major changes
- External exposure (public vs. internal)

Create a prioritized action plan.
```

**Expected Output:**
- Prioritized fix order
- Timeline recommendations
- Dependencies noted

**Decision Point:** Agree on priority and timeline.

---

## Step 3: Fix Critical Issues

**Prompt:**
```
Fix this critical security issue:

Issue: [Issue details]
Location: [File and line]
Exploitation: [How it could be exploited]

Requirements:
1. Completely eliminate the vulnerability
2. Don't break existing functionality
3. Add test to prevent regression
4. Follow security best practices

Show the fix and explain why it's secure.
```

**Expected Output:**
- Security fix
- Explanation
- Regression test

**Repeat** for each critical/high issue.

---

## Step 4: Add Security Controls

**Prompt:**
```
Beyond fixing specific issues, add these security controls:

1. Rate limiting on sensitive endpoints
2. Input validation on all user input
3. Security headers (CSP, HSTS, X-Frame-Options)
4. Proper CORS configuration
5. Audit logging for security events

For each:
- What to implement
- Where to add it
- Configuration recommendations
```

**Expected Output:**
- Security middleware
- Headers configuration
- Logging setup

---

## Step 5: Verify Security Fixes

**Prompt:**
```
Verify the security fixes are effective:

For each fix made:
1. Attempt the original exploit - should fail
2. Check for bypass possibilities
3. Verify no regressions
4. Confirm logging works

Also:
- Run OWASP ZAP or similar scanner
- Review with security checklist
- Check for new issues introduced

Report findings.
```

**Expected Output:**
- Verification results
- Any remaining issues
- Scanner results

---

## Step 6: Security Documentation

**Prompt:**
```
Document the security measures:

1. What security controls are in place?
2. How is authentication handled?
3. How is authorization handled?
4. What data is encrypted?
5. What is logged (and not logged)?
6. How to report security issues?
7. Incident response process?

Create a security section for documentation.
```

**Expected Output:**
- Security documentation
- Incident response plan
- Reporting process

---

## Step 7: Ongoing Monitoring

**Prompt:**
```
Set up security monitoring:

1. What security events should trigger alerts?
2. What dashboards should exist?
3. How often should security scans run?
4. What's the process for security updates?
5. How to handle vulnerability disclosures?

Create a security operations plan.
```

**Expected Output:**
- Monitoring configuration
- Alert rules
- Operational procedures

---

## Chain Summary

| Step | Focus | Output |
|------|-------|--------|
| 1 | Audit | Issue inventory |
| 2 | Prioritize | Action plan |
| 3 | Fix | Patched vulnerabilities |
| 4 | Controls | Security infrastructure |
| 5 | Verify | Confirmed secure |
| 6 | Document | Security docs |
| 7 | Monitor | Ongoing vigilance |

## Security Checklist

### Authentication
- [ ] Passwords hashed with bcrypt/argon2
- [ ] Sessions expire appropriately
- [ ] MFA available for sensitive accounts
- [ ] Account lockout after failures
- [ ] Secure password reset flow

### Authorization
- [ ] Every endpoint checks permissions
- [ ] Role checks on sensitive operations
- [ ] No IDOR vulnerabilities
- [ ] Principle of least privilege

### Input/Output
- [ ] All input validated
- [ ] Output encoded/escaped
- [ ] File uploads validated
- [ ] No SQL injection possible
- [ ] No XSS possible

### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS for data in transit
- [ ] No PII in logs
- [ ] Secure secret storage

### Infrastructure
- [ ] Security headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting in place
- [ ] Debug mode disabled
