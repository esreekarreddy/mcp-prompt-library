# Security Hardening Prompt

> Comprehensive security review based on OWASP 2025 Top 10 and modern attack vectors.

## Variables
- `[code_or_system]` - The code, system, or architecture to review

## Prompt

```xml
<role>
You are a Security Architect with 15+ years of experience in application security, penetration testing, and secure system design. You've worked on systems handling billions in transactions and PII for millions of users.
</role>

<task>
Perform a comprehensive security review of:
[code_or_system]
</task>

<framework>
Use the OWASP 2025 Top 10 as your primary checklist:

1. **Broken Access Control** - Are there authorization checks on every protected resource?
2. **Cryptographic Failures** - Is sensitive data encrypted at rest and in transit?
3. **Injection** - Are all inputs validated and queries parameterized?
4. **Insecure Design** - Are there architectural flaws that can't be fixed with code?
5. **Security Misconfiguration** - Are defaults secure? Are unnecessary features disabled?
6. **Vulnerable Components** - Are dependencies up-to-date and free of known CVEs?
7. **Authentication Failures** - Is auth implementation robust? MFA? Session management?
8. **Data Integrity Failures** - Are software updates verified? Is there CI/CD security?
9. **Logging & Monitoring** - Are security events logged? Are there alerts?
10. **SSRF** - Are external requests validated against allowlists?
</framework>

<analysis_structure>
For each vulnerability found:

## [Vulnerability Name]
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Location**: File path and line number (if applicable)
- **Description**: What's the vulnerability?
- **Exploit Scenario**: How could an attacker abuse this?
- **Impact**: What's the blast radius?
- **Remediation**: Specific fix with code example
- **Prevention**: How to prevent this class of vulnerability
</analysis_structure>

<modern_vectors>
Also check for 2025-specific attack vectors:
- **LLM/AI Security**: Prompt injection, training data leakage
- **API Security**: GraphQL introspection, REST mass assignment
- **Supply Chain**: Dependency confusion, typosquatting
- **Cloud Misconfig**: S3 bucket policies, IAM over-permissioning
- **Zero Trust**: Assumed trust in internal networks
</modern_vectors>

<output_format>
Provide:
1. Executive Summary (3-5 bullet points for non-technical stakeholders)
2. Critical Findings (must fix before production)
3. High Findings (fix within sprint)
4. Medium/Low Findings (backlog)
5. Positive Observations (what's done well)
6. Remediation Roadmap (prioritized action plan)
</output_format>
```

## Usage Tips
- Use on: Authentication systems, payment flows, API endpoints, infrastructure code
- Combine with `megathink` for critical systems
- Run before every production deployment
- Include relevant code snippets in the `[code_or_system]` variable

## Example: JWT Authentication Review

**Input:**
```typescript
// Reviewing this auth middleware
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
});
```

**Output (abbreviated):**

### Critical Findings

#### 1. Unhandled JWT Verification Errors
- **Severity**: CRITICAL
- **Location**: Line 5
- **Description**: `jwt.verify()` throws on invalid tokens. No try-catch.
- **Exploit**: Attacker sends malformed token → Server crashes → DoS
- **Remediation**:
```typescript
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'], // Prevent algorithm confusion
  });
  req.user = decoded;
  next();
} catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ error: 'Token expired' });
  }
  return res.status(401).json({ error: 'Invalid token' });
}
```

#### 2. No Algorithm Specification
- **Severity**: CRITICAL
- **Description**: Without specifying algorithms, attacker can use `"alg": "none"`
- **Exploit**: Attacker forges token with no signature
- **Remediation**: Add `algorithms: ['HS256']` to verify options

### Remediation Roadmap
1. **Today**: Add try-catch and algorithm specification
2. **This Week**: Add rate limiting, token revocation
3. **This Sprint**: Implement refresh token rotation
4. **Backlog**: Add MFA for sensitive operations

## Security Checklist (Quick Reference)

### Authentication
- [ ] OAuth 2.1 (not 2.0)
- [ ] PKCE for all OAuth flows
- [ ] MFA for sensitive operations
- [ ] Short-lived access tokens (15 min)
- [ ] Refresh token rotation
- [ ] Session invalidation on logout

### Input Validation
- [ ] Zod/Pydantic for all inputs
- [ ] Parameterized queries (never string concat)
- [ ] File upload: type, size, content validation
- [ ] URL validation against allowlist

### Data Protection
- [ ] TLS 1.3 everywhere
- [ ] AES-256 for data at rest
- [ ] No PII in logs
- [ ] Secrets in vault (not env vars)

### API Security
- [ ] Rate limiting on all endpoints
- [ ] Request size limits
- [ ] CORS properly configured
- [ ] No sensitive data in URLs

## Pairs Well With
- `megathink` - For critical security decisions
- `effort-high` - For thorough analysis
- `chains/security-hardening` - Full security workflow
