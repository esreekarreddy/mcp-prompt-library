<p align="center">
  <h1 align="center">MCP Prompt Library</h1>
  <p align="center">
    <strong>90+ curated prompts, workflows, and coding standards for AI-assisted development</strong>
  </p>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node.js"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-purple.svg" alt="MCP Compatible"></a>
  <img src="https://img.shields.io/badge/tests-99%20passed-success.svg" alt="Tests">
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#mcp-server">MCP Server</a> •
  <a href="#library-contents">Library</a> •
  <a href="#integrations">Integrations</a>
</p>

---

## Why This Exists

AI assistants are powerful, but they're only as good as the prompts you give them. Most developers:

- **Repeat the same prompts** across projects
- **Forget effective prompts** they used before  
- **Struggle to compose** complex multi-step workflows
- **Lack consistency** in AI-assisted development patterns

**MCP Prompt Library** solves this by providing:

| What | How |
|------|-----|
| **90+ battle-tested prompts** | Organized by development phase (planning, development, quality, design) |
| **MCP server with 15 tools** | Direct integration with Claude, OpenCode, Cursor, and any MCP-compatible client |
| **Smart suggestions** | AI recommends prompts based on what you're doing |
| **Workflow chains** | Multi-step guided processes for features, bugs, refactoring, security |
| **Composable snippets** | Mix modifiers like `ultrathink` + `security-first` on any prompt |

---

## Quick Start

### 📦 Usage as npm Package (Best for Developers)

Install the library to use prompts programmatically in your own tools:

```bash
npm install @esreekarreddy/ai-prompts
```

```typescript
import { getPrompt, searchPrompts, composePrompts } from '@esreekarreddy/ai-prompts';

// 1. Get a specific prompt
const prd = getPrompt('prd-generator');
console.log(prd.content);

// 2. Search for prompts
const securityPrompts = searchPrompts('security');

// 3. Compose a custom prompt with modifiers
const complexTask = composePrompts(['prd-generator', 'ultrathink', 'security-first']);
```

### 🖥️ Usage as MCP Server (Best for Cursor/Claude)

### 1. Clone & Build

```bash
git clone https://github.com/esreekarreddy/mcp-prompt-library.git
cd mcp-prompt-library/mcp-server
npm install && npm run build
```

### 2. Configure Your AI Tool

