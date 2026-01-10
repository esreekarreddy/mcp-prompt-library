# Templates Index

> Project scaffolding files and document templates

## CLAUDE.md Templates

Templates for Claude Code project configuration.

| Template | Use Case | Complexity |
|----------|----------|------------|
| [minimal.md](claude-md/minimal.md) | Quick setup, any project | Low |
| [full.md](claude-md/full.md) | Full-featured production setup | High |
| [nextjs-app.md](claude-md/nextjs-app.md) | Next.js 14+ with App Router | Medium |
| [python-api.md](claude-md/python-api.md) | FastAPI/Flask backend | Medium |
| [nodejs-service.md](claude-md/nodejs-service.md) | Express.js backend | Medium |
| [cli-tool.md](claude-md/cli-tool.md) | Command-line tools | Medium |
| [auto-enhance.md](claude-md/auto-enhance.md) | AI Library auto-enhancement snippet | Low |

### Usage
```bash
# Copy to new project
cp templates/claude-md/nextjs-app.md /path/to/project/CLAUDE.md

# Or symlink for shared config
ln -s $AI_LIBRARY/templates/claude-md/nextjs-app.md ./CLAUDE.md
```

---

## Cursor Rules

Templates for Cursor IDE `.cursorrules` files.

| Template | Use Case |
|----------|----------|
| [minimal.txt](cursor-rules/minimal.txt) | Any project, basic rules |
| [nextjs.txt](cursor-rules/nextjs.txt) | Next.js projects |
| [python.txt](cursor-rules/python.txt) | Python projects |
| [fullstack.txt](cursor-rules/fullstack.txt) | Full-stack TypeScript |

### Usage
```bash
cp templates/cursor-rules/nextjs.txt /path/to/project/.cursorrules
```

---

## Copilot

GitHub Copilot custom instructions.

| Template | Use Case |
|----------|----------|
| [instructions.md](copilot/instructions.md) | General Copilot config |

---

## Document Templates

Templates for technical documentation.

| Template | Use Case |
|----------|----------|
| [prd-template.md](docs/prd-template.md) | Product Requirements Document |
| [adr-template.md](docs/adr-template.md) | Architecture Decision Record |
| [runbook-template.md](docs/runbook-template.md) | Operational Runbook |
| [api-spec-template.md](docs/api-spec-template.md) | API Documentation |

### Usage
```bash
# Copy and customize
cp templates/docs/prd-template.md ./docs/prd-feature-x.md
```

---

## Recommended Setup by Project Type

### Next.js App
```bash
cp templates/claude-md/nextjs-app.md ./CLAUDE.md
cp templates/cursor-rules/nextjs.txt ./.cursorrules
```

### Python API
```bash
cp templates/claude-md/python-api.md ./CLAUDE.md
cp templates/cursor-rules/python.txt ./.cursorrules
```

### Node.js Service
```bash
cp templates/claude-md/nodejs-service.md ./CLAUDE.md
cp templates/cursor-rules/fullstack.txt ./.cursorrules
```

### CLI Tool
```bash
cp templates/claude-md/cli-tool.md ./CLAUDE.md
cp templates/cursor-rules/minimal.txt ./.cursorrules
```
