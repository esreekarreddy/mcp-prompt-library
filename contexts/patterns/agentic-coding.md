---
title: Agentic Coding Patterns
description: How to work effectively with AI coding agents - patterns that maximize productivity
tags: [agentic, ai-coding, patterns, productivity, claude-code, cursor]
aliases: [ai-pair-programming, agent-patterns, claude-code-patterns]
version: 1.0.0
---

# Agentic Coding Patterns

> How to work with AI coding agents (Claude, Cursor, Copilot, Windsurf) at 10x productivity. These patterns are from engineers who've shipped production code with AI assistance.

## The Mental Model Shift

**Old model:** AI as autocomplete (completes your sentences)
**New model:** AI as junior engineer (completes your tasks)

The difference:
- Autocomplete: You type, AI suggests next few tokens
- Agentic: You describe intent, AI plans and executes multiple steps

---

## Core Patterns

### Pattern 1: The Specificity Ladder

More specific = better results. Climb the ladder:

```
Level 0 (Vague):
"Fix the bug"

Level 1 (Symptom):
"Fix the bug where users can't log in"

Level 2 (Context):
"Fix the login bug. Users click login, see spinner forever. 
Started after yesterday's deploy. Auth service returns 500."

Level 3 (Full Context - Best):
"Fix the login bug:
- Symptom: Infinite spinner on login
- Environment: Production only, not staging
- Timeline: Started after deploy abc123 yesterday
- Logs: Auth service returns 500 with 'token validation failed'
- Suspicion: We updated the JWT library in that deploy
- Constraint: Can't roll back, other critical fixes in that deploy
- Files likely involved: lib/auth/jwt.ts, services/auth.ts"
```

**Rule:** Spend 2 minutes writing a specific prompt. Save 20 minutes of back-and-forth.

---

### Pattern 2: Task Decomposition

Break large tasks before asking AI to help.

```markdown
## BAD: One giant request
"Build a user dashboard with charts, tables, filters, export, 
and real-time updates"

## GOOD: Decomposed tasks
Task 1: "Create the dashboard layout with placeholder components"
Task 2: "Implement the UserStatsCard component with these metrics: [list]"
Task 3: "Add the activity chart using Recharts, data structure is: [schema]"
Task 4: "Add the data table with sorting and filtering"
Task 5: "Connect to real-time WebSocket for live updates"
Task 6: "Add CSV export functionality"
```

**Why:** AI handles 1 focused task well. 6 tasks at once = confused output.

---

### Pattern 3: The Anchor Pattern

Give AI an "anchor" - an existing example to match.

```markdown
## Without anchor (AI will guess your style):
"Create a UserProfile component"

## With anchor (AI matches your patterns):
"Create a UserProfile component following the same patterns as 
components/ProductCard.tsx - same styling approach, same error 
handling, same data fetching pattern"
```

**Pro tip:** Maintain a few "gold standard" files as anchors:
- One component that shows your React patterns
- One API route that shows your error handling
- One service that shows your business logic patterns

---

### Pattern 4: The Constraint Declaration

Tell AI what NOT to do, not just what to do.

```markdown
## Without constraints (AI might add unwanted deps):
"Add form validation to the signup form"

## With constraints:
"Add form validation to the signup form.
Constraints:
- Use react-hook-form (already in project)
- Do NOT add new dependencies
- Follow the existing validation pattern in LoginForm.tsx
- No inline styles - use the existing Tailwind classes
- Error messages must be accessible (aria-invalid, etc)"
```

**Common constraints to specify:**
- Don't add dependencies
- Don't modify other files
- Don't change existing function signatures
- Match existing code style
- Keep backward compatible

---

### Pattern 5: Test-First Prompting

Ask for tests before implementation for better code.

```markdown
## Standard approach:
"Implement a retry mechanism for API calls"

## Test-first approach:
"I need to implement a retry mechanism for API calls. 
First, write the tests that should pass. The retry should:
- Retry up to 3 times
- Use exponential backoff (1s, 2s, 4s)
- Only retry on 5xx errors or network failures
- Return the successful response or throw after all retries fail

Write the tests first. Then I'll ask for implementation."
```

**Why:** Tests clarify requirements. AI writes better code when tests exist.

---

### Pattern 6: The Review Loop

Ask AI to review its own work.

```markdown
Step 1: "Implement feature X"
[AI implements]

Step 2: "Now review what you just wrote:
- Any edge cases not handled?
- Any security concerns?
- Any performance issues?
- Does it match our coding standards?"

Step 3: "Good catches. Now fix those issues."
```

