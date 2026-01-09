# Skill: PR Description

> Writing clear, helpful pull request descriptions

## When to Activate

- Creating a pull request
- Asked to write PR description
- Summarizing code changes

## Behavior

1. **Summarize the Change**
   - What does this PR do?
   - Why is it needed?
   - What's the impact?

2. **Provide Context**
   - Link to issue/ticket
   - Reference related PRs
   - Note any dependencies

3. **Guide Reviewers**
   - Highlight key changes
   - Note areas needing attention
   - Explain non-obvious decisions

4. **Document Testing**
   - What was tested?
   - How to test locally?
   - Any edge cases to verify?

## PR Description Template

```markdown
## Summary

[1-2 sentence description of what this PR does]

## Changes

- [Change 1]
- [Change 2]
- [Change 3]

## Why

[Explain the motivation - link to issue if applicable]

## Testing

- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] Edge cases considered

### How to Test

1. [Step 1]
2. [Step 2]
3. [Expected result]

## Screenshots

[If UI changes, include before/after screenshots]

## Notes for Reviewers

- [Any specific areas to focus on]
- [Known limitations]
- [Follow-up work planned]

## Checklist

- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.logs or debug code
```

## Examples

### Good Summary
```
Add rate limiting to authentication endpoints

Implements rate limiting on /auth/* endpoints to prevent brute force attacks.
Limits: 5 attempts per 15 minutes per IP.
```

### Bad Summary
```
Updates

Fixed stuff and added some features
```

## Commit Message Convention

If using conventional commits:
```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
refactor: extract validation logic
test: add user service tests
chore: update dependencies
```

## Size Guidelines

| PR Size | Lines Changed | Review Time |
|---------|---------------|-------------|
| Small | < 100 | < 30 min |
| Medium | 100-300 | 30-60 min |
| Large | 300-500 | 1-2 hours |
| Too Large | > 500 | Consider splitting |
