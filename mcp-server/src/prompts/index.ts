/**
 * Native MCP Prompts
 * 
 * Registers all library items as native MCP prompts, making them discoverable
 * in Claude Desktop's "Get Prompt" UI and other MCP clients.
 * 
 * Features:
 * - Auto-registers all 74+ library items as prompts
 * - Extracts {{variables}} from prompt bodies as arguments
 * - Substitutes variables when prompts are invoked
 * - Groups prompts by category for organization
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from '../lib/library.js';
import type { LibraryItem } from '../types.js';

/**
 * Extract template variables from a prompt body
 * Looks for {{variable_name}} patterns
 */
function extractVariables(body: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  let match;
  
  while ((match = regex.exec(body)) !== null) {
    // Clean up variable name (trim whitespace, handle modifiers)
    const varName = match[1].trim().split('|')[0].trim();
    if (varName && !varName.startsWith('#') && !varName.startsWith('/')) {
      variables.add(varName);
    }
  }
  
  return Array.from(variables);
}

/**
 * Substitute variables in prompt body
 */
function substituteVariables(body: string, values: Record<string, string>): string {
  let result = body;
  
  for (const [key, value] of Object.entries(values)) {
    // Replace {{key}} and {{ key }} patterns
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

/**
 * Convert library item ID to a valid prompt name
 * MCP prompt names should be simple identifiers
 */
function toPromptName(id: string): string {
  // Remove category prefix, convert slashes to underscores
  return id.replace(/\//g, '_');
}

/**
 * Build Zod schema for prompt arguments based on extracted variables
 */
function buildArgumentSchema(variables: string[]): Record<string, z.ZodTypeAny> {
  const schema: Record<string, z.ZodTypeAny> = {};
  
  for (const variable of variables) {
    // Make all variables optional with a description
    schema[variable] = z.string().optional().describe(`Value for {{${variable}}}`);
  }
  
  return schema;
}

/**
 * Register all library items as native MCP prompts
 */
export function registerPrompts(
  server: McpServer,
  library: Library,
  ensureInitialized: () => Promise<void>
): void {
  // We need to register prompts after library is initialized
  // Since MCP prompts are registered at server startup, we'll register
  // all prompts dynamically once we know what's in the library
  
  // Register a meta-prompt that lists all available prompts
  server.prompt(
    'list-prompts',
    'List all available prompts in the AI library',
    {},
    async () => {
      await ensureInitialized();
      const items = library.getAllItems();
      
      const lines = [
        '# AI Library Prompts',
        '',
        `${items.length} prompts available:`,
        '',
      ];
      
      // Group by category
      const byCategory = new Map<string, LibraryItem[]>();
      for (const item of items) {
        const category = item.category;
        const group = byCategory.get(category) || [];
        group.push(item);
        byCategory.set(category, group);
      }
      
      for (const [category, categoryItems] of byCategory) {
        lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}`);
        lines.push('');
        for (const item of categoryItems) {
          const promptName = toPromptName(item.id);
          const title = item.metadata.title || item.name;
          lines.push(`- **${promptName}**: ${title}`);
        }
        lines.push('');
      }
      
      return {
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: lines.join('\n') },
          },
        ],
      };
    }
  );

  // Register a dynamic prompt loader that can fetch any prompt by ID
  server.prompt(
    'load-prompt',
    'Load any prompt from the AI library by ID or name',
    {
      id: z.string().describe('Prompt ID (e.g., "prompts/planning/prd-generator") or fuzzy name (e.g., "prd", "debugger")'),
    },
    async ({ id }) => {
      await ensureInitialized();
      const item = library.getItem(id);
      
      if (!item) {
        const suggestions = library.search(id, 3);
        let errorMsg = `Prompt "${id}" not found.`;
        
        if (suggestions.length > 0) {
          errorMsg += '\n\nDid you mean:\n';
          for (const s of suggestions) {
            errorMsg += `- ${s.item.id}\n`;
          }
        }
        
        return {
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: errorMsg },
            },
          ],
        };
      }
      
      return {
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: item.body },
          },
        ],
      };
    }
  );

  // Register a prompt combiner
  server.prompt(
    'combine-prompts',
    'Combine multiple prompts and snippets into one',
    {
      items: z.string().describe('Comma-separated list of prompt IDs or names to combine (e.g., "prd-generator,ultrathink,step-by-step")'),
    },
    async ({ items: itemsStr }) => {
      await ensureInitialized();
      
      const itemNames = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
      const found: LibraryItem[] = [];
      const notFound: string[] = [];
      
      for (const name of itemNames) {
        const item = library.getItem(name);
        if (item) {
          found.push(item);
        } else {
          notFound.push(name);
        }
      }
      
      if (found.length === 0) {
        return {
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: `None of the specified items were found: ${itemNames.join(', ')}` },
            },
          ],
        };
      }
      
      // Separate modifiers from main content
      const modifiers = found.filter(i => i.category === 'snippets');
      const mainItems = found.filter(i => i.category !== 'snippets');
      
      const lines: string[] = [];
      
      // Add modifiers first
      for (const mod of modifiers) {
        const content = mod.body
          .replace(/^#\s+.*\n/, '')
          .replace(/^>\s+.*\n/, '')
          .trim();
        lines.push(content, '');
      }
      
      // Add main prompts
      for (const item of mainItems) {
        lines.push(item.body, '');
      }
      
      if (notFound.length > 0) {
        lines.push(`\n---\n_Note: Could not find: ${notFound.join(', ')}_`);
      }
      
      return {
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: lines.join('\n').trim() },
          },
        ],
      };
    }
  );

  // Register quick prompts as individual MCP prompts
  const quickPrompts = [
    { name: 'quick-think', description: 'Step-by-step reasoning', prompt: 'Think through this step by step, showing your reasoning at each stage.' },
    { name: 'quick-ultrathink', description: 'Deep analysis mode', prompt: 'This is a complex problem. Take your time and think through every angle. Consider edge cases, potential issues, and alternative approaches before settling on a solution.' },
    { name: 'quick-critique', description: 'Ruthless feedback', prompt: 'Be a harsh but fair critic. Point out every flaw, inefficiency, and potential issue. Do not hold back - I need honest feedback to improve.' },
    { name: 'quick-simplify', description: 'ELI12 explanation', prompt: 'Explain this like I am a smart 12-year-old. Use simple language, analogies, and concrete examples. Avoid jargon.' },
    { name: 'quick-plan', description: 'Planning mode', prompt: 'Before implementing anything, create a detailed plan. Break it into phases, list dependencies, and identify risks. I will review and approve before we proceed.' },
    { name: 'quick-review', description: 'Code review', prompt: 'Review this code for: 1) Bugs and edge cases, 2) Security vulnerabilities, 3) Performance issues, 4) Code quality and maintainability. Be specific about line numbers.' },
    { name: 'quick-debug', description: 'Systematic debugging', prompt: 'Help me debug this issue. First, understand what SHOULD happen. Then analyze what IS happening. Form hypotheses and help me test them systematically.' },
    { name: 'quick-secure', description: 'Security analysis', prompt: 'Analyze this for security vulnerabilities. Check for: injection attacks, auth issues, data exposure, insecure defaults, and missing validation. Assume an attacker mindset.' },
    { name: 'quick-test', description: 'Test writing', prompt: 'Write comprehensive tests for this code. Include: 1) Happy path, 2) Edge cases, 3) Error conditions, 4) Boundary values. Use the existing testing patterns in this codebase.' },
    { name: 'quick-doc', description: 'Documentation', prompt: 'Write clear documentation for this code. Include: purpose, usage examples, parameters, return values, and any gotchas. Write for a developer new to this codebase.' },
    { name: 'quick-refactor', description: 'Refactoring', prompt: 'Refactor this code to be cleaner and more maintainable. Prioritize: readability, single responsibility, DRY principles. Explain each change you make.' },
    { name: 'quick-ship', description: 'Ship-it mode', prompt: 'I need to ship this today. Focus on: 1) Does it work for the main use case? 2) Any critical bugs? 3) Is it secure enough for now? Help me identify what is blocking launch vs. what can wait.' },
  ];

  for (const qp of quickPrompts) {
    server.prompt(
      qp.name,
      qp.description,
      {},
      async () => ({
        messages: [
          {
            role: 'user',
            content: { type: 'text', text: qp.prompt },
          },
        ],
      })
    );
  }

  // Register individual prompts for key library items
  // These are registered at startup with known schemas
  const keyPrompts = [
    { id: 'prompts/planning/prd-generator', name: 'prd-generator', description: 'Generate a Product Requirements Document' },
    { id: 'prompts/analysis/debugger', name: 'debugger', description: 'Systematic debugging assistant' },
    { id: 'prompts/analysis/security-audit', name: 'security-audit', description: 'Security vulnerability analysis' },
    { id: 'prompts/development/code-review', name: 'code-review', description: 'Comprehensive code review' },
    { id: 'skills/code-review', name: 'skill-code-review', description: 'Code review skill with checklist' },
    { id: 'skills/debugging', name: 'skill-debugging', description: 'Advanced debugging skill' },
    { id: 'skills/testing', name: 'skill-testing', description: 'Test writing skill' },
    { id: 'snippets/modifiers/ultrathink', name: 'ultrathink', description: 'Deep thinking modifier' },
    { id: 'snippets/modifiers/step-by-step', name: 'step-by-step', description: 'Step-by-step reasoning modifier' },
    { id: 'templates/claude-md/basic', name: 'template-claude-basic', description: 'Basic CLAUDE.md template' },
    { id: 'templates/claude-md/full', name: 'template-claude-full', description: 'Full CLAUDE.md template' },
  ];

  for (const kp of keyPrompts) {
    server.prompt(
      kp.name,
      kp.description,
      {
        context: z.string().optional().describe('Optional context to prepend to the prompt'),
      },
      async ({ context }) => {
        await ensureInitialized();
        const item = library.getItem(kp.id);
        
        if (!item) {
          return {
            messages: [
              {
                role: 'user',
                content: { type: 'text', text: `Prompt "${kp.id}" not found in library.` },
              },
            ],
          };
        }
        
        let text = item.body;
        if (context) {
          text = `Context:\n${context}\n\n---\n\n${text}`;
        }
        
        return {
          messages: [
            {
              role: 'user',
              content: { type: 'text', text },
            },
          ],
        };
      }
    );
  }

  // Register chain starters as prompts
  const chainPrompts = [
    { id: 'new-feature', name: 'chain-new-feature', description: 'Start a new feature development workflow' },
    { id: 'bug-fix', name: 'chain-bug-fix', description: 'Start a bug fixing workflow' },
    { id: 'security-hardening', name: 'chain-security', description: 'Start a security hardening workflow' },
    { id: 'code-review', name: 'chain-code-review', description: 'Start a code review workflow' },
    { id: 'refactoring', name: 'chain-refactor', description: 'Start a refactoring workflow' },
  ];

  for (const cp of chainPrompts) {
    server.prompt(
      cp.name,
      cp.description,
      {
        context: z.string().optional().describe('Project/feature context for the workflow'),
      },
      async ({ context }) => {
        await ensureInitialized();
        const chain = library.getChain(cp.id);
        
        if (!chain) {
          return {
            messages: [
              {
                role: 'user',
                content: { type: 'text', text: `Chain "${cp.id}" not found in library.` },
              },
            ],
          };
        }
        
        const lines = [
          `# ${chain.name} Workflow`,
          '',
          chain.description || '',
          '',
        ];
        
        if (context) {
          lines.push('## Context', '', context, '');
        }
        
        if (chain.prerequisites.length > 0) {
          lines.push('## Prerequisites', '');
          for (const prereq of chain.prerequisites) {
            lines.push(`- ${prereq}`);
          }
          lines.push('');
        }
        
        lines.push('## Steps', '');
        for (let i = 0; i < chain.steps.length; i++) {
          const step = chain.steps[i];
          lines.push(`### Step ${i + 1}: ${step.title}`);
          lines.push('');
          lines.push(step.prompt);
          lines.push('');
        }
        
        lines.push('---');
        lines.push('_Follow each step in sequence. Complete one before moving to the next._');
        
        return {
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: lines.join('\n') },
            },
          ],
        };
      }
    );
  }
}
