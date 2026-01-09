# Snippets Index

> Small, composable pieces to enhance any prompt

## How to Use

Append these snippets to any prompt to modify behavior or output format.

```bash
# Example: Combine debugger with ultrathink
cat prompts/development/debugger.md snippets/modifiers/ultrathink.md | pbcopy
```

## Modifiers

Change how the AI approaches the task.

| Snippet | Effect | When to Use |
|---------|--------|-------------|
| [ultrathink.md](modifiers/ultrathink.md) | Deeper analysis | Complex problems |
| [step-by-step.md](modifiers/step-by-step.md) | Methodical approach | Need visibility |
| [no-code-yet.md](modifiers/no-code-yet.md) | Planning only | Before implementation |
| [be-thorough.md](modifiers/be-thorough.md) | Exhaustive analysis | Can't miss anything |
| [be-ruthless.md](modifiers/be-ruthless.md) | Aggressive cuts | Scope creep |
| [explain-reasoning.md](modifiers/explain-reasoning.md) | Show logic | Learning/verification |

## Output Formats

Specify how you want the response structured.

| Snippet | Output | When to Use |
|---------|--------|-------------|
| [markdown-table.md](output-formats/markdown-table.md) | Tables | Comparisons |
| [json.md](output-formats/json.md) | JSON | Programmatic use |
| [checklist.md](output-formats/checklist.md) | Checklists | Actionable items |
| [numbered-list.md](output-formats/numbered-list.md) | Numbered list | Ordered steps |

## Constraints

Add boundaries and limitations.

| Snippet | Effect | When to Use |
|---------|--------|-------------|
| [mvp-only.md](constraints/mvp-only.md) | Minimal scope | Ship fast |
| [read-only.md](constraints/read-only.md) | No changes | Analysis only |
| [no-external-deps.md](constraints/no-external-deps.md) | No new packages | Keep simple |
| [security-first.md](constraints/security-first.md) | Security priority | Sensitive code |

## Common Combinations

| Task | Snippets |
|------|----------|
| Security audit | `be-thorough` + `ultrathink` + `checklist` |
| Planning | `no-code-yet` + `step-by-step` |
| Scope cutting | `be-ruthless` + `mvp-only` |
| Learning | `explain-reasoning` + `step-by-step` |
| Quick analysis | `read-only` + `markdown-table` |
