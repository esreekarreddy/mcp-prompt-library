/**
 * AI Library MCP Server
 *
 * Exposes the AI prompt library through MCP protocol with:
 * - Resources: Browse prompts, templates, chains, etc.
 * - Tools: get_prompt, search_prompts, suggest_prompts, start_chain, save_prompt, etc.
 * - Prompts: Native MCP prompts for all library items
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Library } from './lib/library.js';
import { ChainManager } from './lib/chains.js';
import type { LibraryCategory, LibraryItem } from './types.js';

// Import modular tool registrations
import { registerLibraryTools } from './tools/library.js';
import { registerChainTools } from './tools/chains.js';
import { registerUtilityTools } from './tools/utils.js';
import { registerPrompts } from './prompts/index.js';

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
  // TOOLS - Register all modular tools
  // ============================================================

  log('Registering library tools...');
  registerLibraryTools(server, library, ensureInitialized);

  log('Registering chain tools...');
  registerChainTools(server, library, chainManager, ensureInitialized);

  log('Registering utility tools...');
  registerUtilityTools(server, library, ensureInitialized);

  // ============================================================
  // PROMPTS - Native MCP prompts for all library items
  // ============================================================

  log('Registering native prompts...');
  registerPrompts(server, library, ensureInitialized);

  log('Server configuration complete');
  return server;
}
