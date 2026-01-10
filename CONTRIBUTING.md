# Contributing to MCP Prompt Library

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

### 1. Add New Prompts
The easiest way to contribute is by adding new prompts that have worked well for you.

**Structure for new prompts:**
```markdown
# Prompt Name

> One-line description

## Variables
- `[variable]` - what to replace

## Prompt
```
The actual prompt text...
```

## Usage Tips
- When to use this prompt
- What it works best for

## Pairs Well With
- Related prompts or snippets
```

**Where to add:**
- `prompts/planning/` - PRDs, architecture, scope
- `prompts/development/` - Debugging, code cleanup
- `prompts/quality/` - Security, testing, reviews
- `prompts/design/` - UI/UX, design systems

### 2. Add Workflow Chains
Multi-step workflows that guide through complex tasks.

Location: `chains/`

### 3. Add Snippets/Modifiers
Small, composable pieces that enhance any prompt.

Location: `snippets/modifiers/`, `snippets/output-formats/`, `snippets/constraints/`

### 4. Improve Documentation
- Fix typos or unclear explanations
- Add examples
- Improve the README

### 5. MCP Server Improvements
- Bug fixes
- New tools
- Performance improvements

## Development Setup

```bash
# Clone the repository
git clone https://github.com/sreekarreddy/mcp-prompt-library.git
cd mcp-prompt-library

# Install dependencies
cd mcp-server
npm install

# Build
npm run build

# Run tests
npm run test

# Watch mode for development
npm run dev
```

## Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-prompt`
3. **Make your changes**
4. **Test your changes**:
   - For prompts: Try them in Claude/OpenCode/Cursor
   - For MCP server: Run `npm run test`
5. **Commit with a clear message**: `git commit -m "Add: new debugging prompt for async code"`
6. **Push to your fork**: `git push origin feature/amazing-prompt`
7. **Open a Pull Request**

## Commit Message Format

Use clear, descriptive commit messages:

- `Add: new prompt for X`
- `Fix: broken link in Y`
- `Update: improve Z prompt`
- `Docs: clarify installation steps`
- `Test: add tests for chain functionality`

## Code Style

### For Markdown Files
- Use consistent headers (`#`, `##`, `###`)
- Use `[variable]` format for placeholders
- Include usage tips and examples
- Keep prompts focused and reusable

### For TypeScript (MCP Server)
- Run `npm run typecheck` before committing
- Follow existing code patterns
- Add tests for new functionality
- Use meaningful variable and function names

## Testing

### MCP Server Tests
```bash
cd mcp-server
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Manual Testing
1. Build the server: `npm run build`
2. Configure in your AI tool (OpenCode, Claude Desktop, Cursor)
3. Test the tools work correctly

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for general questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making MCP Prompt Library better!
