# AI Library MCP Server + CLI

Your AI prompt library with **zero-friction access** - prompts load automatically based on what you're working on.

## What Is This? (Simple English)

Imagine you have a **personal library of AI prompts** - templates for writing PRDs, debugging code, security audits, etc. Instead of manually copy-pasting these prompts, this tool:

1. **Connects to your AI tools** (OpenCode, Claude, Cursor) so they can automatically access your prompts
2. **Suggests prompts automatically** based on what you're doing ("building a feature" → PRD generator, "stuck on bug" → debugger)
3. **Guides you through workflows** with multi-step chains (new feature, bug fix, security hardening)
4. **Grows with you** - save good prompts back to your library

Think of it like having a smart assistant that knows exactly which prompt you need before you ask.

---

## Quick Start

```bash
cd mcp-server
npm install
npm run build
```

---

## Two Ways to Use This

### 1. CLI (Command Line) - Use directly in terminal

```bash
# Get a prompt
node dist/cli.js get prd-generator

# Search prompts
node dist/cli.js search "security"

# Get suggestions for what you're doing
node dist/cli.js suggest "I need to build a new feature"

# Combine prompts (compose)
node dist/cli.js compose prd-generator ultrathink step-by-step

# Random prompt for inspiration
node dist/cli.js random

# See all commands
node dist/cli.js help
```

### 2. MCP Server - Connects to AI tools

Configure once, then your AI assistant has access to all 13 tools automatically.

---

## Configuring OpenCode

**Step 1:** Open or create `~/.opencode/config.json`

**Step 2:** Add this:

```json
{
  "mcpServers": {
    "ai-library": {
      "type": "stdio",
      "command": "node",
      "args": ["/Users/sreekarreddy/Desktop/githubProjects/ai-library/mcp-server/dist/index.js"]
    }
  }
}
```

**Step 3:** Restart OpenCode

**What happens:** OpenCode now has 13 new tools available. When you're working, you can:
- Ask "suggest prompts for what I'm doing" 
- Ask "get the PRD generator prompt"
- Ask "start the new-feature chain"
- And more!

---

## All 13 Tools Available

| Tool | What It Does |
|------|--------------|
| `get_prompt` | Fetch any prompt by name (fuzzy matching works!) |
| `search_prompts` | Search library by keywords |
| `suggest_prompts` | **Smart** - detects your intent and suggests relevant prompts |
| `compose_prompt` | **Combine** multiple prompts/snippets into one |
| `quick_prompt` | Instant one-liner prompts (ultrathink, critique, debug, etc.) |
| `detect_context` | Analyze project files → suggest stack-specific prompts |
| `random_prompt` | Random prompt for inspiration |
| `list_chains` | View available workflow chains |
| `start_chain` | Begin a multi-step workflow |
| `chain_next` | Advance to next step |
| `chain_status` | View progress |
| `save_to_library` | Save new prompts |
| `library_stats` | View library statistics |

---

## Smart Intent Detection

Just tell the AI what you're doing, and it suggests the right prompts:

| You Say | It Suggests |
|---------|-------------|
| "I need to build a new feature" | PRD generator, new-feature chain |
| "stuck on a bug" | Debugger, debugging skill, bug-fix chain |
| "security review" | Security audit, security fixer |
| "preparing for launch" | Pre-launch checklist, production-launch chain |
| "need to refactor this mess" | Code cleaner, refactoring skill |
| "this is complex" | Ultrathink modifier |

---

## Quick Prompts (One-Liners)

Instant prompt modifiers without fetching from library:

```
quick_prompt name="ultrathink"    → Deep analysis mode
quick_prompt name="critique"      → Harsh feedback mode
quick_prompt name="debug"         → Systematic debugging
quick_prompt name="plan"          → Planning mode (no code yet)
quick_prompt name="review"        → Code review checklist
quick_prompt name="ship"          → Focus on what's blocking launch
quick_prompt name="secure"        → Security review mode
quick_prompt name="test"          → Test writing mode
quick_prompt name="doc"           → Documentation mode
quick_prompt name="simplify"      → Explain like I'm 12
quick_prompt name="refactor"      → Refactoring mode
quick_prompt name="think"         → Step-by-step reasoning
```

---

## Compose Prompts

Combine any prompts/snippets into one powerful prompt:

```
compose_prompt items=["prd-generator", "ultrathink", "step-by-step"]
```

Result: PRD generator with deep thinking and step-by-step reasoning enabled.

---

## Workflow Chains

Multi-step guided workflows:

```
start_chain chain="new-feature"
```

The chain walks you through:
1. Generate PRD
2. Analyze architecture  
3. Create implementation plan
4. Implement (iterative)
5. Integration & testing
6. Pre-launch review
7. Deploy & monitor

Each step has a specific prompt and expected outputs.

---

## Configuration for Other Tools

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-library": {
      "command": "node",
      "args": ["/Users/sreekarreddy/Desktop/githubProjects/ai-library/mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "ai-library": {
      "command": "node",
      "args": ["/Users/sreekarreddy/Desktop/githubProjects/ai-library/mcp-server/dist/index.js"]
    }
  }
}
```

---

## CLI Commands Reference

| Command | Description |
|---------|-------------|
| `ai-lib get <name>` | Fetch prompt by ID or fuzzy name |
| `ai-lib search <query>` | Search prompts |
| `ai-lib suggest <message>` | Get smart suggestions |
| `ai-lib list [category]` | List all or by category |
| `ai-lib chains` | Show workflow chains |
| `ai-lib compose <items...>` | Combine prompts |
| `ai-lib random [category]` | Random prompt |
| `ai-lib stats` | Library statistics |
| `ai-lib help` | Show help |

---

## Library Structure

Your AI library has **74 items** across 8 categories:

```
ai-library/
├── prompts/          (12) - Copy-paste ready prompts
│   ├── planning/           PRD generator, scope killer, etc.
│   ├── development/        Debugger, code cleaner, etc.
│   ├── quality/            Security audit, testing, etc.
│   └── design/             Design system extractor
├── snippets/         (14) - Composable modifiers
│   ├── modifiers/          Ultrathink, step-by-step, etc.
│   ├── output-formats/     JSON, markdown table, etc.
│   └── constraints/        MVP only, security first, etc.
├── templates/        (11) - Project scaffolding
│   ├── claude-md/          CLAUDE.md templates
│   └── docs/               PRD, ADR, API spec templates
├── skills/           (7)  - Claude skills
├── instructions/     (15) - Personas & standards
├── chains/           (5)  - Multi-step workflows
├── contexts/         (7)  - Stack-specific guides
└── examples/         (3)  - Gold-standard samples
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AI_LIBRARY_PATH` | Custom path to your AI library |

---

## Development

```bash
npm run dev        # Watch mode
npm run build      # Compile TypeScript
npm run typecheck  # Type check only
```

Debug mode:
```bash
node dist/index.js --debug
```

---

## How It Works

1. **MCP Protocol**: Your AI tool connects to this server via stdin/stdout
2. **Library Scanning**: On startup, scans all markdown files and builds an index
3. **Fuzzy Matching**: Finds prompts even with typos or partial names
4. **Intent Detection**: Pattern matching to suggest prompts based on what you're doing
5. **Chain Sessions**: Tracks your progress through multi-step workflows

The server is stateless between restarts (chain sessions are in-memory).
