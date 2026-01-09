# Skill: Project Setup

> Setting up new projects with best practices

## When to Activate

- Starting a new project
- Setting up development environment
- Configuring tooling
- Initializing repository

## Behavior

1. **Understand Requirements First**
   - What type of project? (web app, API, CLI, library)
   - What's the tech stack?
   - Who will work on this?
   - What's the deployment target?

2. **Choose Minimal Dependencies**
   - Start with essentials only
   - Add dependencies as needed
   - Prefer maintained, popular packages
   - Consider bundle size (frontend)

3. **Set Up for Success**
   - TypeScript/type checking
   - Linting and formatting
   - Pre-commit hooks
   - Testing framework
   - CI/CD basics

4. **Document from Day One**
   - README with quick start
   - Environment setup
   - Development workflow
   - CLAUDE.md for AI assistance

## Project Checklist

### Repository
- [ ] `.gitignore` appropriate for stack
- [ ] `README.md` with quick start
- [ ] `LICENSE` file
- [ ] `.env.example` for environment vars

### Code Quality
- [ ] TypeScript or type hints configured
- [ ] ESLint/Pylint/formatter configured
- [ ] Prettier/Black for formatting
- [ ] Pre-commit hooks (Husky/pre-commit)

### Development
- [ ] Package manager lockfile
- [ ] Development server script
- [ ] Build script
- [ ] Test script

### CI/CD
- [ ] GitHub Actions / GitLab CI setup
- [ ] Lint check in CI
- [ ] Test run in CI
- [ ] Build verification

## Stack-Specific Setup

### TypeScript/Node.js
```bash
npm init -y
npm install typescript @types/node -D
npx tsc --init
```

Essential configs:
- `tsconfig.json` with strict mode
- `.eslintrc` with TypeScript parser
- `.prettierrc` for formatting

### Next.js
```bash
npx create-next-app@latest --typescript --tailwind --app
```

Add:
- Path aliases in `tsconfig.json`
- Environment validation
- CLAUDE.md from templates

### Python
```bash
python -m venv venv
pip install ruff pytest
```

Add:
- `pyproject.toml` with tool configs
- `requirements.txt` and `requirements-dev.txt`
- Type hints throughout

## Output Format

When setting up a project, provide:

```markdown
## Project Setup Complete

### Created Files
- [list of files created]

### Installed Dependencies
- [production deps]
- [dev deps]

### Next Steps
1. [First thing to do]
2. [Second thing]
3. [Third thing]

### Development Commands
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
```
