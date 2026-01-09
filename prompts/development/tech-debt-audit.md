# Tech Debt Audit

> Find and prioritize technical debt in your codebase

## Prompt

```
Audit this codebase for technical debt. Prioritized list I can act on.

Find:

1. Duplicated code that should be extracted

2. Dead code (unused files, functions, exports)

3. Outdated patterns, deprecated APIs

4. Missing error handling

5. Security smells (hardcoded secrets, SQL concat, missing validation)

6. Performance issues (N+1, missing indexes, unnecessary re-renders)

7. Type safety gaps (any types, missing validation)

For each: file/line, what's wrong, risk (low/med/high), suggested fix.

Sort by risk, highest first.
```

## Usage Tips

- Run **periodically** (monthly, quarterly) or before major refactors
- Focus on high-risk items first
- Create tickets for medium-risk items
- Low-risk can wait or be opportunistic fixes
- Don't try to fix everything at once

## Pairs Well With

- [code-cleaner.md](code-cleaner.md) - Fix the issues found
- `snippets/modifiers/be-thorough.md` - Deeper analysis
- `snippets/modifiers/ultrathink.md` - Complex codebases

## Expected Output Format

```markdown
# Tech Debt Audit

## Critical (Fix Now)

### 1. Hardcoded API Key
- **File**: `src/services/payment.ts:45`
- **Issue**: API key hardcoded in source
- **Risk**: HIGH - security vulnerability
- **Fix**: Move to environment variable

### 2. SQL Injection Risk
- **File**: `src/api/users.ts:23`
- **Issue**: String concatenation in SQL query
- **Risk**: HIGH - security vulnerability  
- **Fix**: Use parameterized queries

---

## High Priority

### 3. N+1 Query
- **File**: `src/api/orders.ts:67`
- **Issue**: Loading related items in loop
- **Risk**: MEDIUM - performance degradation
- **Fix**: Use eager loading / join

---

## Medium Priority
[...]

## Low Priority
[...]
```

## Follow-up Actions

1. **Critical**: Fix immediately, don't ship without
2. **High**: Create tickets, fix this sprint
3. **Medium**: Add to backlog, fix opportunistically
4. **Low**: Document, fix when touching that code
