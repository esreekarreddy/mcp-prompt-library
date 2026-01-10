# Deep Debugger

> A systematic, scientific approach to solving complex bugs. Stops "shotgun debugging" (random guesses) and forces root cause analysis.

## Variables
- `[bug context]` - Description of the bug, reproduction steps, and what you've already tried.

## Prompt

```
Act as a Principal Software Engineer. I am stuck on a complex bug and need a rigorous, scientific approach to solve it.

Bug Context:
[bug context]

<thinking_process>
1.  Analyze the symptoms to understand the "What" and "Where".
2.  Discard "gut feelings" and focus only on proven facts.
3.  Formulate mutually exclusive hypotheses.
4.  Design experiments to prove/disprove each hypothesis (binary search method).
5.  Plan the fix only after the root cause is isolated.
</thinking_process>

Please guide me through this debugging session using the following structure:

# Debugging Session

## 1. Fact-Finding
- **Observations**: List strictly observed behaviors (no assumptions).
- **Constraints**: What do we know is *working*? (Narrowing the search space).
- **The Gap**: Explicit difference between Expected vs Actual.

## 2. Hypothesis Generation
| ID | Hypothesis (Potential Cause) | Probability | Test Method (How to prove/disprove) |
|----|------------------------------|-------------|-------------------------------------|
| H1 | [e.g. Race condition in X]   | High        | [e.g. Add delay to Y]               |
| H2 | [e.g. Bad data from API]     | Medium      | [e.g. Log API response body]        |
| H3 | [e.g. Caching issue]         | Low         | [e.g. Disable cache/incognito]      |

## 3. Investigation Plan (The "Trap")
*Don't fix yet. We need to trap the bug.*
- **Log Points**: Where specifically to add logs? What variables to inspect?
- **Experiments**: What simple change will isolate H1 vs H2?
- **Binary Search**: How can we cut the system in half to find the error boundary?

## 4. Root Cause Analysis (Simulation)
*Assuming we found the cause, explain WHY it happened.*
- **The Trigger**: What exact sequence of events causes the failure?
- **The Flaw**: What logic/assumption was incorrect?

## 5. Proposed Fix
- **Immediate Fix**: The patch.
- **Systemic Fix**: How to prevent this entire class of bugs forever (e.g., "Use strict types", "Add invariant check").
```

## Usage Tips
- **Stop coding.** Read the output first.
- If you can't reproduce it, you can't fix it. Ask for a "Reproduction Script" first if needed.
- Use `console.log` / `print` liberally to validate assumptions.
- "It works on my machine" is a clue (Config? Env vars? Race condition?).

## Pairs Well With
- `snippets/modifiers/step-by-step.md` - For executing the investigation plan.
- `skills/debugging.md` - If you need the AI to *do* the debugging.
