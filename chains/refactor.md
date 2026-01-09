# Chain: Code Refactoring

> Safe, incremental approach to improving code quality

## Overview

```
Audit → Plan → Prepare → Refactor → Verify → Complete
```

---

## Step 1: Audit Current State

**Prompt:**
```
Audit this codebase for refactoring opportunities:

1. Duplicated code that should be extracted
2. Functions/classes that are too large
3. Poor naming that obscures intent
4. Tight coupling that should be loosened
5. Missing abstractions
6. Outdated patterns

For each: location, issue, impact, and effort to fix.

Sort by impact (highest first).

Read the code thoroughly. Don't assume.
```

**Expected Output:**
- Prioritized list of issues
- Locations and severity
- Effort estimates

**Decision Point:** Which issues to address? Scope the work.

---

## Step 2: Plan the Refactoring

**Prompt:**
```
I want to refactor these issues:

[List selected issues]

Create a step-by-step plan:

1. What order should we tackle these?
2. What are the dependencies between changes?
3. What tests need to exist before we start?
4. What's a safe stopping point?

For each step:
- What specifically changes
- What files are affected
- What could break
- How to verify it works

DO NOT make changes yet. Plan only.
```

**Expected Output:**
- Ordered refactoring steps
- Dependencies identified
- Risk assessment
- Verification approach

---

## Step 3: Prepare for Refactoring

**Prompt:**
```
Before refactoring, ensure we have safety nets:

1. Do tests exist for the code we're changing?
2. If not, what tests should we add first?
3. Is the code behavior well-understood?
4. What's our rollback plan?

Write any missing tests that capture current behavior.
We need these to pass before AND after refactoring.
```

**Expected Output:**
- Test coverage assessment
- New tests if needed
- Baseline behavior documented

**Decision Point:** Sufficient test coverage? If not, add tests first.

---

## Step 4: Execute Refactoring (Iterative)

For each step in the plan:

**Prompt:**
```
Execute refactoring step [N]:

[Description of this step]

Requirements:
1. Make the minimum change needed
2. Keep all tests passing
3. One logical change per commit
4. Don't change behavior, only structure

Show the changes and explain the improvement.
```

**Expected Output:**
- Code changes
- Tests still passing
- Explanation of improvement

**After each step:**
- Run tests
- Commit if green
- If red, fix or revert

---

## Step 5: Verify Refactoring

**Prompt:**
```
Refactoring is complete. Verify:

1. All tests still pass?
2. No behavior changes (unintentional)?
3. Performance not degraded?
4. Code is actually better?
   - More readable?
   - Less duplication?
   - Better organized?

Compare before and after. Quantify the improvement.
```

**Expected Output:**
- Test results
- Before/after comparison
- Metrics if applicable

---

## Step 6: Document & Complete

**Prompt:**
```
Summarize the refactoring:

1. What was improved?
2. What patterns were introduced?
3. Are there any follow-up items?
4. Should documentation be updated?
5. Any lessons for future code?

Create a PR description explaining the changes.
```

**Expected Output:**
- Summary of changes
- PR description
- Any follow-up tasks

---

## Chain Summary

| Step | Focus | Output |
|------|-------|--------|
| 1 | Audit | Issue list |
| 2 | Plan | Ordered steps |
| 3 | Prepare | Tests + baseline |
| 4 | Refactor | Improved code |
| 5 | Verify | Confirmation |
| 6 | Complete | Documentation |

## Refactoring Rules

### Do
- Make small, reversible changes
- Run tests after each change
- Commit at stable points
- Separate refactoring from feature work

### Don't
- Change behavior during refactoring
- Refactor without tests
- Make multiple unrelated changes
- Rush through verification

## Common Refactoring Patterns

| Pattern | When to Use |
|---------|-------------|
| Extract Function | Long function, repeated code |
| Rename | Name doesn't match purpose |
| Move | Code in wrong location |
| Inline | Unnecessary indirection |
| Extract Variable | Complex expression |
| Replace Temp with Query | Temp used multiple times |
| Replace Conditional with Polymorphism | Complex conditionals |
