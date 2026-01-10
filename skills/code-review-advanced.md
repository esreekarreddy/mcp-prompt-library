---
title: "Skill: Advanced Code Review"
description: Production-grade code review covering security, performance, architecture, and maintainability
tags: [skill, code-review, security, performance, architecture]
aliases: [review-advanced, deep-review, comprehensive-review]
version: 2.0.0
---

# Advanced Code Review Skill

> Go beyond "looks good to me" - this skill transforms you into a reviewer who catches bugs before production, identifies security holes before attackers, and spots performance issues before users complain.

## The Review Framework

### 4 Lenses of Code Review

Every code change should be examined through four lenses, in this order:

```
┌─────────────────────────────────────────────────────────────┐
│                    1. CORRECTNESS                          │
│  Does it work? Does it handle edge cases? Will it break?   │
├─────────────────────────────────────────────────────────────┤
│                    2. SECURITY                              │
│  Can this be exploited? Is data protected? Auth correct?   │
├─────────────────────────────────────────────────────────────┤
│                    3. PERFORMANCE                           │
│  Will it scale? Any O(n²)? N+1 queries? Memory leaks?      │
├─────────────────────────────────────────────────────────────┤
│                    4. MAINTAINABILITY                       │
│  Can others understand it? Test it? Extend it? Debug it?   │
└─────────────────────────────────────────────────────────────┘
```

---

## Lens 1: Correctness

### Checklist
- [ ] Does it actually solve the stated problem?
- [ ] Are all requirements addressed?
- [ ] Are edge cases handled?
- [ ] Are there off-by-one errors?
- [ ] Is error handling comprehensive?
- [ ] Are async operations awaited properly?
- [ ] Are types correct (not just `any`)?

### Red Flags
```typescript
// 🚨 Off-by-one error
for (let i = 0; i <= items.length; i++) // Should be <, not <=

// 🚨 Missing await
async function process() {
  saveToDatabase(data); // Missing await - won't wait for save
  return { success: true };
}

// 🚨 Swallowed errors
try {
  await riskyOperation();
} catch (e) {
  // Silent failure - no logging, no re-throw
}

// 🚨 Falsy confusion
if (!user.age) // Fails for age === 0
if (user.age === undefined || user.age === null) // Correct

// 🚨 Array mutation
const sorted = items.sort(); // Mutates original! Use toSorted()
```

### Questions to Ask
1. "What happens if this input is empty/null/undefined?"
2. "What happens if this is called twice quickly?"
3. "What happens if the network request fails?"
4. "What happens at exactly midnight on Dec 31?"

---

## Lens 2: Security

### The OWASP Top 10 Quick Check

| Vulnerability | What to Look For |
|--------------|------------------|
| Injection | String concatenation in queries, unescaped user input |
| Broken Auth | Missing auth checks, weak session handling |
| Sensitive Data Exposure | Logging PII, returning too much data |
| XXE | XML parsing without disabling external entities |
| Broken Access Control | Missing authorization after authentication |
| Security Misconfiguration | Debug mode in prod, default credentials |
| XSS | Unescaped HTML output, dangerouslySetInnerHTML |
| Insecure Deserialization | JSON.parse of untrusted data, eval() |
| Known Vulnerabilities | Outdated dependencies with CVEs |
| Insufficient Logging | No audit trail, no anomaly detection |

### Security Code Patterns

