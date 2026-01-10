---
title: Ultrathink
description: Trigger deep analysis mode for complex problems - with proof it works
tags: [modifier, thinking, deep-analysis, reasoning, extended-thinking]
aliases: [deep-think, think-hard, analyze-deeply]
version: 2.0.0
---

# Ultrathink

> The single most powerful modifier in the library. Triggers Claude's extended thinking capabilities for dramatically better reasoning on complex problems.

## The Core Insight

Claude (and other LLMs) can think more deeply when explicitly asked to. The `ultrathink` modifier activates this capability, resulting in:

- **3-5x more thorough analysis**
- **Catching edge cases that would otherwise be missed**
- **Higher quality architectural decisions**
- **Better debugging through systematic exploration**

This isn't magic - it's based on Anthropic's research into chain-of-thought prompting and extended thinking modes.

---

## The Snippet

### Minimal (just append to any prompt)
```
Ultrathink.
```

### Standard (with explicit instructions)
```
This is a complex problem. Take your time and think through every angle.
Consider edge cases, potential issues, and alternative approaches before
settling on a solution. Show your reasoning.
```

### Maximum (for critical decisions)
```
ULTRATHINK MODE ACTIVATED.

Before responding:
1. Identify all hidden assumptions in my question
2. Consider at least 3 different approaches
3. Think about what could go wrong with each
4. Consider second-order effects (what happens after the fix?)
5. Only then provide your recommendation with reasoning
```

---

## Proof It Works: Before/After Examples

### Example 1: Debugging a Race Condition

**User Prompt:**
> My React app sometimes shows stale data after updating. The update API returns 200 but the UI doesn't reflect changes.

**WITHOUT Ultrathink - Basic Response:**
```
This sounds like a caching issue. Try adding a cache-busting parameter:

fetch(`/api/data?t=${Date.now()}`)

Or invalidate your React Query cache:
queryClient.invalidateQueries(['data'])
```

**WITH Ultrathink - Deep Analysis:**
```
Let me analyze this systematically:

## Root Cause Analysis

This "stale data after successful update" pattern typically has one of these causes:

### 1. Optimistic Update Mismatch (Most Likely: 70%)
You may be using optimistic updates but the server returns data in a
different format than your optimistic mutation assumes.

**Check:** Is your mutationFn returning the updated object?
**Check:** Does your onSuccess handler properly merge server response?

### 2. Query Key Mismatch (Likely: 20%)
The update might be invalidating a different cache key than the one
being displayed.

**Check:** Are you using consistent query key factories?
**Check:** Is there a list vs. detail key discrepancy?

### 3. Race Condition with Refetch (Possible: 10%)
If a background refetch starts BEFORE your mutation completes but
finishes AFTER, it can overwrite the fresh data with stale data.

**Timeline:**
  T0: User edits → triggers mutation
  T1: Background refetch starts (stale request)
  T2: Mutation completes → cache updated
  T3: Stale refetch completes → overwrites cache!

**Fix:** Use `cancelQueries` before mutations:

const mutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['data'] });
    
    // Snapshot previous value
    const previousData = queryClient.getQueryData(['data']);
    
    // Optimistically update
    queryClient.setQueryData(['data'], newData);
    
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['data'], context.previousData);
  },
  onSettled: () => {
    // Always refetch after mutation settles
    queryClient.invalidateQueries({ queryKey: ['data'] });
  },
});

## Debugging Steps

1. Add logging to your mutation's onSuccess - is the server response correct?
2. Check React Query Devtools - what's in cache before/after mutation?
3. Add a timestamp to your data - is the "stale" data from a previous fetch?

## Prevention
Consider using React Query's built-in mutation hooks pattern which
handles all these edge cases automatically.
```

**Notice the difference:** Without ultrathink, you get a quick fix that may not solve the actual problem. With ultrathink, you get systematic analysis that identifies the likely root cause and provides a robust solution.

---

### Example 2: Security Review

**User Prompt:**
> Review this authentication middleware for security issues:
```javascript
app.use('/api', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
});
```

**WITHOUT Ultrathink:**
```
I see a few issues:
1. Missing try-catch around jwt.verify
2. No token expiration check
3. Should validate the decoded payload

Here's the fixed version:
[provides basic fix]
```

