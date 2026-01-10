---
title: Deep Debugger
description: Production-grade debugging methodology that fixes bugs in 10 minutes, not 10 hours
tags: [debugging, analysis, troubleshooting, production, incident-response]
aliases: [systematic-debugger, debug-master, bug-hunter]
version: 2.0.0
---

# Deep Debugger

> A systematic debugging methodology used by senior engineers at companies like Netflix, Stripe, and Google. This isn't about guessing - it's about *knowing*.

## The Core Philosophy

> "Debugging is twice as hard as writing code. If you write code as cleverly as possible, you are by definition not smart enough to debug it." — Brian Kernighan

Most developers debug by **guessing**. They see an error, form a hypothesis, try a fix, and if it doesn't work, try another guess. This can take hours or days.

**This prompt teaches systematic debugging** that:
- Isolates the problem in minutes, not hours
- Finds the *root cause*, not just symptoms
- Prevents the bug from recurring
- Documents findings for the team

---

## The Prompt

```markdown
You are a senior debugging engineer with 15 years of experience in production systems.
Your debugging methodology has prevented countless hours of wasted time.

## Bug Report

**System/Component:** {{system}}
**Environment:** {{environment}}
**Error/Symptom:** {{error}}
**Reproduction:** {{reproduction_steps}}

## Available Information
{{paste_logs_stack_traces_screenshots}}

---

## Your Task

Follow this systematic debugging process:

### PHASE 1: UNDERSTAND (2 minutes)
1. Restate the symptom in your own words
2. What SHOULD happen vs what IS happening?
3. When did it last work correctly?
4. What changed between "working" and "broken"?

### PHASE 2: HYPOTHESIZE (3 minutes)
Generate 5+ hypotheses ranked by likelihood:

| Rank | Hypothesis | Likelihood | Test |
|------|------------|------------|------|
| 1 | ... | High | ... |
| 2 | ... | Medium | ... |

Consider these categories:
- Data issues (bad input, missing data, wrong format)
- State issues (race condition, stale cache, wrong order)
- Configuration issues (env vars, feature flags, settings)
- Integration issues (API changes, timeouts, auth)
- Code bugs (logic errors, null refs, type mismatches)

### PHASE 3: INVESTIGATE (5 minutes)
For each hypothesis:
1. What would prove/disprove it?
2. What's the minimum test needed?
3. Execute tests in order of (likelihood × ease)

### PHASE 4: DIAGNOSE
Based on investigation:
1. What is the ROOT CAUSE (not just the symptom)?
2. Why did this happen?
3. Why wasn't it caught earlier?

### PHASE 5: FIX
1. The minimal fix for immediate resolution
2. The proper fix for long-term stability
3. What tests would catch this in the future?

### PHASE 6: PREVENT
1. What monitoring would detect this earlier?
2. What process changes would prevent this class of bug?
3. What documentation should be updated?

---

**Format your response as a debugging session, showing your reasoning at each step.**
```

---

## Bug Category Playbooks

### Race Conditions

**Symptoms:**
- Works sometimes, fails sometimes
- Works in dev, fails in prod
- Works with small data, fails with large data
- Adding console.log makes it work (timing change)

**Investigation:**
```javascript
// Add timing logs
console.log(`[${Date.now()}] Before operation`);
await operation();
console.log(`[${Date.now()}] After operation`);

// Check for concurrent modifications
console.log('Current state:', JSON.stringify(state));
await operation();
console.log('State after:', JSON.stringify(state));
```

**Common Fixes:**
```typescript
// 1. Use locks/mutexes
const lock = new AsyncLock();
await lock.acquire('key', async () => {
  await criticalSection();
});

// 2. Cancel previous operations
const abortController = new AbortController();
previousController?.abort();
await fetch(url, { signal: abortController.signal });

// 3. Use atomic operations
await prisma.user.update({
  where: { id, version: currentVersion },
  data: { ...updates, version: { increment: 1 } },
});
```

---

### Memory Leaks

**Symptoms:**
- App slows down over time
- Memory usage grows without bound
- OOM crashes after hours/days of uptime

**Investigation:**
```javascript
// Take heap snapshots
const v8 = require('v8');
const fs = require('fs');

setInterval(() => {
  const snapshotPath = `/tmp/heap-${Date.now()}.heapsnapshot`;
  v8.writeHeapSnapshot(snapshotPath);
  console.log(`Heap snapshot: ${snapshotPath}`);
}, 60000);

// Check for common leak patterns
// - Event listeners not cleaned up
// - Closures holding references
// - Growing maps/sets/arrays
// - Uncleared intervals/timeouts
```

**Common Fixes:**
```typescript
// 1. Clean up event listeners
useEffect(() => {
  const handler = () => { ... };
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);

// 2. Use WeakMap/WeakRef for caches
const cache = new WeakMap<object, CachedData>();

// 3. Abort controllers for fetch
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
```

---

### N+1 Query Problems

**Symptoms:**
- Page loads slowly with more data
- Database CPU spikes
- Response time increases linearly with result count

**Investigation:**
```typescript
// Enable query logging
prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`);
  console.log(`Duration: ${e.duration}ms`);
});

// Count queries per request
let queryCount = 0;
prisma.$use(async (params, next) => {
  queryCount++;
  return next(params);
});

app.use((req, res, next) => {
  queryCount = 0;
  res.on('finish', () => {
    console.log(`${req.path}: ${queryCount} queries`);
  });
  next();
});
```

**Fix Pattern:**
```typescript
// BAD: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// GOOD: Single query with includes
const users = await prisma.user.findMany({
  include: { posts: true },
});

