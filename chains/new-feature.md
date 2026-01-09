# Chain: New Feature Development

> Complete workflow from idea to deployed feature

## Overview

```
PRD → Architecture → Plan → Implement → Test → Deploy
```

## Prerequisites

- Clear understanding of the feature request
- Access to codebase
- Ability to deploy

---

## Step 1: Generate PRD

**Prompt:**
```
I want to build [your idea].

Before writing any code, create a PRD with:

1. Problem Statement: What problem does this solve? Who has it?
2. User Stories: 5-7 stories in "As a [user], I want [action] so that [benefit]" format
3. Core Features (MVP only): What's essential for v1? Be ruthless.
4. Out of Scope: What waits for v2?
5. Tech Requirements: Stack, integrations, data models, auth needs
6. Success Metrics: How do we know it works?
7. Open Questions: What needs deciding before we build?

Be specific, not generic.
```

**Expected Output:**
- Structured PRD document
- Clear scope boundaries
- Identified unknowns

**Decision Point:** Review PRD. Approve or refine before proceeding.

---

## Step 2: Analyze Architecture

**Prompt:**
```
Based on this PRD and the current codebase, analyze:

1. What existing code does this feature touch?
2. What new components/files are needed?
3. What's the data model?
4. What's the API surface?
5. Any architectural patterns we should follow?
6. Potential risks or challenges?

Read the codebase first. Don't assume.
```

**Expected Output:**
- List of affected files
- New components needed
- Data model design
- API endpoints
- Risk assessment

**Decision Point:** Validate architecture approach before planning.

---

## Step 3: Create Implementation Plan

**Prompt:**
```
Create a detailed implementation plan for this feature.

Break into phases:
1. Data layer (migrations, models)
2. Backend (services, API)
3. Frontend (components, state)
4. Integration (wiring, testing)

For each task:
- What specifically needs to be done
- Which files to create/modify
- Complexity (simple/medium/complex)
- Dependencies on other tasks

DO NOT write code yet. I need to approve the plan.
```

**Expected Output:**
- Ordered task list
- File-level specificity
- Complexity estimates
- Dependency graph

**Decision Point:** Approve plan or adjust scope.

---

## Step 4: Implement (Iterative)

For each task in the plan:

**Prompt:**
```
Implement [specific task] from the plan.

Context:
- PRD: [summary]
- Architecture decisions: [key decisions]
- Related files: [list]

Follow the project's coding standards.
Write tests alongside the implementation.
```

**Expected Output:**
- Working code
- Tests
- Updated files

**Repeat** for each task in the plan.

---

## Step 5: Integration & Testing

**Prompt:**
```
The feature is implemented. Now:

1. Verify all components work together
2. Test the critical user paths:
   - [path 1]
   - [path 2]
3. Check edge cases:
   - [edge case 1]
   - [edge case 2]
4. Verify error handling
5. Run the full test suite

Report any issues found.
```

**Expected Output:**
- Integration verification
- Test results
- Any bugs to fix

---

## Step 6: Pre-Launch Review

**Prompt:**
```
Before deploying this feature, review:

1. Security: Any vulnerabilities introduced?
2. Performance: Any concerns?
3. Error handling: Graceful failures?
4. Logging: Sufficient for debugging?
5. Feature flags: Is it behind a flag?
6. Rollback: Can we easily revert?

Flag any issues.
```

**Expected Output:**
- Security review
- Performance notes
- Deployment readiness

---

## Step 7: Deploy & Monitor

**Prompt:**
```
Deploy this feature:

1. What's the deployment process?
2. What should we monitor after deployment?
3. What would trigger a rollback?
4. How do we verify success?
```

**Expected Output:**
- Deployment steps
- Monitoring plan
- Success criteria

---

## Chain Summary

| Step | Focus | Output |
|------|-------|--------|
| 1 | PRD | Requirements document |
| 2 | Architecture | Technical design |
| 3 | Plan | Task breakdown |
| 4 | Implement | Working code |
| 5 | Test | Verified feature |
| 6 | Review | Deployment readiness |
| 7 | Deploy | Live feature |

## Tips

- Don't skip decision points
- It's okay to go back and revise
- Keep scope tight
- Document as you go
