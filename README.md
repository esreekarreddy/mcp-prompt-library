# AI Library

> Your personal goldmine of prompts, skills, and instructions for AI-assisted development.

A centralized reference library with 80+ prompts, skills, templates, and workflows. Includes an **MCP Server** for automatic prompt enhancement in Claude, OpenCode, and Cursor.

---

## Quick Start

### Option 1: MCP Server (Recommended)

The MCP server gives Claude **automatic access** to all prompts and can auto-enhance your requests.

```bash
# 1. Install and build
cd mcp-server
npm install
npm run build

# 2. Add to Claude Desktop (~/Library/Application Support/Claude/claude_desktop_config.json)
{
  "mcpServers": {
    "ai-library": {
      "command": "node",
      "args": ["/path/to/ai-library/mcp-server/dist/index.js"]
    }
  }
}

# 3. Restart Claude Desktop
```

**Enable Auto-Enhancement:** Add this to your project's `CLAUDE.md`:

```markdown
## AI Library Integration

For any substantial task, ALWAYS call `enhance_prompt` first.
Use `get_prompt("ultrathink")` for complex problems.
```

See `templates/claude-md/auto-enhance.md` for the full integration guide.

### Option 2: Manual Copy-Paste

```bash
# Reference this folder from any project
export AI_LIBRARY="$HOME/Desktop/githubProjects/ai-library"

# Copy a prompt to clipboard (macOS)
cat $AI_LIBRARY/prompts/planning/prd-generator.md | pbcopy

# Symlink CLAUDE.md to a project
ln -s $AI_LIBRARY/templates/claude-md/nextjs-app.md ./CLAUDE.md
```

### Option 3: CLI Tool

```bash
cd mcp-server

# List all prompts
node dist/cli.js list

# Search for prompts
node dist/cli.js search "debugging"

# Get a specific prompt
node dist/cli.js get ultrathink

# Library stats
node dist/cli.js stats
```

---

## Structure

| Folder | Purpose | When to Use |
|--------|---------|-------------|
| `prompts/` | Ready-to-paste prompts | Copy directly into chat |
| `skills/` | Claude Skills (behavioral) | Add to `~/.claude/` or project `.claude/` |
| `instructions/` | Reusable system prompts | Combine into CLAUDE.md or custom instructions |
| `templates/` | Project scaffolding | Copy to new projects (CLAUDE.md, .cursorrules) |
| `chains/` | Multi-step workflows | Complex tasks requiring multiple prompts |
| `snippets/` | Composable add-ons | Append to any prompt for modifications |
| `contexts/` | Reference material | Feed to AI for background knowledge |
| `examples/` | Gold-standard outputs | Show AI what good looks like |

---

## Folder Details

