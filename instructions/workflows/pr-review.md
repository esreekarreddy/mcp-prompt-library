# Workflow: Pull Request Review

> Systematic approach to reviewing code changes

## Before Reviewing

1. **Understand Context**
   - Read the PR description
   - Check linked issues/tickets
   - Understand the goal

2. **Set Expectations**
   - How long should this take?
   - What's the scope?
   - Any areas to focus on?

## Review Process

### Step 1: High-Level Pass
- Does the approach make sense?
- Is the scope appropriate?
- Any architectural concerns?

### Step 2: Detailed Review
Go file by file:
- **Correctness**: Does it work?
- **Edge cases**: What could break?
- **Security**: Any vulnerabilities?
- **Performance**: Any concerns?
- **Maintainability**: Is it readable?
- **Tests**: Are changes tested?

### Step 3: Run Locally (If Needed)
For complex changes:
```bash
git fetch origin pull/123/head:pr-123
git checkout pr-123
npm install
npm test
npm run dev
# Test the feature manually
```

## Feedback Categories

| Symbol | Category | Meaning |
|--------|----------|---------|
| 🔴 | Blocker | Must fix before merge |
| 🟡 | Important | Should fix, can discuss |
| 🟢 | Suggestion | Nice to have, optional |
| ❓ | Question | Need clarification |
| 💡 | Idea | Consider for future |
| 👍 | Praise | Good work! |

## Writing Good Comments

### Be Specific
```markdown
🟡 **src/utils/format.ts:45**

The date formatting here doesn't handle timezones. If `date` is in UTC 
but user expects local time, this will show wrong date.

Consider:
```typescript
const localDate = new Date(date.toLocaleString('en-US', { timeZone: userTimezone }));
```
```

### Explain Why
```markdown
🔴 This SQL is vulnerable to injection.

The `userId` comes from user input and is concatenated directly.
An attacker could pass: `1; DROP TABLE users; --`

Use parameterized queries instead.
```

### Suggest Solutions
```markdown
🟢 Consider using `const` here since `config` is never reassigned.
This makes the immutability intention clearer.
```

### Acknowledge Good Work
```markdown
👍 Nice use of the repository pattern here. Clean separation of concerns.
```

## Review Checklist

### Code Quality
- [ ] Follows project conventions
- [ ] Variable/function names are clear
- [ ] No code duplication
- [ ] No dead code
- [ ] Comments where helpful (not obvious)

### Correctness
- [ ] Logic is correct
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] No race conditions

### Security
- [ ] Input validated
- [ ] No injection vulnerabilities
- [ ] Auth/authz checked
- [ ] Sensitive data protected

### Performance
- [ ] No obvious bottlenecks
- [ ] Database queries efficient
- [ ] No unnecessary work

### Testing
- [ ] Tests exist for changes
- [ ] Tests are meaningful
- [ ] Edge cases tested

## Review Etiquette

### Do
- Be constructive and respectful
- Explain reasoning
- Offer alternatives
- Acknowledge constraints
- Praise good work
- Respond promptly

### Don't
- Be condescending
- Nitpick style (use linters)
- Block without clear reason
- Ignore context
- Make it personal

## After Review

### If Approving
- Confirm tests pass
- Leave encouraging comment
- Approve and/or merge

### If Requesting Changes
- Prioritize feedback clearly
- Be available for questions
- Re-review promptly when updated