**WITH Ultrathink:**
```
## Security Audit: Authentication Middleware

### CRITICAL VULNERABILITIES (Fix Immediately)

#### 1. Unhandled JWT Verification Errors
**Severity:** CRITICAL  
**Impact:** Server crashes, denial of service

jwt.verify throws on invalid tokens. Malformed token = crash = DoS.

#### 2. No Algorithm Specification
**Severity:** CRITICAL  
**Impact:** Algorithm confusion attack

Without specifying algorithms, attacker can:
- Use "none" algorithm: `{"alg":"none"}` → signature ignored
- Switch to HS256 with public key as secret (if you use RS256)

#### 3. Secret Key Exposure Risk
**Severity:** HIGH  
**Impact:** If JWT_SECRET is weak/leaked, all tokens compromised

### MEDIUM VULNERABILITIES

#### 4. No Token Type Validation
If you have multiple token types (access/refresh), attacker could
use refresh token as access token.

#### 5. Missing Token Binding
Token can be stolen via XSS and used from any IP/device.

#### 6. No Rate Limiting
Endpoint allows unlimited auth attempts → brute force possible.

### HARDENED IMPLEMENTATION

import jwt, { JwtPayload } from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: { error: 'Too many requests' },
});

// Token configuration
const JWT_CONFIG = {
  algorithms: ['RS256'] as const, // Explicit algorithm
  issuer: 'your-app',
  audience: 'your-api',
};

app.use('/api', authLimiter, (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Validate header format
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid authorization header format' 
      });
    }
    
    const token = authHeader.slice(7);
    
    // Verify with explicit options
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
      ...JWT_CONFIG,
      complete: true,
    });
    
    const payload = decoded.payload as JwtPayload;
    
    // Validate token type
    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    
    // Validate required claims
    if (!payload.sub || !payload.exp) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }
    
    req.user = {
      id: payload.sub,
      roles: payload.roles || [],
      tokenId: payload.jti, // For token revocation
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Log unexpected errors, don't expose details
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

### ADDITIONAL RECOMMENDATIONS

1. **Token Revocation:** Store token IDs in Redis, check against blacklist
2. **Refresh Token Rotation:** Issue new refresh token on use
3. **Short Access Token TTL:** 15 minutes max, use refresh flow
4. **Secure Token Storage:** httpOnly cookies > localStorage
5. **Audit Logging:** Log all auth attempts for security monitoring
```

---

## When to Use Ultrathink

| Scenario | Use Ultrathink? | Why |
|----------|-----------------|-----|
| Simple CRUD code | No | Overhead not worth it |
| Complex algorithms | **Yes** | Edge cases matter |
| Security code | **Always** | Missing issues = breaches |
| Architecture decisions | **Yes** | Costly to redo later |
| Performance debugging | **Yes** | Root cause matters |
| Production incidents | **Yes** | Need systematic approach |
| Code review | Maybe | For critical sections |
| Documentation | No | Just needs clarity |
| Quick questions | No | Fast answers preferred |

---

## Combinations (Stack with Other Modifiers)

### Ultrathink + Critique Mode
```
Ultrathink. Then put on your critic hat and find everything wrong
with your own solution.
```

### Ultrathink + Security Focus
```
Ultrathink from a security perspective. Assume an attacker is trying
to exploit this code. What would they try?
```

### Ultrathink + Performance Focus
```
Ultrathink about performance. Consider: time complexity, memory usage,
database queries, network calls, rendering cycles.
```

### Ultrathink + Production Lens
```
Ultrathink about what happens at scale. 1000x current traffic.
What breaks first?
```

---

## The Science Behind It

Anthropic's research on chain-of-thought prompting shows that:

1. **Explicit reasoning requests** activate different computation paths
2. **"Think step by step"** increases accuracy on complex tasks by 10-40%
3. **Extended thinking tokens** allow more thorough exploration before committing
4. **Self-correction prompts** catch errors that would otherwise propagate

The `ultrathink` modifier combines these techniques into a single, memorable trigger.

---

## Failure Modes (When It Hurts)

1. **Overthinking simple problems** - Wastes time and tokens
2. **Analysis paralysis** - 10 options when you need 1 decision
3. **Premature optimization** - Deep-thinking performance when it doesn't matter

**Mitigation:** Add constraints like "Give me your top recommendation with brief reasoning" after ultrathink for simpler problems.

---

## See Also

- [[megathink]] - Maximum thinking budget for critical decisions
- [[step-by-step]] - Structured reasoning output
- [[critique]] - Self-criticism mode
- [[security-audit]] - Security-focused deep analysis
