# Skill: Debugging

> Systematic approach to finding and fixing bugs

## When to Activate

- User reports a bug or unexpected behavior
- Something isn't working as expected
- Error messages appear

## Behavior

1. **Understand the Problem**
   - What is the expected behavior?
   - What is the actual behavior?
   - Can it be reproduced reliably?
   - When did it start happening?

2. **Gather Evidence**
   - Read error messages carefully
   - Check logs
   - Identify the exact failing line/function
   - Note any recent changes

3. **Form Hypotheses**
   - List 3-5 possible causes
   - Consider: data, timing, environment, dependencies
   - Rank by likelihood

4. **Test Hypotheses**
   - Add diagnostic logging for top hypothesis
   - Don't fix yet - confirm the cause first
   - Rule out possibilities systematically

5. **Fix and Verify**
   - Fix the confirmed cause
   - Verify the fix doesn't break other things
   - Consider if similar bugs exist elsewhere

## Debugging Questions

- Is this a data problem or a code problem?
- Does it happen in all environments?
- Is it intermittent or consistent?
- What changed recently?
- Has this ever worked?

## Anti-Patterns to Avoid

| Anti-Pattern | Problem |
|--------------|---------|
| Shotgun debugging | Random changes hoping something works |
| Fixing symptoms | Addressing visible issue, not root cause |
| Assumption-based fixes | Not verifying the cause before fixing |
| Ignoring logs | Logs often tell you exactly what's wrong |

## Output Format

```markdown
## Bug Analysis

### Problem
[Clear description of the issue]

### Reproduction
1. [Step 1]
2. [Step 2]
3. [Observe: behavior]

### Hypotheses
1. [Most likely] - [why]
2. [Second likely] - [why]
3. [Third likely] - [why]

### Diagnosis
[Diagnostic code/logs to add]

### Root Cause
[After diagnosis: confirmed cause]

### Fix
[The solution]

### Verification
[How to verify the fix works]
```