**Pro tip:** You can also use the critique modifier:
```
Now put on your critic hat and find everything wrong with this.
```

---

### Pattern 7: Incremental Verification

Verify after each step, not after everything.

```markdown
## BAD: Ask for everything, get lost in bugs
"Build the entire checkout flow"
[AI writes 500 lines]
[Something's broken but where?]

## GOOD: Verify incrementally
"Step 1: Create the cart summary component with mock data"
[Verify it works]
"Step 2: Add the payment form with Stripe Elements"
[Verify it works]
"Step 3: Connect to the checkout API"
[Verify it works]
"Step 4: Add error handling and loading states"
[Verify it works]
```

---

### Pattern 8: Context Windows

Manage what AI can "see" for better results.

```markdown
## Small context = faster, focused responses
/relevant-file.ts  ← Just include what's needed
"Fix the validation in this file"

## Large context = better understanding but slower
/src/...           ← Include whole directory
"Understand this codebase structure and suggest improvements"
```

**When to expand context:**
- Understanding how systems connect
- Refactoring across files
- Adding features that touch multiple areas

**When to minimize context:**
- Bug fixes in single file
- Adding tests to existing code
- Small feature additions

---

## Common Mistakes

### Mistake 1: Not Verifying Imports

AI often imports from wrong paths or non-existent modules.

```typescript
// AI might generate:
import { Button } from '@/components/Button';  // Wrong path
import { useAsync } from 'react-use';          // Not installed

// Always verify:
// 1. The import path exists
// 2. The dependency is installed
// 3. The export name matches
```

### Mistake 2: Blindly Accepting Type Assertions

AI uses `as any` and `as unknown as X` to make TypeScript happy.

```typescript
// AI might do this to silence errors:
const data = response.data as any;
const user = JSON.parse(input) as unknown as User;

// Question these. They hide real type issues.
```

### Mistake 3: Not Checking for Hallucinated APIs

AI invents plausible-sounding APIs that don't exist.

```typescript
// AI might suggest:
await prisma.user.findManyWithRelations();  // Not a real method
useServerAction('createUser');               // Not a real hook

// Always verify against docs or your codebase
```

### Mistake 4: Over-trusting "It Works"

Just because code runs doesn't mean it's correct.

```typescript
// This "works" but has a bug:
const average = items.reduce((sum, i) => sum + i, 0) / items.length;
// Crashes on empty array (0/0 = NaN)

// Always think about edge cases AI might miss
```

---

## Session Management

### Starting a Session

```markdown
"I'm working on [project name]. Here's the context:
- Stack: Next.js 14, TypeScript, Prisma, PostgreSQL
- Current task: [specific task]
- Relevant files: [list key files]
- Constraints: [any limitations]

Let's start by [first step]."
```

### Resuming a Session

```markdown
"Continuing from earlier:
- We were working on [feature]
- We completed: [what's done]
- We got stuck on: [blocker]
- Next step should be: [what to do]"
```

### Ending a Session

```markdown
"Before we wrap up:
1. Summarize what we changed
2. List any TODOs we deferred
3. Note any known issues
4. What should we tackle next time?"
```

---

## Tools-Specific Tips

### Claude / Claude Code
- CLAUDE.md file at project root gives persistent context
- Use Artifacts for code that needs to be downloaded
- Ultrathink triggers deeper analysis

### Cursor
- .cursorrules file configures behavior
- @ mentions include specific files
- Composer mode for multi-file changes

### GitHub Copilot
- Comments guide completions
- # type comments for documentation
- Tab to accept, Esc to reject

---

## Productivity Multipliers

### 1. CLAUDE.md / .cursorrules
Set up your AI coding context ONCE:
```markdown
# Project: MyApp
Stack: Next.js 14, TypeScript strict, Tailwind, Prisma
Testing: Vitest + Playwright
Patterns: See components/Button.tsx for component style
Never: Use 'any', Add deps without asking, Modify auth code
```

### 2. Prompt Templates
Save prompts you use often:
```markdown
## Bug Fix Template
Bug: [symptom]
Expected: [what should happen]
Actual: [what happens]
Logs: [relevant logs]
Suspects: [files likely involved]
```

### 3. Golden Examples
Maintain reference implementations AI should match:
- `components/_Example.tsx` - Component patterns
- `services/_Example.ts` - Service patterns
- `tests/_example.test.ts` - Test patterns

---

## See Also

- [[ultrathink]] - Trigger deep analysis
- [[megathink]] - For critical architecture decisions
- [[typescript-react]] - Standards to reference
- [[deep-debugger]] - Systematic debugging with AI
