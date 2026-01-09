# Prompts Index

> Ready-to-paste prompts for every phase of development

## Quick Reference

| Prompt | Category | Use When |
|--------|----------|----------|
| [PRD Generator](planning/prd-generator.md) | Planning | Starting a new feature/product |
| [Architecture Analyzer](planning/architecture-analyzer.md) | Planning | Understanding existing codebase |
| [Implementation Plan](planning/implementation-plan.md) | Planning | Before writing code |
| [Scope Killer](planning/scope-killer.md) | Planning | Preventing feature creep |
| [Debugger](development/debugger.md) | Development | Stuck in debugging loop |
| [Code Cleaner](development/code-cleaner.md) | Development | Consolidating duplicate code |
| [Tech Debt Audit](development/tech-debt-audit.md) | Development | Finding technical debt |
| [Security Audit](quality/security-audit.md) | Quality | Pre-production security check |
| [Security Fixer](quality/security-fixer.md) | Quality | Fixing found vulnerabilities |
| [Pre-Launch Checklist](quality/pre-launch-checklist.md) | Quality | Before deploying to production |
| [Critical Path Tester](quality/critical-path-tester.md) | Quality | Generating critical tests |
| [Design System Extractor](design/design-system-extractor.md) | Design | Standardizing UI patterns |

## By Category

### Planning (Pre-coding)
- [prd-generator.md](planning/prd-generator.md) - Generate a Product Requirements Document
- [architecture-analyzer.md](planning/architecture-analyzer.md) - Understand codebase architecture
- [implementation-plan.md](planning/implementation-plan.md) - Plan before coding
- [scope-killer.md](planning/scope-killer.md) - Ruthlessly cut scope

### Development (Active coding)
- [debugger.md](development/debugger.md) - Systematic debugging approach
- [code-cleaner.md](development/code-cleaner.md) - Remove duplicates and dead code
- [tech-debt-audit.md](development/tech-debt-audit.md) - Find and prioritize tech debt

### Quality (Testing & Security)
- [security-audit.md](quality/security-audit.md) - Full security audit
- [security-fixer.md](quality/security-fixer.md) - Fix vulnerabilities
- [pre-launch-checklist.md](quality/pre-launch-checklist.md) - Production readiness
- [critical-path-tester.md](quality/critical-path-tester.md) - Generate critical tests

### Design (UI/UX)
- [design-system-extractor.md](design/design-system-extractor.md) - Extract design tokens

## Recommended Combinations

| Task | Prompts to Chain |
|------|------------------|
| New Feature | PRD Generator → Implementation Plan → Critical Path Tester |
| Bug Fix | Debugger + Ultrathink modifier |
| Code Cleanup | Tech Debt Audit → Code Cleaner |
| Pre-Launch | Security Audit → Security Fixer → Pre-Launch Checklist |
