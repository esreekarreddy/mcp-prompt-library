# Meta-CoT (Meta Chain of Thought)

> The 2025-2026 evolution of Chain of Thought. The model plans its reasoning strategy before executing it.

## The Core Insight

Traditional CoT: "Think step by step" → Model reasons linearly.

**Meta-CoT**: "Plan how you'll think, then think, then review" → Model reasons about its reasoning.

Research shows this catches more errors and produces more thorough analysis.

## The Snippet

### Standard Meta-CoT
```xml
When solving this problem, use the Meta-CoT framework:

<plan>
First, outline your reasoning strategy. What approach will you take?
What are the key considerations?
</plan>

<reasoning>
Execute your plan step by step. Show your work.
Think freely here—don't force rigid structure.
</reasoning>

<review>
Critique your own reasoning:
- What assumptions did you make?
- What could be wrong?
- What did you miss?
</review>

<answer>
Provide your final answer, incorporating insights from the review.
</answer>
```

### Compact Version
```
Use Meta-CoT:
1. PLAN: How will you approach this?
2. REASON: Execute the plan
3. REVIEW: Critique yourself
4. ANSWER: Final response
```

## Example

**Problem**: "Design a rate limiter for an API"

**Meta-CoT Response**:

```xml
<plan>
I'll approach this by:
1. Clarifying requirements (requests per time window)
2. Evaluating algorithms (Token Bucket vs Sliding Window)
3. Considering distributed scenarios
4. Providing implementation with trade-offs
</plan>

<reasoning>
Token Bucket: Allows bursts, simple to implement, O(1) per request.
Sliding Window Log: More accurate, but O(n) memory per user.
Sliding Window Counter: Good balance, approximate but efficient.

For a distributed system, I need to consider:
- Redis for shared state
- Race conditions with MULTI/EXEC
- Fallback if Redis is unavailable
</reasoning>

<review>
I assumed Redis availability. Should add:
- Local fallback rate limiter
- Circuit breaker for Redis
- What if clocks drift between nodes? → Use Redis time, not local time.
</review>

<answer>
[Final implementation with Redis + local fallback]
</answer>
```

## When to Use

| Scenario | Meta-CoT? | Why |
|----------|-----------|-----|
| Architecture design | ✅ | Catches design flaws early |
| Complex debugging | ✅ | Self-review catches missed causes |
| Security analysis | ✅ | Review phase finds vulnerabilities |
| Simple code | ❌ | Overkill, just answer directly |
| Explanations | Maybe | Helps structure complex explanations |

## Pairs Well With
- `effort-high` - Maximum reasoning depth
- `megathink` - For critical decisions
- `security-audit` - Self-review is crucial for security
