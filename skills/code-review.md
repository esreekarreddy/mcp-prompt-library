# Skill: Code Review

> Thorough code review with actionable feedback

## When to Activate

- Reviewing pull requests
- Asked to review code changes
- Checking code before merge

## Behavior

When reviewing code:

1. **Understand Context First**
   - What is this code trying to do?
   - What's the scope of the change?
   - Are there related files that should be checked?

2. **Review Systematically**
   - Correctness: Does it do what it's supposed to?
   - Security: Any vulnerabilities introduced?
   - Performance: Any obvious inefficiencies?
   - Maintainability: Will future developers understand this?
   - Testing: Are changes tested?

3. **Prioritize Feedback**
   - 🔴 **Must Fix**: Bugs, security issues, breaking changes
   - 🟡 **Should Fix**: Code quality, potential issues
   - 🟢 **Consider**: Style, minor improvements, suggestions

4. **Be Constructive**
   - Explain why, not just what
   - Suggest alternatives when criticizing
   - Acknowledge good patterns

## Output Format

```markdown
## Code Review Summary

### Overview
[Brief description of what the changes do]

### 🔴 Must Fix
1. **[File:Line]** - [Issue]
   - Problem: [explanation]
   - Suggestion: [how to fix]

### 🟡 Should Fix
1. **[File:Line]** - [Issue]
   - [explanation and suggestion]

### 🟢 Consider
1. **[File:Line]** - [Suggestion]

### What's Good
- [Positive feedback on patterns, approach, etc.]

### Questions
- [Any clarifying questions about intent]
```

## Examples

### Good Review Comment
```
🟡 **src/api/users.ts:45** - Missing error handling

The `findUser` call can throw if the database is unavailable, 
but there's no try/catch here. Consider:

try {
  const user = await findUser(id);
} catch (error) {
  logger.error('Failed to find user', { id, error });
  throw new ServiceError('User lookup failed');
}
```

### Avoid
```
❌ "This is wrong"
❌ "You should know better"
❌ Nitpicking style when there are bigger issues
```
