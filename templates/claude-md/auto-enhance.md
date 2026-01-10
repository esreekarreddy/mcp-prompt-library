# AI Library Auto-Enhancement Integration

Add this snippet to your project's `CLAUDE.md` or `.claude/instructions.md` to enable automatic prompt enhancement.

---

## Quick Setup (Copy This)

```markdown
## AI Library Integration

You have access to the AI Library MCP server with powerful prompts, skills, and workflows.

### Automatic Enhancement Protocol

**CRITICAL: For any substantial task, ALWAYS enhance first:**

1. **Before starting work**, call `enhance_prompt` with the user's request
2. **Load recommended prompts** using `get_prompt` for each suggestion
3. **Apply the guidance** to produce higher-quality output

### When to Enhance

ALWAYS call `enhance_prompt` when asked to:
- Build, create, or implement features
- Fix bugs or debug issues  
- Review or refactor code
- Design systems or architecture
- Write documentation or specs

### Enhancement Examples

**User asks:** "Build a user authentication system"
**You do:**
1. `enhance_prompt("Build a user authentication system")` → gets security-review, new-feature chain
2. `get_prompt("security-review")` → load security guidance
3. `run_chain("new-feature")` → follow structured development flow
4. Build with all context applied

**User asks:** "This API is slow, fix it"
**You do:**
1. `enhance_prompt("This API is slow, fix it")` → gets deep-debugger, performance patterns
2. `get_prompt("deep-debugger")` → load systematic debugging methodology
3. Apply the 5-phase debugging process

### Thinking Depth

For complex problems, use thinking modifiers:
- `get_prompt("ultrathink")` - Deep analysis with multiple perspectives
- `get_prompt("megathink")` - Maximum depth for architecture decisions

### Available Tools

- `list_prompts` - Browse all available prompts
- `get_prompt(name)` - Load a specific prompt
- `search_prompts(query)` - Find relevant prompts
- `enhance_prompt(request)` - Auto-detect and suggest prompts
- `run_chain(name)` - Execute multi-step workflows
- `compose_prompt(prompts[])` - Combine multiple prompts
```

---

## Full Integration (Recommended for Teams)

For comprehensive integration, add this expanded version:

```markdown
## AI Library Integration

You have access to the AI Library MCP server - a curated collection of world-class prompts, skills, and workflows developed to Anthropic engineer standards.

### Core Principle

**Never work without context.** The library contains hard-won patterns for:
- Secure, performant code
- Systematic debugging
- Thorough code review
- Production-ready features

### Automatic Enhancement Protocol

**For EVERY substantial task:**

1. **Enhance First**
   - Call `enhance_prompt(user_request)` immediately
   - This detects task type and returns relevant resources
   
2. **Load Resources**
   - Call `get_prompt(name)` for each recommended prompt
   - These contain detailed methodologies and checklists
   
3. **Apply Guidance**
   - Integrate the patterns into your work
   - Follow any checklists or phase structures

4. **Use Chains for Multi-Step Work**
   - `run_chain("new-feature")` for feature development
   - `run_chain("bug-fix")` for debugging
   - `run_chain("code-review")` for thorough reviews

### Task-Specific Protocols

#### Building Features
```
enhance_prompt("build X") → new-feature chain, prd-generator
get_prompt("prd-generator") → create proper requirements
run_chain("new-feature") → follow implementation phases
```

#### Debugging
```
enhance_prompt("fix/debug X") → deep-debugger, systematic approach
get_prompt("deep-debugger") → 5-phase methodology
Apply: Observe → Hypothesize → Test → Fix → Verify
```

#### Code Review
```
enhance_prompt("review X") → code-review-advanced
get_prompt("code-review-advanced") → 4-lens analysis
Check: Correctness → Security → Performance → Maintainability
```

#### Architecture
```
enhance_prompt("design/architect X") → megathink, system-design
get_prompt("megathink") → maximum thinking depth
Apply structured analysis before any code
```

### Thinking Depth Modifiers

Load these for complex reasoning:

| Modifier | When to Use |
|----------|-------------|
| `ultrathink` | Multi-file changes, tricky bugs, design decisions |
| `megathink` | Architecture, security-critical, breaking changes |

### Quality Standards

When the library prompts specify standards, follow them:
- Security checklists must pass before completion
- Performance considerations must be documented
- Edge cases must be explicitly handled
- Error handling must be comprehensive

### Available Tools Reference

| Tool | Purpose |
|------|---------|
| `list_prompts` | Browse all prompts by category |
| `get_prompt(name)` | Load specific prompt content |
| `search_prompts(query)` | Find prompts by keyword |
| `enhance_prompt(request)` | Auto-enhance any request |
| `run_chain(name)` | Execute workflow chains |
| `compose_prompt(names[])` | Combine multiple prompts |
| `get_context(name)` | Load stack/pattern guides |
| `quick_prompt(type, context)` | Generate instant prompts |
```

---

## Minimal Integration (Just the Essentials)

For quick setup, add just this:

```markdown
## AI Library

Use `enhance_prompt(request)` before any substantial task.
Use `get_prompt("ultrathink")` for complex problems.
```

---

## How It Works

### The Enhancement Flow

```
User Request
     ↓
enhance_prompt() ← Detects: building? debugging? reviewing?
     ↓
Returns: Relevant prompts, chains, guidance
     ↓
get_prompt() ← Load each recommended resource
     ↓
Apply patterns to produce better output
```

### Why This Works

1. **No forgotten context** - Enhancement catches what you might miss
2. **Consistent quality** - Same methodology every time
3. **Security by default** - Security prompts auto-loaded for auth, data, APIs
4. **Faster debugging** - Systematic approach beats random trying

---

## Verification

To verify the integration is working:

1. Ask Claude to "build a login form"
2. Claude should automatically call `enhance_prompt`
3. Claude should load security and feature prompts
4. The implementation should follow structured methodology

If Claude doesn't auto-enhance, ensure:
- The MCP server is running
- The CLAUDE.md snippet is in your project
- You're using a supported Claude interface

---

## Customization

### Add Project-Specific Prompts

Extend the library with your patterns:

```markdown
### Project-Specific Enhancement

In addition to AI Library tools, also load:
- Our API design doc at `/docs/api-standards.md`
- Our component patterns at `/docs/component-guide.md`
```

### Enforce Specific Standards

```markdown
### Mandatory Standards

ALWAYS apply these after enhancement:
- Run `get_prompt("security-review")` for any auth/data code
- Use `get_prompt("typescript-react")` for frontend work
- Apply `get_prompt("code-review-advanced")` before completing PRs
```

---

## Troubleshooting

**Claude isn't using enhance_prompt automatically**
- Add explicit instruction: "ALWAYS call enhance_prompt FIRST for any substantial task"
- Check MCP server is connected in Claude Desktop settings

**Prompts aren't loading**
- Run `list_prompts` to verify server connection
- Check server logs for errors

**Enhancement suggestions don't match task**
- The `enhance_prompt` tool uses keyword detection
- For edge cases, manually call `search_prompts(query)`
