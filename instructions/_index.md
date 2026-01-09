# Instructions Index

> Reusable system prompts and behavioral instructions

## Structure

### Personas
Role-based AI behaviors. Use these to make the AI adopt a specific mindset.

| Persona | Use Case |
|---------|----------|
| [senior-engineer.md](personas/senior-engineer.md) | General development with best practices |
| [security-expert.md](personas/security-expert.md) | Security-focused development |
| [code-reviewer.md](personas/code-reviewer.md) | Thorough code review |
| [ux-engineer.md](personas/ux-engineer.md) | User experience focused |
| [devops-engineer.md](personas/devops-engineer.md) | Infrastructure and deployment |

### Standards
Coding standards by language/framework. Include in CLAUDE.md for consistent code style.

| Standard | Stack |
|----------|-------|
| [typescript.md](standards/typescript.md) | TypeScript projects |
| [nextjs.md](standards/nextjs.md) | Next.js applications |
| [react.md](standards/react.md) | React components |
| [python.md](standards/python.md) | Python projects |
| [fastapi.md](standards/fastapi.md) | FastAPI services |
| [nodejs.md](standards/nodejs.md) | Node.js backends |

### Workflows
Process-specific instructions for common development workflows.

| Workflow | When to Use |
|----------|-------------|
| [tdd.md](workflows/tdd.md) | Test-driven development |
| [pr-review.md](workflows/pr-review.md) | Reviewing pull requests |
| [incident-response.md](workflows/incident-response.md) | Production incidents |
| [feature-development.md](workflows/feature-development.md) | Building new features |

## How to Use

### In CLAUDE.md
```markdown
# Project Instructions

## Coding Standards
<!-- Paste contents of standards/typescript.md -->

## When Reviewing Code
<!-- Paste contents of personas/code-reviewer.md -->
```

### Compose Multiple Instructions
```bash
# Combine persona + standards
cat instructions/personas/senior-engineer.md instructions/standards/typescript.md > combined.md
```
