/**
 * Utility Tools - Compose, Quick Prompts, Context Detection
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from '../lib/library.js';
import type { LibraryCategory, LibraryItem } from '../types.js';

const VALID_CATEGORIES: LibraryCategory[] = [
  'prompts', 'snippets', 'templates', 'skills', 'instructions', 'chains', 'contexts', 'examples',
];

// Quick prompts - instant one-liners for common needs
const QUICK_PROMPTS: Record<string, { prompt: string; description: string }> = {
  'think': {
    prompt: 'Think through this step by step, showing your reasoning at each stage.',
    description: 'Enable step-by-step reasoning',
  },
  'ultrathink': {
    prompt: 'This is a complex problem. Take your time and think through every angle. Consider edge cases, potential issues, and alternative approaches before settling on a solution.',
    description: 'Deep analysis mode for complex problems',
  },
  'critique': {
    prompt: 'Be a harsh but fair critic. Point out every flaw, inefficiency, and potential issue. Do not hold back - I need honest feedback to improve.',
    description: 'Get ruthless feedback',
  },
  'simplify': {
    prompt: 'Explain this like I am a smart 12-year-old. Use simple language, analogies, and concrete examples. Avoid jargon.',
    description: 'Simple explanation mode',
  },
  'plan': {
    prompt: 'Before implementing anything, create a detailed plan. Break it into phases, list dependencies, and identify risks. I will review and approve before we proceed.',
    description: 'Planning mode - no code yet',
  },
  'review': {
    prompt: 'Review this code for: 1) Bugs and edge cases, 2) Security vulnerabilities, 3) Performance issues, 4) Code quality and maintainability. Be specific about line numbers.',
    description: 'Code review checklist',
  },
  'debug': {
    prompt: 'Help me debug this issue. First, understand what SHOULD happen. Then analyze what IS happening. Form hypotheses and help me test them systematically.',
    description: 'Systematic debugging approach',
  },
  'secure': {
    prompt: 'Analyze this for security vulnerabilities. Check for: injection attacks, auth issues, data exposure, insecure defaults, and missing validation. Assume an attacker mindset.',
    description: 'Security review mode',
  },
  'test': {
    prompt: 'Write comprehensive tests for this code. Include: 1) Happy path, 2) Edge cases, 3) Error conditions, 4) Boundary values. Use the existing testing patterns in this codebase.',
    description: 'Test writing mode',
  },
  'doc': {
    prompt: 'Write clear documentation for this code. Include: purpose, usage examples, parameters, return values, and any gotchas. Write for a developer new to this codebase.',
    description: 'Documentation mode',
  },
  'refactor': {
    prompt: 'Refactor this code to be cleaner and more maintainable. Prioritize: readability, single responsibility, DRY principles. Explain each change you make.',
    description: 'Refactoring mode',
  },
  'ship': {
    prompt: 'I need to ship this today. Focus on: 1) Does it work for the main use case? 2) Any critical bugs? 3) Is it secure enough for now? Help me identify what is blocking launch vs. what can wait.',
    description: 'Ship-it mode - focus on essentials',
  },
};

export function registerUtilityTools(
  server: McpServer,
  library: Library,
  ensureInitialized: () => Promise<void>
) {
  // compose_prompt
  server.tool(
    'compose_prompt',
    'Combine multiple prompts and snippets into one powerful composite prompt. Great for adding modifiers like "ultrathink" or "step-by-step" to any prompt.',
    {
      items: z.array(z.string()).describe('Array of prompt/snippet IDs or names to combine (e.g., ["prd-generator", "ultrathink", "step-by-step"])'),
      include_metadata: z.boolean().optional().describe('Include titles and metadata in output (default: false)'),
    },
    async ({ items, include_metadata = false }) => {
      await ensureInitialized();

      const found: LibraryItem[] = [];
      const notFound: string[] = [];

      for (const name of items) {
        const item = library.getItem(name);
        if (item) {
          found.push(item);
        } else {
          notFound.push(name);
        }
      }

      if (found.length === 0) {
        return {
          content: [{ type: 'text', text: `None of the specified items were found: ${items.join(', ')}` }],
          isError: true,
        };
      }

      const modifiers = found.filter((i) => i.category === 'snippets');
      const mainItems = found.filter((i) => i.category !== 'snippets');

      const lines: string[] = [];

      if (include_metadata) {
        lines.push('# Composed Prompt', '');
        lines.push(`**Components:** ${found.map((i) => i.name).join(' + ')}`);
        if (notFound.length > 0) {
          lines.push(`**Not found:** ${notFound.join(', ')}`);
        }
        lines.push('', '---', '');
      }

      // Add modifiers first
      for (const mod of modifiers) {
        const content = mod.body
          .replace(/^#\s+.*\n/, '')
          .replace(/^>\s+.*\n/, '')
          .trim();
        lines.push(content, '');
      }

      // Add main prompts
      for (let i = 0; i < mainItems.length; i++) {
        const item = mainItems[i];
        if (mainItems.length > 1 && include_metadata) {
          lines.push(`## ${item.metadata.title || item.name}`, '');
        }
        lines.push(item.body);
        if (i < mainItems.length - 1) {
          lines.push('', '---', '');
        }
      }

      return { content: [{ type: 'text', text: lines.join('\n').trim() }] };
    }
  );

  // quick_prompt
  server.tool(
    'quick_prompt',
    'Get a quick, ready-to-use prompt modifier. These are one-liner prompts for common needs like "ultrathink", "critique", "debug", etc.',
    {
      name: z.string().describe('Quick prompt name: think, ultrathink, critique, simplify, plan, review, debug, secure, test, doc, refactor, ship'),
      list: z.boolean().optional().describe('If true, list all available quick prompts instead'),
    },
    async ({ name, list }) => {
      if (list) {
        const lines = ['# Quick Prompts', '', 'One-liner prompts for common needs:', ''];
        for (const [key, value] of Object.entries(QUICK_PROMPTS)) {
          lines.push(`**${key}**: ${value.description}`);
        }
        lines.push('', 'Use: `quick_prompt name="<name>"`');
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      const quickPrompt = QUICK_PROMPTS[name.toLowerCase()];
      if (!quickPrompt) {
        const available = Object.keys(QUICK_PROMPTS).join(', ');
        return {
          content: [{ type: 'text', text: `Quick prompt "${name}" not found.\n\nAvailable: ${available}` }],
          isError: true,
        };
      }

      return { content: [{ type: 'text', text: quickPrompt.prompt }] };
    }
  );

  // detect_context
  server.tool(
    'detect_context',
    'Analyze project files to detect the tech stack and suggest relevant prompts. Pass a list of file names or extensions found in your project.',
    {
      files: z.array(z.string()).describe('List of file names or paths from the project (e.g., ["package.json", "next.config.js", "prisma/schema.prisma"])'),
    },
    async ({ files }) => {
      await ensureInitialized();

      const detected: { stack: string; confidence: number; prompts: string[] }[] = [];

      const patterns = [
        { stack: 'Next.js', indicators: ['next.config.js', 'next.config.ts', 'next.config.mjs', '.next', 'app/layout.tsx', 'pages/_app.tsx'], prompts: ['contexts/stacks/nextjs-14', 'instructions/standards/nextjs', 'instructions/standards/react'] },
        { stack: 'React', indicators: ['react', 'jsx', 'tsx', 'vite.config.ts'], prompts: ['instructions/standards/react', 'instructions/standards/typescript'] },
        { stack: 'TypeScript', indicators: ['tsconfig.json', '.ts', '.tsx'], prompts: ['instructions/standards/typescript'] },
        { stack: 'Node.js', indicators: ['package.json', 'node_modules', '.nvmrc'], prompts: ['instructions/standards/nodejs'] },
        { stack: 'Python', indicators: ['requirements.txt', 'pyproject.toml', 'setup.py', '.py', 'Pipfile'], prompts: ['instructions/standards/python'] },
        { stack: 'FastAPI', indicators: ['fastapi', 'uvicorn', 'main.py'], prompts: ['contexts/stacks/fastapi', 'instructions/standards/fastapi'] },
        { stack: 'Prisma', indicators: ['prisma', 'schema.prisma'], prompts: ['contexts/stacks/prisma', 'contexts/patterns/repository-pattern'] },
        { stack: 'Docker', indicators: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'], prompts: ['instructions/personas/devops-engineer'] },
        { stack: 'Testing', indicators: ['jest.config', 'vitest.config', 'pytest.ini', '.test.', '.spec.'], prompts: ['skills/testing', 'instructions/workflows/tdd'] },
      ];

      const fileStr = files.join(' ').toLowerCase();

      for (const pattern of patterns) {
        const matches = pattern.indicators.filter((ind) => fileStr.includes(ind.toLowerCase()));
        if (matches.length > 0) {
          const confidence = Math.min(0.95, 0.5 + matches.length * 0.15);
          detected.push({ stack: pattern.stack, confidence, prompts: pattern.prompts });
        }
      }

      detected.sort((a, b) => b.confidence - a.confidence);

      if (detected.length === 0) {
        return {
          content: [{ type: 'text', text: 'Could not detect tech stack from the provided files. Try including files like package.json, tsconfig.json, requirements.txt, etc.' }]
        };
      }

      const lines = ['# Detected Project Context', '', '## Tech Stack', ''];
      for (const d of detected) {
        const pct = Math.round(d.confidence * 100);
        lines.push(`- **${d.stack}** (${pct}% confidence)`);
      }

      lines.push('', '## Recommended Prompts', '');

      const seenPrompts = new Set<string>();
      for (const d of detected) {
        for (const promptId of d.prompts) {
          if (seenPrompts.has(promptId)) continue;
          seenPrompts.add(promptId);

          const item = library.getItem(promptId);
          if (item) {
            lines.push(`- **${item.metadata.title || item.name}** (\`${item.id}\`)`);
            if (item.metadata.description) {
              lines.push(`  ${item.metadata.description}`);
            }
          }
        }
      }

      lines.push('', '---', 'Use `get_prompt <id>` to fetch any of these.');
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
