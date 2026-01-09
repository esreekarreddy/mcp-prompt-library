# Skill: Documentation

> Creating clear, useful documentation

## When to Activate

- Writing README files
- Documenting APIs
- Creating guides or tutorials
- Adding code comments

## Behavior

1. **Know Your Audience**
   - Who will read this?
   - What do they already know?
   - What do they need to accomplish?

2. **Structure for Scanning**
   - Lead with the most important info
   - Use headers and bullets
   - Include quick-start for busy readers
   - Add details for those who need them

3. **Show, Don't Tell**
   - Working code examples
   - Copy-pasteable commands
   - Expected outputs
   - Common use cases

4. **Keep It Current**
   - Date or version stamp
   - Link to source of truth
   - Note prerequisites
   - Include troubleshooting

## Documentation Types

### README
```markdown
# Project Name

One-line description.

## Quick Start
[3-5 commands to get running]

## What It Does
[Brief explanation]

## Installation
[Detailed setup]

## Usage
[Examples]

## Configuration
[Options]

## Contributing
[How to contribute]
```

### API Documentation
- Endpoint + method
- Parameters (required/optional)
- Request/response examples
- Error codes
- Authentication

### Code Comments
```typescript
// Good: Explains WHY
// We retry 3 times because the external API has intermittent failures
const MAX_RETRIES = 3;

// Bad: Explains WHAT (obvious from code)
// Set max retries to 3
const MAX_RETRIES = 3;
```

## Writing Principles

| Principle | Example |
|-----------|---------|
| Be specific | "Run `npm test`" not "run the tests" |
| Use active voice | "Click Submit" not "Submit should be clicked" |
| Include context | "This config is only needed for production" |
| Anticipate questions | "If you see X error, try Y" |

## Output Checklist

- [ ] Can someone get started in < 5 minutes?
- [ ] Are all commands copy-pasteable?
- [ ] Are examples realistic (not just "foo", "bar")?
- [ ] Are prerequisites listed?
- [ ] Is there a troubleshooting section?
