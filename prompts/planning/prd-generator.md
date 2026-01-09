# PRD Generator

> Generate a comprehensive Product Requirements Document before writing any code

## Variables
- `[your idea]` - Brief description of what you want to build

## Prompt

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

## Usage Tips

- Use at the **very start** of any new feature or product
- Force yourself to fill in all sections before coding
- Share the PRD with stakeholders for alignment
- Revisit when scope starts creeping

## Pairs Well With

- [scope-killer.md](scope-killer.md) - After PRD, ruthlessly cut scope
- [implementation-plan.md](implementation-plan.md) - Turn PRD into actionable plan
- `snippets/modifiers/be-ruthless.md` - For stricter MVP focus

## Example Output Structure

```markdown
# PRD: [Feature Name]

## 1. Problem Statement
[Who has this problem and why it matters]

## 2. User Stories
- As a [user], I want [action] so that [benefit]
- ...

## 3. Core Features (MVP)
- Feature 1
- Feature 2
- Feature 3

## 4. Out of Scope (v2+)
- Nice-to-have 1
- Nice-to-have 2

## 5. Tech Requirements
- Stack: ...
- Integrations: ...
- Data Models: ...
- Auth: ...

## 6. Success Metrics
- Metric 1: [how to measure]
- Metric 2: [how to measure]

## 7. Open Questions
- [ ] Question 1
- [ ] Question 2
```
