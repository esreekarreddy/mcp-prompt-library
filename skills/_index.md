# Skills Index

> Claude Skills that define AI behavior for specific tasks

## What Are Skills?

Skills are instruction sets that modify Claude's behavior for specific tasks. They're activated by context or explicit invocation.

## Available Skills

| Skill | Purpose | Activation |
|-------|---------|------------|
| [code-review.md](code-review.md) | Thorough code review | When reviewing PRs or code changes |
| [debugging.md](debugging.md) | Systematic bug hunting | When debugging issues |
| [refactoring.md](refactoring.md) | Safe code refactoring | When restructuring code |
| [documentation.md](documentation.md) | Writing docs | When creating/updating documentation |
| [testing.md](testing.md) | Test writing | When creating tests |
| [project-setup.md](project-setup.md) | New project scaffolding | When setting up new projects |
| [pr-description.md](pr-description.md) | PR descriptions | When creating pull requests |

## How to Use

### Option 1: Global (all projects)
```bash
# Copy to global Claude config
cp skills/code-review.md ~/.claude/skills/
```

### Option 2: Project-specific
```bash
# Copy to project's .claude folder
cp skills/code-review.md /path/to/project/.claude/skills/
```

### Option 3: Reference in CLAUDE.md
```markdown
# CLAUDE.md

## Code Review
When reviewing code, follow the guidelines in:
~/.../ai-library/skills/code-review.md
```

## Creating Custom Skills

```markdown
# Skill Name

## When to Activate
- Trigger conditions

## Behavior
- How the AI should behave

## Output Format
- Expected response structure

## Examples
- Good examples of the skill in action
```
