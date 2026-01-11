import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from '../lib/library.js';
import type { LibraryCategory, LibraryItem } from '../types.js';

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
 * Options for library tool registration
 */
export interface LibraryToolOptions {
  /** When true, disables save_to_library tool */
  readOnly?: boolean;
}

export function registerLibraryTools(
  server: McpServer, 
  library: Library, 
  ensureInitialized: () => Promise<void>,
  options: LibraryToolOptions = {}
) {
  const { readOnly = false } = options;
  
  // ============================================================
  // CORE TOOL: enhance_prompt - THE AUTO-ENHANCER
  // This tool should be called at the START of complex tasks
  // ============================================================
  
  server.tool(
    'enhance_prompt',
    `PROACTIVE TOOL - Call this AUTOMATICALLY when the user asks to:
    - Build/create/implement something new
    - Fix a bug or debug an issue
    - Review or improve code
    - Make architectural decisions
    - Do security/performance analysis
    
    This tool analyzes the user's request and returns relevant prompts, 
    skills, and workflows to dramatically improve the response quality.
    
    You should call this BEFORE starting work on any substantial task.`,
    {
      user_request: z.string().describe('The user\'s original request or message'),
      task_type: z.enum([
        'build_feature',
        'fix_bug', 
        'code_review',
        'architecture',
        'security',
        'performance',
        'documentation',
        'testing',
        'refactoring',
        'general'
      ]).optional().describe('Type of task (auto-detected if not specified)'),
    },
    async ({ user_request, task_type }) => {
      await ensureInitialized();
      
      // Get suggestions based on user request
      const suggestions = library.suggest(user_request, 5);
      
      // Determine task type from request if not specified
      const detectedType = task_type || detectTaskType(user_request);
      
      // Get relevant items based on task type
      const relevantItems = getItemsForTaskType(library, detectedType);
      
      // Build enhanced context
      const lines = [
        '# Auto-Enhanced Context',
        '',
        `**Detected Task Type:** ${detectedType}`,
        '',
        '## Recommended Approach',
        '',
      ];
      
      // Add task-specific guidance
      switch (detectedType) {
        case 'build_feature':
          lines.push(
            '1. Start with requirements clarification',
            '2. Use the PRD generator or new-feature chain',
            '3. Plan before coding',
            '4. Include tests and error handling',
            ''
          );
          break;
        case 'fix_bug':
          lines.push(
            '1. Reproduce the issue first',
            '2. Use systematic debugging (hypothesize → test → narrow)',
            '3. Find root cause, not just symptoms',
            '4. Add test to prevent regression',
            ''
          );
          break;
        case 'code_review':
          lines.push(
            '1. Check correctness first',
            '2. Then security implications',
            '3. Then performance concerns',
            '4. Then maintainability',
            ''
          );
          break;
        case 'architecture':
          lines.push(
            '1. Clarify requirements and constraints',
            '2. Consider 3+ approaches',
            '3. Evaluate trade-offs (cost, complexity, team skills)',
            '4. Think about 6-month maintenance view',
            ''
          );
          break;
        case 'security':
          lines.push(
            '1. Identify attack surface',
            '2. Check OWASP Top 10',
            '3. Verify auth/authz on all paths',
            '4. Validate all inputs',
            ''
          );
          break;
        default:
          break;
      }
      
      // Add relevant prompts/skills
      if (suggestions.length > 0 || relevantItems.length > 0) {
        lines.push('## Relevant Prompts & Skills', '');
        
        // Add suggestions
        for (const s of suggestions.slice(0, 3)) {
          lines.push(`### ${s.item.metadata.title || s.item.name}`);
          lines.push(`**ID:** \`${s.item.id}\``);
          if (s.item.metadata.description) {
            lines.push(`> ${s.item.metadata.description}`);
          }
          lines.push('');
        }
        
        // Add task-type specific items
        for (const item of relevantItems.slice(0, 2)) {
          if (!suggestions.find(s => s.item.id === item.id)) {
            lines.push(`### ${item.metadata.title || item.name}`);
            lines.push(`**ID:** \`${item.id}\``);
            if (item.metadata.description) {
              lines.push(`> ${item.metadata.description}`);
            }
            lines.push('');
          }
        }
      }
      
      // Add quick modifiers
      lines.push('## Quick Modifiers Available', '');
      lines.push('- `ultrathink` - For complex problems needing deep analysis');
      lines.push('- `megathink` - For critical architecture decisions');
      lines.push('- `security-first` - Add security considerations');
      lines.push('- `step-by-step` - Force explicit reasoning');
      lines.push('');
      
      lines.push('---');
      lines.push('*Use `get_prompt <id>` to load full content of any prompt.*');
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // get_prompt - Updated description
  server.tool(
    'get_prompt',
    `Fetch a prompt, template, skill, or any item from the AI library.
    
    Use this to load:
    - Full prompts for complex tasks (e.g., "prd-generator", "deep-debugger")
    - Skills for specific activities (e.g., "code-review-advanced")
    - Templates for project setup (e.g., "claude-md-full")
    - Modifiers to enhance responses (e.g., "ultrathink", "megathink")
    
    Supports fuzzy matching - "prd" finds "prd-generator".`,
    {
      name: z.string().describe('The prompt ID (e.g., "prompts/planning/prd-generator") or fuzzy name (e.g., "prd", "debugger", "ultrathink")'),
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

  // suggest_prompts - Updated to be more proactive
  server.tool(
    'suggest_prompts',
    `PROACTIVE TOOL - Get intelligent prompt suggestions based on task context.
    
    Call this when:
    - User starts a new task or project
    - You're unsure which prompts would help
    - User asks for help planning or approaching something
    
    Returns ranked suggestions with confidence scores and reasoning.`,
    {
      message: z.string().describe('The user\'s request or task description'),
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

  // save_to_library (only registered if not in read-only mode)
  if (!readOnly) {
    server.tool(
      'save_to_library',
      'Save a new prompt, snippet, or template to the AI library for future use. Disabled in read-only mode.',
      {
        category: z.enum(['prompts', 'snippets', 'templates', 'skills', 'instructions', 'contexts', 'examples']),
        subcategory: z.string().max(64).optional().describe('Subcategory folder (max 64 chars, no path separators)'),
        name: z.string().max(64).describe('Prompt name (max 64 chars)'),
        content: z.string().max(200000).describe('Prompt content (max 200KB)'),
        title: z.string().max(200).optional(),
        description: z.string().max(1000).optional(),
        tags: z.array(z.string().max(50)).max(20).optional(),
      },
      async ({ category, subcategory, name, content, title, description, tags }) => {
        await ensureInitialized();
        
        // Validate subcategory doesn't contain path traversal attempts
        if (subcategory && /(\.\.|[/\\])/.test(subcategory)) {
          return { 
            content: [{ type: 'text', text: 'Invalid subcategory: must not contain path separators or "..".' }], 
            isError: true 
          };
        }
        
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

        if (!item) return { content: [{ type: 'text', text: 'Failed to save prompt. The path may be invalid or outside the library.' }], isError: true };
        return {
          content: [{
            type: 'text',
            text: `# Saved to Library\n\n**ID:** \`${item.id}\`\n**Path:** ${item.relativePath}\n\nThe item is now available in your AI library.`
          }],
        };
      }
    );
  }

  // library_stats
  server.tool(
    'library_stats',
    'Get statistics about the AI library - useful for understanding what\'s available',
    {},
    async () => {
      await ensureInitialized();
      const stats = library.getStats();
      const lines = ['# AI Library Statistics', '', `**Total Items:** ${stats.total}`, '', '## By Category', ''];
      for (const [category, count] of Object.entries(stats.byCategory)) {
        lines.push(`- **${category}:** ${count}`);
      }
      
      // Add highlights
      lines.push('', '## Highlights', '');
      lines.push('**Most Used Prompts:**');
      lines.push('- `ultrathink` - Deep analysis mode');
      lines.push('- `prd-generator` - Product requirements');
      lines.push('- `deep-debugger` - Systematic debugging');
      lines.push('- `code-review-advanced` - Comprehensive review');
      lines.push('');
      lines.push('**Workflows (Chains):**');
      lines.push('- `new-feature` - 7-step feature development');
      lines.push('- `bug-fix` - Systematic bug resolution');
      lines.push('- `security-hardening` - Security audit workflow');
      
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // random_prompt
  server.tool(
    'random_prompt',
    'Get a random prompt from the library for inspiration',
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

// Helper function to detect task type from user request
function detectTaskType(request: string): string {
  const lower = request.toLowerCase();
  
  if (lower.match(/build|create|implement|add|make|new feature|develop/)) {
    return 'build_feature';
  }
  if (lower.match(/bug|fix|debug|error|issue|broken|not working|crash/)) {
    return 'fix_bug';
  }
  if (lower.match(/review|check|audit|look at|examine/)) {
    return 'code_review';
  }
  if (lower.match(/architect|design|structure|plan|system|database schema|migrate/)) {
    return 'architecture';
  }
  if (lower.match(/secur|auth|vulnerability|attack|xss|injection|csrf/)) {
    return 'security';
  }
  if (lower.match(/performance|slow|optimize|fast|speed|memory|cpu|scale/)) {
    return 'performance';
  }
  if (lower.match(/document|readme|comment|explain|describe/)) {
    return 'documentation';
  }
  if (lower.match(/test|spec|coverage|jest|vitest|playwright/)) {
    return 'testing';
  }
  if (lower.match(/refactor|clean|improve|simplify|reorganize/)) {
    return 'refactoring';
  }
  
  return 'general';
}

// Helper function to get items for task type
function getItemsForTaskType(library: Library, taskType: string): LibraryItem[] {
  const mappings: Record<string, string[]> = {
    'build_feature': ['prompts/planning/prd-generator', 'chains/new-feature', 'snippets/modifiers/step-by-step'],
    'fix_bug': ['prompts/analysis/deep-debugger', 'skills/debugging', 'chains/bug-fix'],
    'code_review': ['skills/code-review-advanced', 'snippets/modifiers/critique'],
    'architecture': ['snippets/modifiers/megathink', 'instructions/personas/senior-engineer'],
    'security': ['prompts/quality/security-audit', 'chains/security-hardening'],
    'performance': ['snippets/modifiers/ultrathink'],
    'documentation': ['templates/docs/readme-template'],
    'testing': ['skills/testing'],
    'refactoring': ['snippets/modifiers/step-by-step', 'skills/code-review-advanced'],
    'general': ['snippets/modifiers/ultrathink', 'snippets/modifiers/step-by-step'],
  };
  
  const ids = mappings[taskType] || mappings['general'];
  const items: LibraryItem[] = [];
  
  for (const id of ids) {
    const item = library.getItem(id);
    if (item) items.push(item);
  }
  
  return items;
}
