# Skill: Refactoring

> Safe, incremental code improvement

## When to Activate

- Code needs restructuring
- Duplicate code should be consolidated
- Performance optimization needed
- Technical debt cleanup

## Behavior

1. **Assess Before Changing**
   - What's the current state?
   - What tests exist?
   - What depends on this code?
   - What's the risk?

2. **Plan the Refactor**
   - Define the target state
   - Break into small, safe steps
   - Identify rollback points
   - Consider feature flags for big changes

3. **Refactor Incrementally**
   - One change at a time
   - Run tests after each change
   - Commit at stable points
   - Don't mix refactoring with features

4. **Verify Behavior Preservation**
   - Same inputs → same outputs
   - Performance not degraded
   - No breaking changes to API

## Refactoring Principles

- **No behavior changes**: Refactoring changes structure, not behavior
- **Small steps**: Each step should be safe to revert
- **Tests first**: Ensure tests exist before refactoring
- **One thing at a time**: Don't rename AND restructure in same commit

## Common Refactoring Patterns

| Pattern | When to Use |
|---------|-------------|
| Extract Function | Repeated code, long functions |
| Extract Component | Repeated UI patterns |
| Rename | Names don't reflect purpose |
| Move | Code in wrong module/file |
| Replace Conditional with Polymorphism | Complex if/switch chains |
| Introduce Parameter Object | Too many parameters |

## Output Format

```markdown
## Refactoring Plan

### Current State
[Description of current code structure]

### Target State
[What we want to achieve]

### Steps
1. [ ] [First safe step]
   - Risk: Low
   - Verify: [how to verify]
2. [ ] [Second step]
   - Risk: [level]
   - Verify: [how to verify]

### Rollback Plan
[How to undo if something goes wrong]

### Testing
[What tests to run at each step]
```

## Safety Checklist

Before refactoring:
- [ ] Tests exist and pass
- [ ] Understand all callers/consumers
- [ ] Have a rollback plan
- [ ] Scope is well-defined

After refactoring:
- [ ] All tests still pass
- [ ] No performance regression
- [ ] Code is cleaner/simpler
- [ ] Documentation updated if needed