```typescript
// 🚨 SQL INJECTION
const query = `SELECT * FROM users WHERE id = '${userId}'`;
// ✅ FIX: Use parameterized queries
const user = await prisma.user.findUnique({ where: { id: userId } });

// 🚨 XSS
element.innerHTML = userInput;
// ✅ FIX: Use textContent or sanitize
element.textContent = userInput;
// Or with React, it's automatic unless you use dangerouslySetInnerHTML

// 🚨 PATH TRAVERSAL
const file = fs.readFileSync(`./uploads/${filename}`);
// Attack: filename = "../../etc/passwd"
// ✅ FIX: Validate and sanitize
const safeName = path.basename(filename);
const filePath = path.join(UPLOADS_DIR, safeName);
if (!filePath.startsWith(UPLOADS_DIR)) throw new Error('Invalid path');

// 🚨 MASS ASSIGNMENT
const user = await prisma.user.update({
  where: { id },
  data: req.body, // Attacker can set: { role: 'admin' }
});
// ✅ FIX: Whitelist allowed fields
const { name, email } = req.body;
const user = await prisma.user.update({
  where: { id },
  data: { name, email },
});

// 🚨 TIMING ATTACK on password comparison
if (password === storedPassword) // Short-circuits on first wrong char
// ✅ FIX: Use constant-time comparison
import { timingSafeEqual } from 'crypto';
const match = timingSafeEqual(
  Buffer.from(password),
  Buffer.from(storedPassword)
);

// 🚨 OPEN REDIRECT
res.redirect(req.query.returnUrl);
// Attack: returnUrl = "https://evil.com"
// ✅ FIX: Validate against allowlist
const ALLOWED_HOSTS = ['myapp.com', 'www.myapp.com'];
const url = new URL(req.query.returnUrl, 'https://myapp.com');
if (!ALLOWED_HOSTS.includes(url.host)) {
  return res.redirect('/');
}
res.redirect(url.toString());
```

### Security Review Questions
1. "Where does this data come from? Is it trusted?"
2. "Who can access this endpoint? Should they be able to?"
3. "What happens if an attacker controls this value?"
4. "Is this logged? Should it be? (PII?)"
5. "Are secrets hardcoded anywhere?"

---

## Lens 3: Performance

### Time Complexity Red Flags

```typescript
// 🚨 O(n²) hidden in innocent-looking code
for (const item of items) {
  const match = otherItems.find(o => o.id === item.id); // O(n) inside O(n)
}
// ✅ FIX: Use a Map for O(1) lookup
const otherMap = new Map(otherItems.map(o => [o.id, o]));
for (const item of items) {
  const match = otherMap.get(item.id); // O(1)
}

// 🚨 N+1 database queries
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}
// ✅ FIX: Use includes/joins
const users = await prisma.user.findMany({
  include: { posts: true },
});

// 🚨 Fetching all when you need one
const allUsers = await prisma.user.findMany();
const admin = allUsers.find(u => u.role === 'admin');
// ✅ FIX: Query for what you need
const admin = await prisma.user.findFirst({
  where: { role: 'admin' },
});

// 🚨 Synchronous operations in async context
const data = fs.readFileSync(path); // Blocks event loop!
// ✅ FIX: Use async version
const data = await fs.promises.readFile(path);
```

### Memory Red Flags

```typescript
// 🚨 Unbounded cache
const cache = new Map();
function getCached(key) {
  if (!cache.has(key)) {
    cache.set(key, expensiveOperation(key));
  }
  return cache.get(key);
}
// ✅ FIX: Use LRU cache with max size
import { LRUCache } from 'lru-cache';
const cache = new LRUCache({ max: 500 });

// 🚨 Loading entire file into memory
const content = await fs.readFile('huge-file.csv', 'utf-8');
// ✅ FIX: Stream processing
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: createReadStream('huge-file.csv'),
});

for await (const line of rl) {
  processLine(line);
}

// 🚨 Accumulating in array
const results = [];
for await (const chunk of stream) {
  results.push(process(chunk)); // Memory grows unbounded
}
// ✅ FIX: Process and discard, or stream to destination
for await (const chunk of stream) {
  await writeToDestination(process(chunk));
}
```

### React Performance Red Flags

