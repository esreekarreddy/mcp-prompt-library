# Architecture Analyzer

> Understand an existing codebase before adding new features

## Variables
- `[feature]` - The feature you want to add (optional, for targeted analysis)

## Prompt

```
Analyze this codebase and give me:

1. Architecture pattern (MVC, Clean, etc.)

2. Data flow: user input → API → database → UI

3. Key files: Where is routing? Models? Auth? Business logic?

4. Critical dependencies and what they do

5. Patterns I need to follow for new features (show examples from the code)

6. Potential issues (security, performance, outdated patterns)

7. If I wanted to add [feature], which files would I touch?

Read entire files first. Don't assume.
```

## Usage Tips

- Use when **joining a new project** or exploring unfamiliar code
- Use **before adding a significant feature** to an existing codebase
- The "read entire files first" instruction prevents hallucination
- Specify the feature for targeted analysis

## Pairs Well With

- [implementation-plan.md](implementation-plan.md) - After understanding, plan the work
- `snippets/modifiers/be-thorough.md` - For deeper analysis
- `snippets/modifiers/ultrathink.md` - For complex codebases

## Variations

### Quick Overview (No Feature)
```
Analyze this codebase and give me:
1. Architecture pattern
2. Key files and their purposes
3. Main dependencies
4. Patterns to follow
```

### Security-Focused Analysis
```
Analyze this codebase focusing on:
1. Authentication flow
2. Authorization checks
3. Data validation
4. Potential security issues
5. Sensitive data handling
```

### Performance-Focused Analysis
```
Analyze this codebase focusing on:
1. Database query patterns
2. Caching strategy
3. API response times
4. Bundle size (frontend)
5. Potential bottlenecks
```
