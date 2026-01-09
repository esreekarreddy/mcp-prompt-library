# Implementation Plan

> Create a detailed plan before writing any code

## Variables
- `[PRD or feature]` - The PRD document or feature description

## Prompt

```
I need to implement this [PRD or feature].

Before writing code, create an implementation plan:

Phase 1 - Analysis:
- What existing code does this touch?
- What new files needed?
- Dependencies between tasks?

Phase 2 - Data:
- Schema changes
- New endpoints
- Validation rules

Phase 3 - Backend:
- Business logic
- Error handling
- Edge cases

Phase 4 - Frontend:
- Components needed
- State management
- User feedback

Phase 5 - Integration:
- How pieces connect
- Testing approach
- Rollback plan

For each phase: complexity (simple/medium/complex) and specific files.

DO NOT write code. I need to approve this first.
```

## Usage Tips

- Use **after PRD is approved**, before coding
- The "DO NOT write code" instruction is crucial - forces planning
- Review the plan for missing edge cases
- Estimate time based on complexity ratings
- Save the plan for reference during implementation

## Pairs Well With

- [prd-generator.md](prd-generator.md) - Generate PRD first
- [scope-killer.md](scope-killer.md) - Cut scope if plan is too complex
- `snippets/constraints/no-code-yet.md` - Reinforce no-code constraint

## Expected Output

```markdown
# Implementation Plan: [Feature Name]

## Phase 1: Analysis
**Complexity: [Simple/Medium/Complex]**

### Existing Code Touched
- `src/api/routes.ts` - Add new endpoint
- `src/models/user.ts` - Extend user model

### New Files Needed
- `src/api/feature/controller.ts`
- `src/api/feature/service.ts`

### Dependencies
- Task 2 depends on Task 1 (schema first)

---

## Phase 2: Data
**Complexity: [Simple/Medium/Complex]**

### Schema Changes
- Add `feature_enabled` to users table
- Create `feature_logs` table

### New Endpoints
- POST /api/feature/create
- GET /api/feature/:id

### Validation Rules
- Field X: required, string, max 100 chars
- Field Y: optional, enum [a, b, c]

---

[Continue for each phase...]
```
