# Debugger

> Break out of debugging loops with systematic analysis

## Variables
- `[describe it]` - Description of the bug and what you've observed

## Prompt

```
I'm stuck in a debugging loop. The bug: [describe it]

You already tried many things that didn't work; analyze what didn't help first. Before suggesting fixes:

1. List 5-7 different new possible causes. Consider:
   - Data issue, not code?
   - Environment/config?
   - Race condition/timing?
   - Caching?
   - Bug is somewhere else entirely?

2. Rank by likelihood

3. For top 2: add diagnostic logs to prove/disprove each. Don't fix yet.

4. Only after we confirm the cause do we fix.
```

## Usage Tips

- Use when you've been **stuck for 15+ minutes**
- Include what you've already tried in the description
- The "don't fix yet" instruction prevents premature solutions
- Diagnostic logs > guessing at fixes
- Often the bug is NOT where you think it is

## Pairs Well With

- `snippets/modifiers/ultrathink.md` - For complex bugs
- `snippets/modifiers/step-by-step.md` - Methodical approach
- [tech-debt-audit.md](../development/tech-debt-audit.md) - If bug reveals deeper issues

## Bug Description Template

```
The bug: [what's happening]

Expected: [what should happen]

Actual: [what actually happens]

Reproduction steps:
1. ...
2. ...
3. ...

Already tried:
- [thing 1] - didn't work because [why]
- [thing 2] - didn't work because [why]

Environment:
- [dev/staging/prod]
- [browser/OS if relevant]
- [recent changes if any]
```

## Common Bug Categories

| Category | Symptoms | Check |
|----------|----------|-------|
| **Data** | Works sometimes | Inspect actual data values |
| **Timing** | Intermittent | Add timestamps to logs |
| **Cache** | Old data showing | Clear all caches, hard refresh |
| **Config** | Works locally | Compare env vars |
| **State** | UI out of sync | Log state changes |
| **Network** | Timeouts, failures | Check network tab |
