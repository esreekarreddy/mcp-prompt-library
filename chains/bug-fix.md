# Chain: Bug Fix

> Systematic workflow from bug report to verified fix

## Overview

```
Understand → Reproduce → Diagnose → Fix → Verify → Deploy
```

---

## Step 1: Understand the Bug

**Prompt:**
```
I have a bug report:

[Paste bug report or describe the issue]

Help me understand:
1. What is the expected behavior?
2. What is the actual behavior?
3. Who is affected?
4. How severe is this?
5. When did it start (if known)?
6. Any recent changes that might be related?

Don't start fixing yet. Just understand.
```

**Expected Output:**
- Clear problem statement
- Severity assessment
- Initial hypotheses

---

## Step 2: Reproduce the Bug

**Prompt:**
```
Based on the bug report, help me create reliable reproduction steps:

1. What exact steps reproduce this?
2. What environment is needed?
3. Is it deterministic or intermittent?
4. What's the minimal reproduction case?

Let's confirm we can reproduce before investigating.
```

**Expected Output:**
- Step-by-step reproduction
- Environment requirements
- Reproduction rate

**Decision Point:** Can we reproduce? If not, gather more info.

---

## Step 3: Diagnose Root Cause

**Prompt:**
```
The bug reproduces. Now diagnose:

I'm stuck in a debugging loop. The bug: [describe it]

Before suggesting fixes:

1. List 5-7 different possible causes. Consider:
   - Data issue, not code?
   - Environment/config?
   - Race condition/timing?
   - Caching?
   - Bug is somewhere else entirely?

2. Rank by likelihood

3. For top 2: what diagnostic code/logs would prove or disprove each?

Don't fix yet. Confirm the cause first.

Ultrathink.
```

**Expected Output:**
- Ranked hypotheses
- Diagnostic approach
- Evidence needed

---

## Step 4: Confirm Root Cause

**Prompt:**
```
Based on the diagnostics:

[Paste diagnostic output/findings]

1. What do these findings tell us?
2. Is the root cause confirmed?
3. Are there any other factors?
4. Now that we know the cause, what's the fix?
```

**Expected Output:**
- Confirmed root cause
- Understanding of why it happens
- Fix approach

**Decision Point:** Root cause confirmed? If not, add more diagnostics.

---

## Step 5: Implement Fix

**Prompt:**
```
The root cause is: [root cause]

Implement a fix that:
1. Addresses the root cause (not just symptoms)
2. Doesn't introduce regressions
3. Includes a test that would have caught this
4. Follows project coding standards

Show the fix and explain why it works.
```

**Expected Output:**
- Code fix
- Explanation
- Test case

---

## Step 6: Verify Fix

**Prompt:**
```
The fix is implemented. Verify:

1. Does the original reproduction case pass?
2. Do all existing tests still pass?
3. Any edge cases we should test?
4. Could this same bug exist elsewhere?
5. Is there a risk of regression?

Be thorough. We don't want this bug back.
```

**Expected Output:**
- Verification results
- Additional test cases
- Regression assessment

---

## Step 7: Document & Deploy

**Prompt:**
```
Prepare this fix for deployment:

1. PR description explaining:
   - What was the bug
   - What caused it
   - How this fixes it
   
2. Any monitoring we should add?
3. Should we verify in staging first?
4. Any users we should notify?
```

**Expected Output:**
- PR description
- Deployment plan
- Communication if needed

---

## Chain Summary

| Step | Focus | Output |
|------|-------|--------|
| 1 | Understand | Clear problem statement |
| 2 | Reproduce | Reliable repro steps |
| 3 | Diagnose | Hypotheses + diagnostics |
| 4 | Confirm | Verified root cause |
| 5 | Fix | Code + tests |
| 6 | Verify | Confirmation + regression check |
| 7 | Deploy | PR + deployment |

## Bug Report Template

```markdown
**Summary**: [One line description]

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happens]

**Reproduction Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Environment**:
- Browser/OS: [details]
- Version: [app version]
- User account: [if relevant]

**Additional Context**:
- Error messages: [any errors]
- Screenshots: [if helpful]
- When it started: [if known]
```
