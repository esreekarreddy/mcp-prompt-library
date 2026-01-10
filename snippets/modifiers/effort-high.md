# Effort High Modifier

> Trigger maximum reasoning effort for complex analysis. Works with Claude 4.5 Opus `effort` parameter and GPT-5/o3 `reasoning_effort`.

## The Snippet

### Universal (Works with all models)
```
EFFORT: HIGH

This task requires maximum reasoning depth. Before responding:
1. Consider this problem from multiple angles
2. Explore edge cases and failure modes
3. Challenge your initial assumptions
4. Only then provide your answer with full reasoning
```

### Claude 4.5 Opus Specific
```
Use effort: "high" for this response.

This is a complex problem that benefits from extended thinking.
Take your time to explore the solution space thoroughly.
```

### GPT-5 / o3 Specific
```
Apply maximum reasoning effort to this problem.

Think step-by-step, consider alternatives, and verify your reasoning
before committing to an answer.
```

## When to Use

| Scenario | Use Effort High? |
|----------|------------------|
| Architecture decisions | ✅ Yes |
| Security reviews | ✅ Yes |
| Complex debugging | ✅ Yes |
| Algorithm design | ✅ Yes |
| Simple CRUD code | ❌ No (overkill) |
| Quick questions | ❌ No (wastes tokens) |

## Model Support

| Model | Parameter | Values |
|-------|-----------|--------|
| Claude 4.5 Opus | `effort` | "low", "medium", "high" |
| GPT-5 / o3 | `reasoning_effort` | "low", "medium", "high" |
| Gemini 3 Pro | System instruction | N/A (always high) |

## Pairs Well With
- `ultrathink` - For deep analysis
- `megathink` - For critical decisions
- `security-audit` - For thorough security review