// GOOD: Dataloader for GraphQL
const postLoader = new DataLoader(async (userIds) => {
  const posts = await prisma.post.findMany({
    where: { userId: { in: userIds } },
  });
  return userIds.map(id => posts.filter(p => p.userId === id));
});
```

---

### React State Bugs

**Symptoms:**
- UI doesn't update after state change
- Infinite re-renders
- Stale values in callbacks
- State updates batching unexpectedly

**Investigation:**
```typescript
// Log renders
useEffect(() => {
  console.log('Component rendered', { props, state });
});

// Track state changes
const [state, setState] = useState(initial);
console.log('Current state:', state);

// Check for stale closures
useEffect(() => {
  const interval = setInterval(() => {
    console.log('In interval, count is:', count); // Stale?
  }, 1000);
  return () => clearInterval(interval);
}, []); // Missing count in deps?
```

**Fix Patterns:**
```typescript
// 1. Stale closure fix
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const interval = setInterval(() => {
    console.log('Count:', countRef.current); // Always fresh
  }, 1000);
  return () => clearInterval(interval);
}, []);

// 2. Functional updates for derived state
setCount(prev => prev + 1); // Not setCount(count + 1)

// 3. Fix infinite loops
useEffect(() => {
  setData(transform(rawData)); // Creates new object each time!
}, [rawData]); // rawData might be new object

// Fix with useMemo
const stableData = useMemo(() => transform(rawData), [rawData.id]);
```

---

### API Integration Bugs

**Symptoms:**
- Works locally, fails in prod
- Intermittent failures
- Timeout errors
- Authentication suddenly failing

**Investigation:**
```typescript
// Log all HTTP traffic
const axios = require('axios');

axios.interceptors.request.use(req => {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    data: req.data,
  });
  return req;
});

axios.interceptors.response.use(
  res => {
    console.log('Response:', {
      status: res.status,
      headers: res.headers,
      data: res.data,
    });
    return res;
  },
  err => {
    console.log('Error:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
    });
    throw err;
  }
);
```

**Common Issues:**
```typescript
// 1. Missing timeout
const response = await fetch(url, {
  timeout: 5000,
  signal: AbortSignal.timeout(5000),
});

// 2. Missing retry logic
import retry from 'async-retry';

const result = await retry(
  async () => {
    const res = await fetch(url);
    if (res.status >= 500) throw new Error('Server error');
    return res.json();
  },
  { retries: 3, factor: 2, minTimeout: 1000 }
);

// 3. Missing circuit breaker
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(fetchData, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});
```

---

## Real-World Debug Session Example

### Scenario
> "Our checkout is failing for some users. They click 'Place Order' and nothing happens."

### Phase 1: Understand
```
Symptom: Checkout button doesn't work for some users
Expected: Click → Order created → Confirmation page
Actual: Click → Nothing visible happens (button stays clickable)

Last worked: Yesterday
Changes: Deployed feature flag for new payment provider
Affected: ~5% of users, seemingly random
```

### Phase 2: Hypothesize
| Rank | Hypothesis | Likelihood | Test |
|------|------------|------------|------|
| 1 | Feature flag routing some users to broken code path | High | Check user's flag state |
| 2 | Payment provider returning error, not handled | Medium | Check payment logs |
| 3 | JavaScript error preventing form submission | Medium | Check browser console |
| 4 | Button click handler has race condition | Low | Check for double-clicks |
| 5 | User has ad blocker blocking payment SDK | Low | Test with ad blocker |

### Phase 3: Investigate
```
Test 1: Feature flag state
→ Affected users have `newPaymentFlow: true`
→ Working users have `newPaymentFlow: false`
✓ CONFIRMED: Issue with new payment flow code

Test 2: New payment flow code path
→ Found: catch block swallows error silently
→ Payment SDK throws when user's card has 3DS requirement
```

### Phase 4: Diagnose
```
ROOT CAUSE: New payment flow doesn't handle 3D Secure redirects

WHY: The new payment SDK requires calling `handleNextAction()` 
     for 3DS, but our code assumed all payments complete immediately.
     
WHY NOT CAUGHT: Test cards don't trigger 3DS, only real cards do.
```

### Phase 5: Fix
```typescript
// Immediate fix: Display error
try {
  const result = await stripe.confirmPayment(...);
  if (result.error) {
    setError(result.error.message);
    return;
  }
  // Check if additional action needed
  if (result.paymentIntent.status === 'requires_action') {
    const { error } = await stripe.handleNextAction(...);
    if (error) {
      setError(error.message);
      return;
    }
  }
  // Success
  router.push('/confirmation');
} catch (err) {
  // Log for debugging
  console.error('Payment error:', err);
  setError('Payment failed. Please try again.');
}
```

### Phase 6: Prevent
```
1. Add monitoring: Alert when payment completion rate drops >2%
2. Add test: Include 3DS test card in integration tests
3. Update docs: Document 3DS handling requirement
4. Process: Require testing with real cards before payment changes
```

---

## Environment-Specific Tips

### Next.js / React
- Use React DevTools Profiler for render issues
- Check for hydration mismatches (server vs client)
- Look for missing Suspense boundaries

### Node.js / Express
- Use `DEBUG=*` environment variable
- Check for unhandled promise rejections
- Monitor event loop lag

### Database (PostgreSQL/MySQL)
- Use `EXPLAIN ANALYZE` for slow queries
- Check for missing indexes
- Look for lock contention

### Docker / Kubernetes
- Check resource limits (memory, CPU)
- Verify environment variables are set
- Check network policies and service discovery

---

## Pairs Well With

- [[ultrathink]] - Add before debugger prompt for deeper analysis
- [[step-by-step]] - Force explicit reasoning at each step
- [[critique]] - After finding fix, critique your own solution
