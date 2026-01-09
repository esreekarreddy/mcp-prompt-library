# Workflow: Feature Development

> End-to-end process for building new features

## Overview

```
Understand → Plan → Implement → Review → Deploy → Monitor
```

## Phase 1: Understand (Before Coding)

### Gather Requirements
- What problem are we solving?
- Who are the users?
- What are the acceptance criteria?
- What's out of scope?

### Ask Clarifying Questions
- Edge cases?
- Error scenarios?
- Performance requirements?
- Dependencies on other work?

### Document Understanding
```markdown
## Feature: [Name]

### Problem
[What problem this solves]

### Users
[Who will use this]

### Acceptance Criteria
- [ ] User can [action 1]
- [ ] User can [action 2]
- [ ] System should [behavior]

### Out of Scope
- [Thing 1]
- [Thing 2]

### Open Questions
- [Question 1]
```

## Phase 2: Plan

### Technical Design
- What components are affected?
- What new components needed?
- Database changes?
- API changes?
- Dependencies?

### Break Down Work
```markdown
## Tasks

### Backend
- [ ] Add database migration
- [ ] Create API endpoint
- [ ] Add service layer logic
- [ ] Write tests

### Frontend
- [ ] Create component
- [ ] Add state management
- [ ] Connect to API
- [ ] Add loading/error states
- [ ] Write tests

### Infrastructure
- [ ] Add feature flag
- [ ] Update monitoring
```

### Estimate
- Simple: < 1 day
- Medium: 1-3 days
- Complex: 3-5 days
- Epic: > 5 days (break it down more)

## Phase 3: Implement

### Development Flow
```
1. Create feature branch
2. Write failing tests (TDD)
3. Implement feature
4. Make tests pass
5. Refactor
6. Self-review
7. Create PR
```

### Branch Naming
```bash
feature/user-authentication
fix/login-redirect-issue
refactor/extract-validation
```

### Commit Messages
```bash
feat: add user registration endpoint
fix: resolve password validation bug
docs: update API documentation
test: add registration tests
refactor: extract email validation
```

### During Development
- [ ] Follow coding standards
- [ ] Write tests as you go
- [ ] Handle error cases
- [ ] Add logging
- [ ] Update documentation
- [ ] Keep commits focused

## Phase 4: Review

### Self-Review Checklist
- [ ] Code compiles/builds
- [ ] Tests pass
- [ ] No console.logs or debug code
- [ ] Error handling complete
- [ ] Edge cases covered
- [ ] Documentation updated
- [ ] No secrets committed

### Create Pull Request
```markdown
## Summary
[What this PR does]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [How to test]

## Screenshots
[If UI changes]
```

### Address Feedback
- Respond to all comments
- Push fixes
- Re-request review

## Phase 5: Deploy

### Pre-Deployment
- [ ] PR approved
- [ ] Tests passing in CI
- [ ] Feature flag configured
- [ ] Rollback plan ready

### Deployment Process
```bash
# Merge to main
git checkout main
git pull
git merge feature/my-feature

# Deploy
npm run deploy

# Verify
curl https://api.example.com/health
```

### Post-Deployment
- [ ] Verify in staging
- [ ] Smoke test in production
- [ ] Monitor error rates
- [ ] Monitor performance

## Phase 6: Monitor

### Watch For
- Error rates
- Latency changes
- User feedback
- Unexpected behavior

### If Issues Arise
- Toggle feature flag OFF
- Or rollback deployment
- Investigate and fix

## Quick Reference

### Development Commands
```bash
# Create branch
git checkout -b feature/my-feature

# During development
npm run dev
npm test -- --watch

# Before PR
npm run lint
npm run test
npm run build

# Create PR
gh pr create --title "Add feature" --body "Description"
```

### Feature Flag Pattern
```typescript
if (featureFlags.isEnabled('new-feature')) {
  // New code path
} else {
  // Existing code path
}
```