See [Integrations](#integrations) for your specific tool (OpenCode, Claude Desktop, Cursor).

### 3. Start Using

Once connected, your AI assistant has access to all prompts:

```
"suggest prompts for what I'm doing"
"get the PRD generator prompt"
"start the new-feature chain"
"compose prd-generator with ultrathink"
```

---

## Features

### Smart Intent Detection

Tell your AI what you're doing, and it suggests the right prompts:

| You Say | It Suggests |
|---------|-------------|
| "I need to build a new feature" | PRD generator, new-feature chain |
| "Stuck on a bug" | Deep debugger, debugging skill, bug-fix chain |
| "Security review before launch" | Security audit, security-hardening chain |
| "This code is a mess" | Code cleaner, refactoring skill, refactor chain |
| "Complex architecture decision" | Megathink modifier, senior-engineer persona |

### Workflow Chains

Multi-step guided workflows for complex tasks:

| Chain | Steps | Use Case |
|-------|-------|----------|
| `new-feature` | 7 | From PRD to deployment |
| `bug-fix` | 7 | Systematic debugging to resolution |
| `refactor` | 6 | Safe refactoring with verification |
| `security-hardening` | 7 | Comprehensive security review |
| `production-launch` | 7 | Pre-launch checklist to deployment |

```bash
# Start a chain
node dist/cli.js chains           # List available chains
start_chain chain="new-feature"   # Via MCP tool
```

### Composable Prompts

Combine any prompts with modifiers:

```bash
# CLI
node dist/cli.js compose prd-generator ultrathink security-first

# MCP Tool  
compose_prompt items=["prd-generator", "ultrathink", "security-first"]
```

### Quick Modifiers

Instant prompt enhancers:

| Modifier | Effect |
|----------|--------|
| `ultrathink` | Deep analysis with extended reasoning |
| `megathink` | Maximum thinking for architecture decisions |
| `critique` | Harsh, unfiltered feedback mode |
| `debug` | Systematic debugging approach |
| `plan` | Planning mode - no code yet |
| `secure` | Security-focused review |
| `simplify` | Explain like I'm 12 |

---

## MCP Server

The MCP (Model Context Protocol) server exposes **15 tools** to your AI assistant:

### Library Tools
| Tool | Purpose |
|------|---------|
| `get_prompt` | Fetch any prompt by name (fuzzy matching works) |
| `search_prompts` | Search library by keywords |
| `suggest_prompts` | Smart suggestions based on your intent |
| `enhance_prompt` | Analyze request and suggest approach + relevant prompts |
| `save_to_library` | Save new prompts to the library |
| `library_stats` | Library statistics |
| `random_prompt` | Random prompt for inspiration |

### Chain Tools
| Tool | Purpose |
|------|---------|
| `list_chains` | View available workflow chains |
| `start_chain` | Begin a multi-step workflow |
| `chain_next` | Advance to next step |
| `chain_status` | View workflow progress |
| `chain_step` | Jump to specific step |

### Utility Tools
| Tool | Purpose |
|------|---------|
| `compose_prompt` | Combine multiple prompts |
| `quick_prompt` | Instant one-liner modifiers |
| `detect_context` | Analyze project → suggest stack-specific prompts |

### How It Works

```
You: "Build a user authentication system"
        ↓
AI calls: suggest_prompts("Build a user authentication system")
        ↓
Returns: security-audit, new-feature chain, auth patterns
        ↓
AI calls: start_chain("new-feature")  
        ↓
AI guides you through: PRD → Architecture → Implementation → Testing → Deploy
```

---

## Library Contents

**90+ curated resources** across 8 categories:

```
mcp-prompt-library/
├── prompts/          (18) - Copy-paste ready prompts
│   ├── planning/          PRD generator, scope killer, architecture
│   ├── development/       Debugger, code cleaner, tech debt
│   ├── quality/           Security audit, testing, pre-launch
│   ├── design/            Design system extractor
│   ├── analysis/          Deep debugger
│   ├── agentic/           Context manager, agentic loop, test-driven fix
│   └── system/            Master system prompt for AI setup
├── skills/           (8)  - AI behavior definitions
│   └── code-review, debugging, testing, refactoring, documentation...
├── instructions/     (18) - Reusable system prompts
│   ├── personas/          Senior engineer, security expert, DevOps, UX
│   ├── standards/         TypeScript, React, Python, Go, Rust, FastAPI, Next.js
│   └── workflows/         TDD, PR review, incident response, feature development
├── templates/        (16) - Project scaffolding
│   ├── claude-md/         CLAUDE.md for Next.js, Python, Node.js, CLI tools
│   ├── cursor-rules/      .cursorrules for various stacks
│   ├── copilot/           GitHub Copilot instructions
│   └── docs/              PRD, ADR, API spec, runbook templates
├── chains/           (5)  - Multi-step workflows
│   └── new-feature, bug-fix, refactor, security-hardening, production-launch
├── snippets/         (17) - Composable modifiers
│   ├── modifiers/         ultrathink, megathink, step-by-step, meta-cot
│   ├── output-formats/    JSON, markdown table, checklist, numbered list
│   └── constraints/       Security first, MVP only, read-only, no external deps
├── contexts/         (9)  - Reference documentation
│   ├── stacks/            Next.js 14, FastAPI, Prisma
│   ├── patterns/          MCP server patterns, agentic coding
│   └── guides/            API design, error handling
└── examples/         (3)  - Gold-standard samples
    └── PRDs, architecture docs, code reviews
```

---

## Integrations

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

### VS Code + GitHub Copilot

Copy the prompt files to your workspace:

```bash
cp -r .github/prompts /path/to/your-project/.github/prompts
```

---

## CLI Usage

Use the library directly from your terminal:

```bash
cd mcp-server

# Get a specific prompt
node dist/cli.js get prd-generator

# Search prompts  
node dist/cli.js search "security"

# Get AI-powered suggestions
node dist/cli.js suggest "I need to refactor this messy code"

# Combine prompts
node dist/cli.js compose prd-generator ultrathink step-by-step

# View workflow chains
node dist/cli.js chains

# Library statistics
node dist/cli.js stats

# Random prompt for inspiration
node dist/cli.js random
```

---

## Development

```bash
cd mcp-server

npm install        # Install dependencies
npm run build      # Build TypeScript
npm run test       # Run tests (99 tests)
npm run dev        # Watch mode
npm run typecheck  # Type checking only
```

### Architecture

- **TypeScript** - Full type safety
- **Vitest** - 99 tests with fast execution
- **Zod** - Runtime validation for configs
- **chokidar** - Hot-reload when library files change
- **MCP SDK** - Model Context Protocol integration

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Ideas for contributions:
- Add prompts that worked well for you
- Add workflow chains for common tasks
- Add coding standards for new languages/frameworks
- Improve existing prompts with better examples

---

## License

MIT - see [LICENSE](LICENSE)

---

## Acknowledgments

Built with the [Model Context Protocol](https://modelcontextprotocol.io) by Anthropic.

---

<p align="center">
  <strong>Your AI is only as good as your prompts. Keep them polished.</strong>
</p>
