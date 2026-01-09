/**
 * AI Library MCP Server
 *
 * Exposes the AI prompt library through MCP protocol with:
 * - Resources: Browse prompts, templates, chains, etc.
 * - Tools: get_prompt, search_prompts, suggest_prompts, start_chain, save_prompt
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from './lib/library.js';
import { ChainManager } from './lib/chains.js';
import type { LibraryCategory, LibraryItem, Chain } from './types.js';

// Valid categories for validation
const VALID_CATEGORIES: LibraryCategory[] = [
  'prompts',
  'snippets',
  'templates',
  'skills',
  'instructions',
  'chains',
  'contexts',
  'examples',
];

/**
 * Create and configure the MCP server
 */
export function createServer(libraryPath: string, debug = false): McpServer {
  const server = new McpServer({
    name: 'ai-library',
    version: '1.0.0',
  });

  // Initialize library and chain manager
  const library = new Library(libraryPath, debug);
  const chainManager = new ChainManager(debug);

  // Debug logging
  const log = (...args: unknown[]) => {
    if (debug) console.error('[Server]', ...args);
  };

  // Initialize library on first use
  let initialized = false;
  const ensureInitialized = async () => {
    if (!initialized) {
      await library.initialize();
      initialized = true;
      log('Library initialized');
    }
  };

  // ============================================================
  // RESOURCES - Browse the library
  // ============================================================

  server.resource(
    'library://index',
    'Library Index',
    async () => {
      await ensureInitialized();
      const stats = library.getStats();

      const lines = [
        '# AI Library',
        '',
        `Total items: ${stats.total}`,
        '',
        '## Categories',
        '',
      ];

      for (const [category, count] of Object.entries(stats.byCategory)) {
        lines.push(`- **${category}**: ${count} items`);
      }

      lines.push('', '## Available Chains', '');
      for (const chain of library.getAllChains()) {
        lines.push(`- **${chain.name}**: ${chain.description}`);
      }

      return {
        contents: [
          {
            uri: 'library://index',
            mimeType: 'text/markdown',
            text: lines.join('\n'),
          },
        ],
      };
    }
  );

  // Register category resources
  for (const category of VALID_CATEGORIES) {
    server.resource(
      `library://${category}`,
      `${category.charAt(0).toUpperCase() + category.slice(1)} Library`,
      async () => {
        await ensureInitialized();
        const items = library.getByCategory(category);

        const lines = [
          `# ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          '',
          `${items.length} items available`,
          '',
        ];

        // Group by subcategory
        const bySubcategory = new Map<string, LibraryItem[]>();
        for (const item of items) {
          const sub = item.subcategory || 'general';
          const group = bySubcategory.get(sub) || [];
          group.push(item);
          bySubcategory.set(sub, group);
        }

        for (const [subcategory, subItems] of bySubcategory) {
          lines.push(`## ${subcategory}`);
          lines.push('');
          for (const item of subItems) {
            const desc = item.metadata.description || '';
            lines.push(`- **${item.name}**: ${desc}`);
          }
          lines.push('');
        }

        return {
          contents: [
            {
              uri: `library://${category}`,
              mimeType: 'text/markdown',
              text: lines.join('\n'),
            },
          ],
        };
      }
    );
  }

  // ============================================================
  // TOOL: get_prompt - Fetch a prompt by ID or name
  // ============================================================

  server.tool(
    'get_prompt',
    'Fetch a prompt, template, or any item from the AI library by ID or fuzzy name match',
    {
      name: z.string().describe('The prompt ID (e.g., "prompts/planning/prd-generator") or fuzzy name (e.g., "prd", "debugger")'),
      format: z.enum(['full', 'body', 'prompt_only']).optional().describe('Output format: full (with metadata), body (content only), prompt_only (just the prompt text)'),
    },
    async ({ name, format = 'full' }) => {
      await ensureInitialized();

      const item = library.getItem(name);

      if (!item) {
        // Try to find similar items
        const suggestions = library.search(name, 3);
        let errorMsg = `Prompt "${name}" not found.`;

        if (suggestions.length > 0) {
          errorMsg += '\n\nDid you mean:\n';
          for (const s of suggestions) {
            errorMsg += `- ${s.item.id}\n`;
          }
        }

        return {
          content: [{ type: 'text', text: errorMsg }],
          isError: true,
        };
      }

      let output: string;

      switch (format) {
        case 'body':
          output = item.body;
          break;
        case 'prompt_only':
          // Extract just the prompt part (code blocks or main content)
          const promptMatch = item.body.match(/```[\s\S]*?([\s\S]+?)```/);
          output = promptMatch ? promptMatch[1].trim() : item.body;
          break;
        case 'full':
        default:
          output = [
            `# ${item.metadata.title || item.name}`,
            '',
            item.metadata.description ? `> ${item.metadata.description}` : '',
            '',
            `**Category:** ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`,
            item.metadata.tags?.length ? `**Tags:** ${item.metadata.tags.join(', ')}` : '',
            '',
            '---',
            '',
            item.body,
          ]
            .filter(Boolean)
            .join('\n');
      }

      return {
        content: [{ type: 'text', text: output }],
      };
    }
  );

  // ============================================================
  // TOOL: search_prompts - Search the library
  // ============================================================

  server.tool(
    'search_prompts',
    'Search the AI library for prompts, templates, snippets, etc. matching keywords',
    {
      query: z.string().describe('Search keywords (e.g., "security", "testing", "refactor")'),
      category: z.string().optional().describe('Filter by category (prompts, snippets, templates, skills, instructions, chains, contexts, examples)'),
      limit: z.number().optional().describe('Maximum results to return (default: 10)'),
    },
    async ({ query, category, limit = 10 }) => {
      await ensureInitialized();

      let results = library.search(query, limit * 2); // Get extra to allow filtering

      // Filter by category if specified
      if (category && VALID_CATEGORIES.includes(category as LibraryCategory)) {
        results = results.filter((r) => r.item.category === category);
      }

      results = results.slice(0, limit);

      if (results.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No results found for "${query}"${category ? ` in ${category}` : ''}.`,
            },
          ],
        };
      }

      const lines = [
        `# Search Results for "${query}"`,
        '',
        `Found ${results.length} items:`,
        '',
      ];

      for (const result of results) {
        const item = result.item;
        const score = Math.round(result.score * 100) / 100;
        lines.push(`## ${item.metadata.title || item.name}`);
        lines.push(`**ID:** \`${item.id}\``);
        lines.push(
          `**Category:** ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`
        );
        if (item.metadata.description) {
          lines.push(`> ${item.metadata.description}`);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('Use `get_prompt` with the ID to fetch the full content.');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: suggest_prompts - AI-powered suggestions based on intent
  // ============================================================

  server.tool(
    'suggest_prompts',
    'Get intelligent prompt suggestions based on what you are trying to do. Detects intent from your message and recommends relevant prompts, templates, and chains.',
    {
      message: z.string().describe('Describe what you are working on or trying to accomplish (e.g., "I need to build a new authentication feature", "stuck on a bug", "preparing for production launch")'),
      limit: z.number().optional().describe('Maximum suggestions to return (default: 5)'),
    },
    async ({ message, limit = 5 }) => {
      await ensureInitialized();

      const suggestions = library.suggest(message, limit);

      if (suggestions.length === 0) {
        // Fall back to search
        const searchResults = library.search(message, 3);

        if (searchResults.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No suggestions found. Try being more specific about what you are working on.',
              },
            ],
          };
        }

        const lines = [
          "# Suggestions (from search)",
          '',
          "Couldn't detect a specific intent, but here are some relevant items:",
          '',
        ];

        for (const result of searchResults) {
          lines.push(`- **${result.item.name}** (\`${result.item.id}\`)`);
        }

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      }

      const lines = [
        '# Recommended Prompts',
        '',
        `Based on your message, here are ${suggestions.length} suggestions:`,
        '',
      ];

      for (let i = 0; i < suggestions.length; i++) {
        const s = suggestions[i];
        const confidence = Math.round(s.confidence * 100);
        lines.push(`## ${i + 1}. ${s.item.metadata.title || s.item.name}`);
        lines.push(`**ID:** \`${s.item.id}\``);
        lines.push(`**Why:** ${s.reason} (${confidence}% confidence)`);
        if (s.item.metadata.description) {
          lines.push(`> ${s.item.metadata.description}`);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('Use `get_prompt <id>` to fetch any of these.');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: list_chains - List available workflow chains
  // ============================================================

  server.tool(
    'list_chains',
    'List all available workflow chains in the library',
    {},
    async () => {
      await ensureInitialized();

      const chains = library.getAllChains();

      if (chains.length === 0) {
        return {
          content: [{ type: 'text', text: 'No chains found in the library.' }],
        };
      }

      const lines = [
        '# Available Workflow Chains',
        '',
        'Multi-step workflows for common development tasks:',
        '',
      ];

      for (const chain of chains) {
        lines.push(`## ${chain.name}`);
        lines.push(`**ID:** \`${chain.id}\``);
        lines.push(`**Steps:** ${chain.steps.length}`);
        if (chain.description) {
          lines.push(`> ${chain.description}`);
        }
        if (chain.overview) {
          lines.push(`\`\`\`\n${chain.overview}\n\`\`\``);
        }
        lines.push('');
      }

      lines.push('---');
      lines.push('Use `start_chain <chain_id>` to begin a workflow.');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: start_chain - Begin a workflow chain
  // ============================================================

  server.tool(
    'start_chain',
    'Start a multi-step workflow chain. Chains guide you through complex processes like building features, fixing bugs, or security hardening.',
    {
      chain: z.string().describe('Chain ID or name (e.g., "new-feature", "bug-fix", "security-hardening")'),
      context: z.record(z.string()).optional().describe('Key-value pairs for variable substitution in prompts (e.g., {"feature": "user auth", "stack": "Next.js"})'),
    },
    async ({ chain: chainName, context = {} }) => {
      await ensureInitialized();

      const chain = library.getChain(chainName);

      if (!chain) {
        const allChains = library.getAllChains();
        let errorMsg = `Chain "${chainName}" not found.`;

        if (allChains.length > 0) {
          errorMsg += '\n\nAvailable chains:\n';
          for (const c of allChains) {
            errorMsg += `- ${c.id} (${c.name})\n`;
          }
        }

        return {
          content: [{ type: 'text', text: errorMsg }],
          isError: true,
        };
      }

      // Start the session
      const session = chainManager.startChain(chain, context);
      const currentStep = chainManager.getCurrentStep(session, chain);

      const lines = [
        `# Started Chain: ${chain.name}`,
        '',
        chainManager.formatSessionStatus(session),
        '',
      ];

      if (chain.prerequisites.length > 0) {
        lines.push('## Prerequisites');
        for (const prereq of chain.prerequisites) {
          lines.push(`- ${prereq}`);
        }
        lines.push('');
      }

      if (currentStep) {
        lines.push(chainManager.formatStep(currentStep, session));
      }

      lines.push('---');
      lines.push(`**Session ID:** \`${session.id}\``);
      lines.push('');
      lines.push('Commands:');
      lines.push('- `chain_next` - Advance to next step');
      lines.push('- `chain_status` - View current progress');
      lines.push('- `chain_step <number>` - Jump to specific step');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: chain_next - Advance chain to next step
  // ============================================================

  server.tool(
    'chain_next',
    'Advance to the next step in an active chain session',
    {
      session_id: z.string().describe('The session ID from start_chain'),
    },
    async ({ session_id }) => {
      await ensureInitialized();

      const session = chainManager.getSession(session_id);
      if (!session) {
        return {
          content: [{ type: 'text', text: `Session "${session_id}" not found.` }],
          isError: true,
        };
      }

      const chain = library.getChain(session.chainId);
      if (!chain) {
        return {
          content: [{ type: 'text', text: 'Chain no longer exists.' }],
          isError: true,
        };
      }

      // Check if already at last step
      if (session.currentStep >= session.totalSteps) {
        chainManager.endSession(session_id);
        return {
          content: [
            {
              type: 'text',
              text: `# Chain Complete!\n\nYou have completed all ${session.totalSteps} steps of "${chain.name}".\n\nSession ended.`,
            },
          ],
        };
      }

      // Advance
      const updatedSession = chainManager.advanceStep(session_id);
      if (!updatedSession) {
        return {
          content: [{ type: 'text', text: 'Failed to advance step.' }],
          isError: true,
        };
      }

      const currentStep = chainManager.getCurrentStep(updatedSession, chain);

      const lines = [
        chainManager.formatSessionStatus(updatedSession),
        '',
      ];

      if (currentStep) {
        lines.push(chainManager.formatStep(currentStep, updatedSession));
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: chain_status - View current chain progress
  // ============================================================

  server.tool(
    'chain_status',
    'View the current status and step of an active chain session',
    {
      session_id: z.string().optional().describe('Session ID (if not provided, shows all active sessions)'),
    },
    async ({ session_id }) => {
      await ensureInitialized();

      if (session_id) {
        const session = chainManager.getSession(session_id);
        if (!session) {
          return {
            content: [{ type: 'text', text: `Session "${session_id}" not found.` }],
            isError: true,
          };
        }

        const chain = library.getChain(session.chainId);

        const lines = [
          `# Chain Status: ${session.chainName}`,
          '',
          chainManager.formatSessionStatus(session),
          '',
        ];

        if (chain) {
          const currentStep = chainManager.getCurrentStep(session, chain);
          if (currentStep) {
            lines.push('## Current Step');
            lines.push(chainManager.formatStep(currentStep, session));
          }
        }

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      }

      // Show all sessions
      const sessions = chainManager.getAllSessions();

      if (sessions.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No active chain sessions.\n\nUse `start_chain <chain_id>` to begin a workflow.',
            },
          ],
        };
      }

      const lines = ['# Active Chain Sessions', ''];

      for (const session of sessions) {
        lines.push(`## ${session.chainName}`);
        lines.push(`**Session:** \`${session.id}\``);
        lines.push(
          `**Step:** ${session.currentStep}/${session.totalSteps}`
        );
        lines.push(`**Started:** ${session.startedAt.toISOString()}`);
        lines.push('');
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: save_to_library - Save a new prompt
  // ============================================================

  server.tool(
    'save_to_library',
    'Save a new prompt, snippet, or template to the AI library for future use',
    {
      category: z.enum(['prompts', 'snippets', 'templates', 'skills', 'instructions', 'contexts', 'examples']).describe('Category to save to'),
      subcategory: z.string().optional().describe('Subcategory (e.g., "planning" for prompts, "modifiers" for snippets)'),
      name: z.string().describe('File name (without .md extension)'),
      content: z.string().describe('The markdown content to save'),
      title: z.string().optional().describe('Title for the item'),
      description: z.string().optional().describe('Brief description'),
      tags: z.array(z.string()).optional().describe('Tags for searchability'),
    },
    async ({ category, subcategory, name, content, title, description, tags }) => {
      await ensureInitialized();

      // Build metadata
      const metadata: Record<string, unknown> = {};
      if (title) metadata.title = title;
      if (description) metadata.description = description;
      if (tags?.length) metadata.tags = tags;

      const item = library.savePrompt({
        category,
        subcategory,
        name: name.replace(/\.md$/, '').replace(/[^a-zA-Z0-9-_]/g, '-'),
        content,
        metadata,
      });

      if (!item) {
        return {
          content: [{ type: 'text', text: 'Failed to save prompt.' }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: [
              '# Saved to Library',
              '',
              `**ID:** \`${item.id}\``,
              `**Path:** ${item.relativePath}`,
              '',
              'The item is now available in your AI library and will be included in future searches and suggestions.',
            ].join('\n'),
          },
        ],
      };
    }
  );

  // ============================================================
  // TOOL: library_stats - Get library statistics
  // ============================================================

  server.tool(
    'library_stats',
    'Get statistics about the AI library',
    {},
    async () => {
      await ensureInitialized();

      const stats = library.getStats();
      const chainStats = chainManager.getStats();

      const lines = [
        '# AI Library Statistics',
        '',
        `**Total Items:** ${stats.total}`,
        '',
        '## By Category',
        '',
      ];

      for (const [category, count] of Object.entries(stats.byCategory)) {
        lines.push(`- **${category}:** ${count}`);
      }

      lines.push('');
      lines.push('## Active Sessions');
      lines.push(`**Active Chains:** ${chainStats.active}`);

      if (chainStats.active > 0) {
        for (const [chain, count] of Object.entries(chainStats.byChain)) {
          lines.push(`- ${chain}: ${count} session(s)`);
        }
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: compose_prompt - Combine multiple prompts/snippets
  // ============================================================

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
          content: [
            {
              type: 'text',
              text: `None of the specified items were found: ${items.join(', ')}`,
            },
          ],
          isError: true,
        };
      }

      // Separate modifiers/snippets from main content
      const modifiers = found.filter((i) => i.category === 'snippets');
      const mainItems = found.filter((i) => i.category !== 'snippets');

      const lines: string[] = [];

      if (include_metadata) {
        lines.push('# Composed Prompt');
        lines.push('');
        lines.push(`**Components:** ${found.map((i) => i.name).join(' + ')}`);
        if (notFound.length > 0) {
          lines.push(`**Not found:** ${notFound.join(', ')}`);
        }
        lines.push('');
        lines.push('---');
        lines.push('');
      }

      // Add modifiers first (they apply to everything)
      for (const mod of modifiers) {
        const content = mod.body
          .replace(/^#\s+.*\n/, '') // Remove H1
          .replace(/^>\s+.*\n/, '') // Remove blockquote description
          .trim();
        lines.push(content);
        lines.push('');
      }

      // Add main prompts
      for (let i = 0; i < mainItems.length; i++) {
        const item = mainItems[i];
        if (mainItems.length > 1 && include_metadata) {
          lines.push(`## ${item.metadata.title || item.name}`);
          lines.push('');
        }
        lines.push(item.body);
        if (i < mainItems.length - 1) {
          lines.push('');
          lines.push('---');
          lines.push('');
        }
      }

      const result = lines.join('\n').trim();

      return {
        content: [{ type: 'text', text: result }],
      };
    }
  );

  // ============================================================
  // TOOL: quick_prompt - Common prompt shortcuts
  // ============================================================

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

  server.tool(
    'quick_prompt',
    'Get a quick, ready-to-use prompt modifier. These are one-liner prompts for common needs like "ultrathink", "critique", "debug", etc.',
    {
      name: z.string().describe('Quick prompt name: think, ultrathink, critique, simplify, plan, review, debug, secure, test, doc, refactor, ship'),
      list: z.boolean().optional().describe('If true, list all available quick prompts instead'),
    },
    async ({ name, list }) => {
      if (list) {
        const lines = [
          '# Quick Prompts',
          '',
          'One-liner prompts for common needs:',
          '',
        ];

        for (const [key, value] of Object.entries(QUICK_PROMPTS)) {
          lines.push(`**${key}**: ${value.description}`);
        }

        lines.push('');
        lines.push('Use: `quick_prompt name="<name>"`');

        return {
          content: [{ type: 'text', text: lines.join('\n') }],
        };
      }

      const quickPrompt = QUICK_PROMPTS[name.toLowerCase()];

      if (!quickPrompt) {
        const available = Object.keys(QUICK_PROMPTS).join(', ');
        return {
          content: [
            {
              type: 'text',
              text: `Quick prompt "${name}" not found.\n\nAvailable: ${available}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [{ type: 'text', text: quickPrompt.prompt }],
      };
    }
  );

  // ============================================================
  // TOOL: detect_context - Detect project context from files
  // ============================================================

  server.tool(
    'detect_context',
    'Analyze project files to detect the tech stack and suggest relevant prompts. Pass a list of file names or extensions found in your project.',
    {
      files: z.array(z.string()).describe('List of file names or paths from the project (e.g., ["package.json", "next.config.js", "prisma/schema.prisma"])'),
    },
    async ({ files }) => {
      await ensureInitialized();

      const detected: { stack: string; confidence: number; prompts: string[] }[] = [];

      // Detection patterns
      const patterns = [
        {
          stack: 'Next.js',
          indicators: ['next.config.js', 'next.config.ts', 'next.config.mjs', '.next', 'app/layout.tsx', 'pages/_app.tsx'],
          prompts: ['contexts/stacks/nextjs-14', 'instructions/standards/nextjs', 'instructions/standards/react'],
        },
        {
          stack: 'React',
          indicators: ['react', 'jsx', 'tsx', 'vite.config.ts', 'create-react-app'],
          prompts: ['instructions/standards/react', 'instructions/standards/typescript'],
        },
        {
          stack: 'TypeScript',
          indicators: ['tsconfig.json', '.ts', '.tsx'],
          prompts: ['instructions/standards/typescript'],
        },
        {
          stack: 'Node.js',
          indicators: ['package.json', 'node_modules', '.nvmrc', '.node-version'],
          prompts: ['instructions/standards/nodejs'],
        },
        {
          stack: 'Python',
          indicators: ['requirements.txt', 'pyproject.toml', 'setup.py', '.py', 'Pipfile', 'poetry.lock'],
          prompts: ['instructions/standards/python'],
        },
        {
          stack: 'FastAPI',
          indicators: ['fastapi', 'uvicorn', 'main.py'],
          prompts: ['contexts/stacks/fastapi', 'instructions/standards/fastapi', 'instructions/standards/python'],
        },
        {
          stack: 'Prisma',
          indicators: ['prisma', 'schema.prisma', '.prisma'],
          prompts: ['contexts/stacks/prisma', 'contexts/patterns/repository-pattern'],
        },
        {
          stack: 'Docker',
          indicators: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'],
          prompts: ['instructions/personas/devops-engineer'],
        },
        {
          stack: 'Testing',
          indicators: ['jest.config', 'vitest.config', 'pytest.ini', '.test.', '.spec.', '__tests__'],
          prompts: ['skills/testing', 'instructions/workflows/tdd'],
        },
      ];

      const fileStr = files.join(' ').toLowerCase();

      for (const pattern of patterns) {
        const matches = pattern.indicators.filter((ind) => fileStr.includes(ind.toLowerCase()));
        if (matches.length > 0) {
          const confidence = Math.min(0.95, 0.5 + matches.length * 0.15);
          detected.push({
            stack: pattern.stack,
            confidence,
            prompts: pattern.prompts,
          });
        }
      }

      // Sort by confidence
      detected.sort((a, b) => b.confidence - a.confidence);

      if (detected.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'Could not detect tech stack from the provided files. Try including files like package.json, tsconfig.json, requirements.txt, etc.',
            },
          ],
        };
      }

      const lines = [
        '# Detected Project Context',
        '',
        '## Tech Stack',
        '',
      ];

      for (const d of detected) {
        const pct = Math.round(d.confidence * 100);
        lines.push(`- **${d.stack}** (${pct}% confidence)`);
      }

      lines.push('');
      lines.push('## Recommended Prompts');
      lines.push('');

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

      lines.push('');
      lines.push('---');
      lines.push('Use `get_prompt <id>` to fetch any of these.');

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  // ============================================================
  // TOOL: random_prompt - Get a random prompt for inspiration
  // ============================================================

  server.tool(
    'random_prompt',
    'Get a random prompt from the library for inspiration or exploration',
    {
      category: z.string().optional().describe('Filter by category (prompts, snippets, templates, skills, instructions, chains, contexts, examples)'),
    },
    async ({ category }) => {
      await ensureInitialized();

      let items = library.getAllItems();

      if (category && VALID_CATEGORIES.includes(category as LibraryCategory)) {
        items = items.filter((i) => i.category === category);
      }

      if (items.length === 0) {
        return {
          content: [{ type: 'text', text: 'No items found.' }],
        };
      }

      const item = items[Math.floor(Math.random() * items.length)];

      const lines = [
        '# Random Prompt',
        '',
        `**${item.metadata.title || item.name}**`,
        '',
        `**ID:** \`${item.id}\``,
        `**Category:** ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`,
        '',
      ];

      if (item.metadata.description) {
        lines.push(`> ${item.metadata.description}`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
      lines.push(item.body);

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      };
    }
  );

  return server;
}
