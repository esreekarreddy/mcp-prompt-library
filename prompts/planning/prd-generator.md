# PRD Generator

> Generate a comprehensive, engineering-ready Product Requirements Document (PRD).

## Variables
- `[your idea]` - Brief description of what you want to build
- `[context]` - (Optional) Existing tech stack, user base, or constraints

## Prompt

```
Act as a Senior Product Manager and CTO. I want to build [your idea].

Your goal is to create a detailed, engineering-ready PRD that I can hand to a developer to start coding immediately.

<thinking_process>
1.  Analyze the request to understand the core value proposition.
2.  Identify the target user and their specific pain points.
3.  Brainstorm core features required for a "lovable" MVP (Minimum Viable Product).
4.  Identify technical constraints and requirements based on modern best practices.
5.  Structure the output into a clear, actionable document.
</thinking_process>

Please generate a PRD with the following structure. Be concise, ruthless with scope, and technical.

# Product Requirements Document: [Project Name]

## 1. Executive Summary
- **Pitch**: One sentence description.
- **Problem**: What specific pain point are we solving?
- **Solution**: High-level approach.
- **Target Audience**: Who is this for?

## 2. User Stories (MVP Scope)
Format: `- [ ] As a [user], I want [action] so that [benefit]`
*Limit to the critical path only. Mark "P0" for must-haves.*

## 3. Technical Specifications
- **Stack Recommendations**: Frontend, Backend, Database, Infra (justify choices).
- **Data Model**: Key entities and relationships (ERD description).
- **API Endpoints**: Key routes required (e.g., `POST /api/generate`).
- **Security**: Auth, RLS, validation rules.

## 4. Design & UX Guidelines
- **Core Flow**: Step-by-step user journey.
- **Key UI Components**: Necessary screens/modals.

## 5. Implementation Roadmap
- **Phase 1**: Setup & Boilerplate
- **Phase 2**: Core MVP Features
- **Phase 3**: Polish & Ship

## 6. Open Questions & Risks
- What unknowns need research?
- What are the technical risks?
```

## Usage Tips
- Use this *before* writing a single line of code.
- If the output feels too big, ask Claude to "simplify to a weekend hackathon scope".
- Review the "Data Model" section carefully—it often dictates your code structure.

## Pairs Well With
- `prompts/planning/architecture-analyzer.md` (to validate the tech spec)
- `prompts/planning/implementation-plan.md` (to break Phase 1-3 into tasks)
- `snippets/modifiers/be-ruthless.md` (to cut scope further)
