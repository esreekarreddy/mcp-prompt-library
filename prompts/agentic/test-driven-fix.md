# Test-Driven Fix (Agentic)

> A workflow for agents to fix bugs reliably by creating reproduction cases first.

## Variables
- `[bug]` - The description of the bug

## Prompt

```
Act as a QA Engineer + Senior Developer.

Task: Fix `[bug]`.

**Protocol: Red -> Green -> Refactor**

<thinking>
1.  **Analyze**: Why is it failing?
2.  **Hypothesize**: If I write a test case X, it should fail.
</thinking>

Step 1: Create a Reproduction Test Case
-   Create a new test file (e.g., `repro_bug.test.ts`) or add to existing tests.
-   Write a test that *demonstrates* the bug.
-   Run the test. **It MUST fail.** (If it passes, you haven't reproduced the bug).

Step 2: Fix the Code
-   Modify the source code to address the root cause.
-   Run the test again.
-   **It MUST pass.**

Step 3: Cleanup
-   Remove the reproduction test file (or merge it into the main test suite if valuable).
-   Verify no regressions in related tests.

**Do not write the fix until you have seen the test fail.**
```

## Usage Tips
- Best for "Agentic" IDEs where the AI can run terminal commands.
- Prevents "I think I fixed it" hallucinations.
