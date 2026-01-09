import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from '../lib/library.js';
import type { LibraryCategory } from '../types.js';

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

export function registerLibraryTools(server: McpServer, library: Library, ensureInitialized: () => Promise<void>) {
  // get_prompt
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
        const suggestions = library.search(name, 3);
        let errorMsg = `Prompt "${name}" not found.`;
        if (suggestions.length > 0) {
          errorMsg += '\n\nDid you mean:\n';
          for (const s of suggestions) {
            errorMsg += `- ${s.item.id}\n`;
          }
        }
        return { content: [{ type: 'text', text: errorMsg }], isError: true };
      }

      let output: string;
      switch (format) {
        case 'body':
          output = item.body;
          break;
        case 'prompt_only':
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
          ].filter(Boolean).join('\n');
      }

      return { content: [{ type: 'text', text: output }] };
    }
  );

  // search_prompts
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
      let results = library.search(query, limit * 2);
      if (category && VALID_CATEGORIES.includes(category as LibraryCategory)) {
        results = results.filter((r) => r.item.category === category);
      }
      results = results.slice(0, limit);

      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No results found for "${query}"${category ? ` in ${category}` : ''}.` }] };
      }

      const lines = [`# Search Results for "${query}"`, '', `Found ${results.length} items:`, ''];
      for (const result of results) {
        const item = result.item;
        lines.push(`## ${item.metadata.title || item.name}`);
        lines.push(`**ID:** \`${item.id}\``);
        lines.push(`**Category:** ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`);
        if (item.metadata.description) lines.push(`> ${item.metadata.description}`);
        lines.push('');
      }
      lines.push('---', 'Use `get_prompt` with the ID to fetch the full content.');
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // suggest_prompts
  server.tool(
    'suggest_prompts',
    'Get intelligent prompt suggestions based on what you are trying to do.',
    {
      message: z.string().describe('Describe what you are working on (e.g., "I need to build a new authentication feature")'),
      limit: z.number().optional().describe('Maximum suggestions to return (default: 5)'),
    },
    async ({ message, limit = 5 }) => {
      await ensureInitialized();
      const suggestions = library.suggest(message, limit);

      if (suggestions.length === 0) {
        const searchResults = library.search(message, 3);
        if (searchResults.length === 0) {
          return { content: [{ type: 'text', text: 'No suggestions found. Try being more specific.' }] };
        }
        const lines = ["# Suggestions (from search)", '', "Couldn't detect a specific intent, but here are some relevant items:", ''];
        for (const result of searchResults) {
          lines.push(`- **${result.item.name}** (\`${result.item.id}\`)`);
        }
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      const lines = ['# Recommended Prompts', '', `Based on your message, here are ${suggestions.length} suggestions:`, ''];
      for (let i = 0; i < suggestions.length; i++) {
        const s = suggestions[i];
        const confidence = Math.round(s.confidence * 100);
        lines.push(`## ${i + 1}. ${s.item.metadata.title || s.item.name}`);
        lines.push(`**ID:** \`${s.item.id}\``);
        lines.push(`**Why:** ${s.reason} (${confidence}% confidence)`);
        if (s.item.metadata.description) lines.push(`> ${s.item.metadata.description}`);
        lines.push('');
      }
      lines.push('---', 'Use `get_prompt <id>` to fetch any of these.');
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // save_to_library
  server.tool(
    'save_to_library',
    'Save a new prompt, snippet, or template to the AI library for future use',
    {
      category: z.enum(['prompts', 'snippets', 'templates', 'skills', 'instructions', 'contexts', 'examples']),
      subcategory: z.string().optional(),
      name: z.string(),
      content: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    async ({ category, subcategory, name, content, title, description, tags }) => {
      await ensureInitialized();
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

      if (!item) return { content: [{ type: 'text', text: 'Failed to save prompt.' }], isError: true };
      return {
        content: [{
          type: 'text',
          text: `# Saved to Library\n\n**ID:** \`${item.id}\`\n**Path:** ${item.relativePath}\n\nThe item is now available in your AI library.`
        }],
      };
    }
  );

  // library_stats
  server.tool(
    'library_stats',
    'Get statistics about the AI library',
    {},
    async () => {
      await ensureInitialized();
      const stats = library.getStats();
      const lines = ['# AI Library Statistics', '', `**Total Items:** ${stats.total}`, '', '## By Category', ''];
      for (const [category, count] of Object.entries(stats.byCategory)) {
        lines.push(`- **${category}:** ${count}`);
      }
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // random_prompt
  server.tool(
    'random_prompt',
    'Get a random prompt from the library',
    {
      category: z.string().optional(),
    },
    async ({ category }) => {
      await ensureInitialized();
      let items = library.getAllItems();
      if (category && VALID_CATEGORIES.includes(category as LibraryCategory)) {
        items = items.filter((i) => i.category === category);
      }
      if (items.length === 0) return { content: [{ type: 'text', text: 'No items found.' }] };

      const item = items[Math.floor(Math.random() * items.length)];
      const lines = [
        '# Random Prompt', '', `**${item.metadata.title || item.name}**`, '',
        `**ID:** \`${item.id}\``,
        `**Category:** ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`, '',
      ];
      if (item.metadata.description) lines.push(`> ${item.metadata.description}`, '');
      lines.push('---', '', item.body);
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