```tsx
// 🚨 Creating new objects/arrays in render
function Component() {
  return <Child style={{ color: 'red' }} />; // New object every render
}
// ✅ FIX: Hoist or memoize
const style = { color: 'red' };
function Component() {
  return <Child style={style} />;
}

// 🚨 Creating functions in render
function Component() {
  return <Button onClick={() => handleClick(id)} />; // New fn every render
}
// ✅ FIX: useCallback
const handleButtonClick = useCallback(() => handleClick(id), [id]);

// 🚨 Missing keys or using index as key
{items.map((item, index) => <Item key={index} {...item} />)}
// ✅ FIX: Use stable, unique key
{items.map(item => <Item key={item.id} {...item} />)}

// 🚨 Expensive calculation on every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
  return <List items={sorted} />;
}
// ✅ FIX: useMemo
const sorted = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### Performance Review Questions
1. "What's the time complexity? Does it scale?"
2. "How many database queries does this make?"
3. "Is there unnecessary data being fetched?"
4. "Will this work with 10x the data? 100x?"
5. "Are there any synchronous blocking operations?"

---

## Lens 4: Maintainability

### Code Smell Detection

```typescript
// 🚨 GOD FUNCTION - does too many things
async function processOrder(order) {
  validateOrder(order);
  calculateTax(order);
  applyDiscounts(order);
  chargePayment(order);
  updateInventory(order);
  sendConfirmationEmail(order);
  notifyWarehouse(order);
  updateAnalytics(order);
}
// ✅ FIX: Single responsibility
async function processOrder(order) {
  const validatedOrder = await orderValidator.validate(order);
  const pricedOrder = await pricingService.calculate(validatedOrder);
  const payment = await paymentService.charge(pricedOrder);
  await fulfillmentService.initiate(pricedOrder, payment);
  await notificationService.sendConfirmation(pricedOrder);
}

// 🚨 MAGIC NUMBERS/STRINGS
if (user.role === 'admin' && order.total > 1000) {
  applyDiscount(0.1);
}
// ✅ FIX: Named constants
const ROLES = { ADMIN: 'admin', USER: 'user' } as const;
const BULK_ORDER_THRESHOLD = 1000;
const BULK_DISCOUNT_RATE = 0.1;

if (user.role === ROLES.ADMIN && order.total > BULK_ORDER_THRESHOLD) {
  applyDiscount(BULK_DISCOUNT_RATE);
}

// 🚨 DEEP NESTING
if (user) {
  if (user.isActive) {
    if (user.hasPermission('edit')) {
      if (document.isEditable) {
        // Finally do something
      }
    }
  }
}
// ✅ FIX: Early returns
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission('edit')) return;
if (!document.isEditable) return;
// Do something

// 🚨 BOOLEAN PARAMETER
function createUser(name, isAdmin) {
  // ...
}
createUser('John', true); // What does true mean?
// ✅ FIX: Use object parameter
function createUser({ name, role }: { name: string; role: 'admin' | 'user' }) {
  // ...
}
createUser({ name: 'John', role: 'admin' });
```

### Maintainability Review Questions
1. "Can I understand this code in 6 months?"
2. "Can a junior developer understand this?"
3. "How hard would it be to add a new feature here?"
4. "How hard would it be to test this?"
5. "Is there duplicated logic that should be extracted?"

---

## Review Output Format

Use this format for consistent, actionable reviews:

```markdown
## Code Review: [PR Title]

### Summary
[1-2 sentence summary of the change and overall assessment]

### 🔴 Must Fix (Blocking)
Issues that must be addressed before merging:

1. **[Issue Title]** (Line X)
   - **Problem:** [What's wrong]
   - **Impact:** [Why it matters]
   - **Fix:** [Specific suggestion]

### 🟡 Should Fix (Non-blocking)
Issues that should be addressed, but don't block merge:

1. **[Issue Title]** (Line X)
   - [Description and suggestion]

### 🟢 Suggestions (Optional)
Nice-to-haves that would improve the code:

1. **[Suggestion]** (Line X)
   - [Description]

### ✅ What's Good
Acknowledge good patterns and decisions:

- [Good thing 1]
- [Good thing 2]

### Questions
Things I'd like clarification on:

1. [Question 1]
2. [Question 2]
```

---

## Review Efficiency Tips

### For Large PRs (500+ lines)
1. Review commit-by-commit if possible
2. Focus on public APIs first
3. Use "Files changed" to identify high-risk files
4. Ask if PR can be split

### For Unfamiliar Code
1. Start with tests to understand intent
2. Read the PR description carefully
3. Ask questions before assuming bugs
4. Check if patterns match rest of codebase

### Time Boxing
- Aim for 300-500 lines per hour
- Take breaks every 45 minutes
- Don't review for more than 2 hours straight
- Context switch to fresh reviewer for critical code

---

## Pairs Well With

- [[ultrathink]] - Add before review prompt for deeper analysis
- [[security-audit]] - When reviewing auth or data handling code
- [[typescript-react]] - Reference for React/TS best practices