### `prompts/`
Copy-paste ready prompts organized by development phase:
- **planning/** - PRD generation, architecture analysis, scope definition
- **development/** - Debugging, code cleanup, tech debt
- **quality/** - Security audits, testing, pre-launch checks
- **design/** - Design systems, UI/UX

### `skills/`
Claude Skills that define AI behavior for specific tasks. Drop into your `~/.claude/` folder or project-level `.claude/` folder.

### `instructions/`
Reusable instruction sets:
- **personas/** - Role-based AI behaviors (senior engineer, security expert)
- **standards/** - Coding standards by language/framework
- **workflows/** - Process-specific instructions (TDD, PR review)

### `templates/`
Project scaffolding files:
- **claude-md/** - CLAUDE.md templates for different project types
- **cursor-rules/** - .cursorrules for Cursor IDE
- **copilot/** - GitHub Copilot instruction files
- **docs/** - Document templates (PRD, ADR, runbooks)

### `chains/`
Multi-step workflows that combine multiple prompts in sequence for complex tasks.

### `snippets/`
Small, composable pieces to enhance any prompt:
- **modifiers/** - Change AI behavior (ultrathink, step-by-step)
- **output-formats/** - Specify response format (JSON, table, checklist)
- **constraints/** - Add boundaries (MVP only, security first)

### `contexts/`
Reference documentation to provide AI with background knowledge:
- **stacks/** - Tech stack primers
- **patterns/** - Architecture patterns
- **guides/** - Best practices

### `examples/`
Gold-standard outputs to show AI what good looks like.

---

## Usage Patterns

### 1. Copy a prompt
```bash
cat prompts/planning/prd-generator.md | pbcopy
```

### 2. Compose prompts with snippets
```bash
# Combine a prompt with a modifier
cat prompts/development/debugger.md snippets/modifiers/ultrathink.md | pbcopy
```

### 3. Set up a new project
```bash
# Copy CLAUDE.md template
cp templates/claude-md/nextjs-app.md /path/to/project/CLAUDE.md

# Copy cursor rules
cp templates/cursor-rules/nextjs.txt /path/to/project/.cursorrules
```

### 4. Reference in Claude Code
```bash
# In your project's CLAUDE.md, reference this library:
# See: ~/Desktop/githubProjects/ai-library/instructions/standards/typescript.md
```

---

## File Format Convention

All prompt files follow this structure:

```markdown
# Prompt Name

> One-line description

## Variables
- `[variable]` - what to replace

## Prompt
\`\`\`
The actual prompt...
\`\`\`

## Usage Tips
- When to use
- What to combine with

## Pairs Well With
- Related prompts/snippets
```

---

## Contributing to Your Library

### Adding a new prompt
1. Create file in appropriate `prompts/` subfolder
2. Follow the file format convention
3. Update the section's `_index.md`

### Creating a new skill
1. Add to `skills/` with clear trigger conditions
2. Test in a project before committing

### Updating templates
1. Version your templates (or use git history)
2. Document breaking changes

---

## MCP Server Tools

When using the MCP server, Claude has access to these tools:

| Tool | Purpose |
|------|---------|
| `enhance_prompt` | **Auto-enhance any request** - Call this first for better results |
| `get_prompt` | Fetch any prompt, skill, or template by name |
| `search_prompts` | Search the library by keywords |
| `suggest_prompts` | Get AI-recommended prompts for your task |
| `run_chain` | Execute multi-step workflows |
| `compose_prompt` | Combine multiple prompts |
| `library_stats` | See what's in the library |
| `save_to_library` | Save new prompts to the library |

### Auto-Enhancement Flow

```
You: "Build a user authentication system"
        ↓
Claude calls: enhance_prompt("Build a user authentication system")
        ↓
Returns: security-review, new-feature chain, auth patterns
        ↓
Claude calls: get_prompt("security-review")
        ↓
Claude applies security patterns while building
```

---

## Quick Reference

### Most Used Prompts
| Prompt | Path | Use Case |
|--------|------|----------|
| PRD Generator | `prompts/planning/prd-generator.md` | Starting a new feature |
| Deep Debugger | `prompts/analysis/deep-debugger.md` | Systematic debugging |
| Security Audit | `prompts/quality/security-audit.md` | Pre-production check |
| Ultrathink | `snippets/modifiers/ultrathink.md` | Deep analysis mode |
| Megathink | `snippets/modifiers/megathink.md` | Maximum thinking for architecture |

### Essential Templates
| Template | Path | Use Case |
|----------|------|----------|
| Full CLAUDE.md | `templates/claude-md/full.md` | Comprehensive project setup |
| Auto-Enhance | `templates/claude-md/auto-enhance.md` | Enable auto-enhancement |
| Next.js CLAUDE.md | `templates/claude-md/nextjs-app.md` | New Next.js project |
| Minimal CLAUDE.md | `templates/claude-md/minimal.md` | Quick project setup |

### Skills
| Skill | Path | Use Case |
|-------|------|----------|
| Code Review Advanced | `skills/code-review-advanced.md` | 4-lens comprehensive review |
| Senior Engineer Persona | `instructions/personas/senior-engineer.md` | Expert-level guidance |
| TypeScript React Standards | `instructions/standards/typescript-react.md` | Full stack TS/React standards |

---

## Pro Tips

1. **Symlink over copy** - Keep templates in sync with source
2. **Compose snippets** - Combine modifiers for powerful prompts
3. **Version with git** - Track what works, revert what doesn't
4. **Project-specific tweaks** - Copy then customize for edge cases
5. **Review examples** - Before asking AI, show it what good looks like

---

*This is your goldmine. Keep it polished.*
