# Scope Killer

> Ruthlessly cut scope to ship faster

## Variables
- `[feature]` - The feature you're building

## Prompt

```
I'm building [feature]. Be my ruthless scope guardian.

1. Minimum Viable Version: What's the absolute simplest version that delivers value?

2. NOT Building Yet: Nice-to-haves, edge cases for <5% of users, premature optimizations

3. Definition of Done: What criteria = shipped?

4. Time Traps: What will take 10x longer than expected?

5. The One Thing: If I could only ship ONE capability, what should it be?

Be aggressive. I can always add more later.
```

## Usage Tips

- Use when **scope is creeping** or feature feels too big
- Use after PRD to validate MVP scope
- Be honest - most "must-haves" are actually nice-to-haves
- The "10x longer" question surfaces hidden complexity
- "The One Thing" forces prioritization

## Pairs Well With

- [prd-generator.md](prd-generator.md) - After PRD, kill scope
- [implementation-plan.md](implementation-plan.md) - Plan the reduced scope
- `snippets/modifiers/be-ruthless.md` - Extra aggressive

## Variations

### Feature Creep Check
```
We're building [feature] and scope is growing. 

Current scope:
[list current scope]

For each item, tell me:
- Essential (blocks launch) or Nice-to-have (can wait)?
- If nice-to-have, when should we add it?
- What's the effort vs. impact?

Be ruthless. I need to ship.
```

### Time-Boxed Scope
```
I have [X hours/days] to build [feature].

What's the maximum value I can deliver in that time?
What must I cut to hit that deadline?
What's the simplest possible implementation?
```

## Anti-Patterns to Watch

| Red Flag | Reality |
|----------|---------|
| "It's just a small addition" | Scope creep |
| "Users will expect this" | Assumption, not data |
| "It won't take long" | Famous last words |
| "While we're at it..." | Scope creep alert |
| "For completeness..." | Gold plating |
