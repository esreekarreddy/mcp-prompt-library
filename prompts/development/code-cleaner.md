# Code Cleaner

> Consolidate duplicate code and remove dead code

## Prompt

```
I have duplicate code that needs consolidation.

1. Find all instances. List them.

2. What's different between each? Do differences matter?

3. Create ONE shared utility that handles all cases. Flexible but not complicated.

4. Migration plan: before/after for each file

5. Risk assessment: What could break?

Do this incrementally. One pattern at a time.

---

Also find and remove dead code.

Look for:
1. Unused exports (exported but never imported)
2. Commented-out code
3. Unreachable code (after returns, impossible conditions)
4. Unused dependencies in package.json
5. Orphan files (not imported anywhere)
6. Old feature flags (always true/false)

For each: what, where, how you confirmed unused, safe to delete?

DON'T delete dynamically imported code. Flag those for manual review.
```

## Usage Tips

- Use after [tech-debt-audit.md](tech-debt-audit.md) identifies duplicates
- Do one pattern at a time - don't refactor everything at once
- Test after each consolidation
- Be careful with dynamic imports (lazy loading, plugins)
- Check git history if unsure about code purpose

## Pairs Well With

- [tech-debt-audit.md](tech-debt-audit.md) - Find issues first
- `snippets/constraints/read-only.md` - Analysis only, no changes
- `snippets/modifiers/step-by-step.md` - Incremental approach

## Duplicate Code Example Output

```markdown
# Duplicate Code Analysis

## Pattern: User Validation

### Instances Found

1. `src/api/auth/register.ts:34-56`
2. `src/api/auth/update-profile.ts:23-45`
3. `src/api/admin/create-user.ts:67-89`

### Differences
| File | Email Check | Phone Check | Admin Fields |
|------|-------------|-------------|--------------|
| register.ts | Yes | Yes | No |
| update-profile.ts | Yes | No | No |
| create-user.ts | Yes | Yes | Yes |

### Proposed Utility

```typescript
// src/utils/validation/user.ts
interface ValidateUserOptions {
  includePhone?: boolean;
  includeAdminFields?: boolean;
}

export function validateUser(data: UserInput, options: ValidateUserOptions = {}) {
  // Consolidated validation logic
}
```

### Migration Plan

| File | Before | After |
|------|--------|-------|
| register.ts | 22 lines inline | `validateUser(data, { includePhone: true })` |
| update-profile.ts | 22 lines inline | `validateUser(data)` |
| create-user.ts | 22 lines inline | `validateUser(data, { includePhone: true, includeAdminFields: true })` |

### Risk Assessment
- **Low risk**: All validation logic is equivalent
- **Test**: Run existing test suite after migration
```

## Dead Code Example Output

```markdown
# Dead Code Analysis

## Confirmed Unused

| Type | Location | Evidence | Safe to Delete |
|------|----------|----------|----------------|
| Export | `utils/legacy.ts:formatDate` | No imports found | Yes |
| File | `components/OldButton.tsx` | Not imported anywhere | Yes |
| Dependency | `moment` in package.json | No imports found | Yes |

## Manual Review Required

| Type | Location | Reason |
|------|----------|--------|
| Export | `utils/plugins.ts:loadPlugin` | Dynamic import pattern |
| File | `scripts/migrate.ts` | May be run manually |
```
