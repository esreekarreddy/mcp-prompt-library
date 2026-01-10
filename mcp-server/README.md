# MCP Prompt Library - Server & CLI

Your AI prompt library with **zero-friction access** - prompts load automatically based on what you're working on.

## What Is This?

A personal library of AI prompts (PRD templates, debugging guides, security audits) that:

1. **Connects to your AI tools** (OpenCode, Claude, Cursor) via MCP protocol
2. **Suggests prompts automatically** based on what you're doing
3. **Guides you through workflows** with multi-step chains
4. **Grows with you** - save good prompts back to your library

---

## Quick Start

```bash
npm install
npm run build
```

Then configure your AI tool (see below).

---

## Two Ways to Use

### 1. CLI (Command Line)

```bash
# Get a prompt
node dist/cli.js get prd-generator

# Search prompts
node dist/cli.js search "security"

# Get suggestions for what you're doing
node dist/cli.js suggest "I need to build a new feature"

# Combine prompts
node dist/cli.js compose prd-generator ultrathink step-by-step

# View workflow chains
node dist/cli.js chains

# Library stats
node dist/cli.js stats

# All commands
node dist/cli.js help
```

### 2. MCP Server

Configure once, then your AI assistant has access to all 15 tools automatically.

---

## Configuration

### OpenCode

Add to `~/.opencode/config.json`:

```json
{
  "mcp": {
    "ai-library": {
      "type": "local",
      "command": [
        "node",
        "/path/to/mcp-prompt-library/mcp-server/dist/index.js"
      ],
      "enabled": true
    }
  }
}
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-library": {
      "command": "node",
      "args": ["/path/to/mcp-prompt-library/mcp-server/dist/index.js"]
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
      "args": ["/path/to/mcp-prompt-library/mcp-server/dist/index.js"]
    }
  }
}
```

---

## All 15 Tools

### Library Tools
| Tool | What It Does |
|------|--------------|
| `get_prompt` | Fetch any prompt by name (fuzzy matching works) |
| `search_prompts` | Search library by keywords |
| `suggest_prompts` | Smart - detects your intent and suggests relevant prompts |
| `enhance_prompt` | Analyze request and suggest approach + prompts |
| `save_to_library` | Save new prompts |
| `library_stats` | View library statistics |
| `random_prompt` | Random prompt for inspiration |

### Chain Tools
| Tool | What It Does |
|------|--------------|
| `list_chains` | View available workflow chains |
| `start_chain` | Begin a multi-step workflow |
| `chain_next` | Advance to next step |
| `chain_status` | View progress |
| `chain_step` | Jump to specific step |

### Utility Tools
| Tool | What It Does |
|------|--------------|
| `compose_prompt` | Combine multiple prompts/snippets into one |
| `quick_prompt` | Instant one-liner modifiers (ultrathink, debug, etc.) |
| `detect_context` | Analyze project files → suggest stack-specific prompts |

---

## Smart Intent Detection

Tell the AI what you're doing:

| You Say | It Suggests |
|---------|-------------|
| "I need to build a new feature" | PRD generator, new-feature chain |
| "stuck on a bug" | Deep debugger, debugging skill, bug-fix chain |
| "security review" | Security audit, security-hardening chain |
| "preparing for launch" | Pre-launch checklist, production-launch chain |
| "need to refactor this mess" | Code cleaner, refactoring skill |
| "this is complex" | Ultrathink modifier |

---

## Quick Prompts

Instant modifiers without fetching from library:

```
quick_prompt name="ultrathink"    → Deep analysis mode
quick_prompt name="critique"      → Harsh feedback mode
quick_prompt name="debug"         → Systematic debugging
quick_prompt name="plan"          → Planning mode (no code yet)
quick_prompt name="secure"        → Security review mode
quick_prompt name="simplify"      → Explain like I'm 12
quick_prompt name="refactor"      → Refactoring mode
```

---

## Compose Prompts

Combine any prompts/snippets:

```
compose_prompt items=["prd-generator", "ultrathink", "step-by-step"]
```

Result: PRD generator with deep thinking and step-by-step reasoning.

---

## Workflow Chains

Multi-step guided workflows:

| Chain | Steps | Use Case |
|-------|-------|----------|
| `new-feature` | 7 | From PRD to deployment |
| `bug-fix` | 5 | Systematic debugging to resolution |
| `refactor` | 6 | Safe refactoring with verification |
| `security-hardening` | 5 | Comprehensive security review |
| `production-launch` | 6 | Pre-launch to deployment |

```
start_chain chain="new-feature"
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `node dist/cli.js get <name>` | Fetch prompt by ID or fuzzy name |
| `node dist/cli.js search <query>` | Search prompts |
| `node dist/cli.js suggest <message>` | Get smart suggestions |
| `node dist/cli.js list [category]` | List all or by category |
| `node dist/cli.js chains` | Show workflow chains |
| `node dist/cli.js compose <items...>` | Combine prompts |
| `node dist/cli.js random [category]` | Random prompt |
| `node dist/cli.js stats` | Library statistics |

---

## Library Structure

```
mcp-prompt-library/
├── prompts/          (18) - Copy-paste ready prompts
├── snippets/         (18) - Composable modifiers
├── templates/        (14) - Project scaffolding
├── skills/           (9)  - AI behavior definitions
├── instructions/     (19) - Personas & standards
├── chains/           (6)  - Multi-step workflows
├── contexts/         (9)  - Stack-specific guides
└── examples/         (3)  - Gold-standard samples
```

---

## Development

```bash
npm run dev        # Watch mode
npm run build      # Compile TypeScript
npm run test       # Run tests (99 tests)
npm run typecheck  # Type check only
```

---

## How It Works

1. **MCP Protocol**: AI tool connects via stdin/stdout
2. **Library Scanning**: On startup, scans all markdown files and builds an index
3. **Hot Reload**: Watches for file changes via chokidar
4. **Fuzzy Matching**: Finds prompts even with typos
5. **Intent Detection**: Pattern matching suggests prompts based on context
6. **Session Persistence**: Chain sessions persist to `.sessions/` directory
