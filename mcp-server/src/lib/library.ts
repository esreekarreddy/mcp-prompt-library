/**
 * Library Manager - Scans, indexes, and provides access to the AI library
 */

import { readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, relative, dirname, basename, extname } from 'path';
import { glob } from 'glob';
import type {
  LibraryItem,
  LibraryCategory,
  LibraryIndex,
  SearchEntry,
  SearchResult,
  Chain,
  Suggestion,
  IntentPattern,
  SavePromptRequest,
  LibraryItemMetadata,
} from '../types.js';
import {
  parseMarkdown,
  extractTitle,
  extractDescription,
  createSearchableText,
  parseChain,
  fuzzyMatch,
  normalizeName,
} from './parser.js';

// Valid categories
const CATEGORIES: LibraryCategory[] = [
  'prompts',
  'snippets',
  'templates',
  'skills',
  'instructions',
  'chains',
  'contexts',
  'examples',
];

// Intent patterns for smart suggestions
const INTENT_PATTERNS: IntentPattern[] = [
  // Planning & starting
  {
    keywords: ['new feature', 'build', 'create', 'implement', 'add feature', 'start building'],
    intent: 'starting new feature',
    suggestedItems: ['prompts/planning/prd-generator', 'chains/new-feature', 'prompts/planning/implementation-plan'],
    priority: 10,
  },
  {
    keywords: ['architecture', 'design', 'structure', 'how should i', 'organize'],
    intent: 'architecture planning',
    suggestedItems: ['prompts/planning/architecture-analyzer', 'contexts/patterns/service-layer'],
    priority: 9,
  },
  {
    keywords: ['scope', 'too big', 'simplify', 'mvp', 'cut scope'],
    intent: 'scope reduction',
    suggestedItems: ['prompts/planning/scope-killer', 'snippets/constraints/mvp-only'],
    priority: 9,
  },

  // Development & debugging
  {
    keywords: ['bug', 'error', 'not working', 'broken', 'fix', 'debug', 'crash', 'stuck'],
    intent: 'debugging',
    suggestedItems: ['prompts/development/debugger', 'skills/debugging', 'chains/bug-fix'],
    priority: 10,
  },
  {
    keywords: ['refactor', 'clean up', 'improve code', 'tech debt', 'messy'],
    intent: 'refactoring',
    suggestedItems: ['prompts/development/code-cleaner', 'skills/refactoring', 'chains/refactor'],
    priority: 9,
  },
  {
    keywords: ['tech debt', 'technical debt', 'legacy', 'old code'],
    intent: 'tech debt audit',
    suggestedItems: ['prompts/development/tech-debt-audit', 'chains/refactor'],
    priority: 8,
  },

  // Quality & security
  {
    keywords: ['security', 'vulnerability', 'secure', 'auth', 'injection', 'xss'],
    intent: 'security review',
    suggestedItems: ['prompts/quality/security-audit', 'prompts/quality/security-fixer', 'chains/security-hardening'],
    priority: 10,
  },
  {
    keywords: ['test', 'testing', 'coverage', 'unit test', 'integration test'],
    intent: 'testing',
    suggestedItems: ['skills/testing', 'prompts/quality/critical-path-tester', 'instructions/workflows/tdd'],
    priority: 9,
  },
  {
    keywords: ['review', 'code review', 'pr review', 'pull request'],
    intent: 'code review',
    suggestedItems: ['skills/code-review', 'instructions/personas/code-reviewer', 'instructions/workflows/pr-review'],
    priority: 9,
  },
  {
    keywords: ['deploy', 'launch', 'production', 'go live', 'release'],
    intent: 'deployment',
    suggestedItems: ['prompts/quality/pre-launch-checklist', 'chains/production-launch'],
    priority: 10,
  },

  // Documentation
  {
    keywords: ['document', 'docs', 'readme', 'explain', 'api spec'],
    intent: 'documentation',
    suggestedItems: ['skills/documentation', 'templates/docs/api-spec-template'],
    priority: 7,
  },
  {
    keywords: ['pr description', 'pull request description', 'commit message'],
    intent: 'PR writing',
    suggestedItems: ['skills/pr-description'],
    priority: 8,
  },

  // Project setup
  {
    keywords: ['setup', 'new project', 'init', 'initialize', 'bootstrap', 'getting started'],
    intent: 'project setup',
    suggestedItems: ['skills/project-setup', 'templates/claude-md/comprehensive'],
    priority: 9,
  },
  {
    keywords: ['nextjs', 'next.js', 'next js', 'react'],
    intent: 'Next.js development',
    suggestedItems: ['contexts/stacks/nextjs-14', 'instructions/standards/nextjs', 'instructions/standards/react'],
    priority: 8,
  },
  {
    keywords: ['python', 'fastapi', 'flask', 'django'],
    intent: 'Python development',
    suggestedItems: ['contexts/stacks/fastapi', 'instructions/standards/python', 'instructions/standards/fastapi'],
    priority: 8,
  },
  {
    keywords: ['typescript', 'ts', 'node', 'nodejs'],
    intent: 'TypeScript/Node development',
    suggestedItems: ['instructions/standards/typescript', 'instructions/standards/nodejs'],
    priority: 8,
  },
  {
    keywords: ['prisma', 'database', 'db', 'orm'],
    intent: 'database work',
    suggestedItems: ['contexts/stacks/prisma', 'contexts/patterns/repository-pattern'],
    priority: 8,
  },

  // Thinking modes
  {
    keywords: ['think harder', 'think more', 'complex', 'difficult', 'tricky', 'hard problem'],
    intent: 'deep thinking',
    suggestedItems: ['snippets/modifiers/ultrathink', 'snippets/modifiers/be-thorough'],
    priority: 10,
  },
  {
    keywords: ['step by step', 'explain', 'walk through', 'show work'],
    intent: 'step-by-step',
    suggestedItems: ['snippets/modifiers/step-by-step', 'snippets/modifiers/explain-reasoning'],
    priority: 7,
  },
];

/**
 * The Library class manages the AI prompt library
 */
export class Library {
  private libraryPath: string;
  private index: LibraryIndex | null = null;
  private debug: boolean;

  constructor(libraryPath: string, debug = false) {
    this.libraryPath = libraryPath;
    this.debug = debug;
  }

  /**
   * Log debug messages
   */
  private log(...args: unknown[]): void {
    if (this.debug) {
      console.error('[Library]', ...args);
    }
  }

  /**
   * Initialize the library by scanning all files
   */
  async initialize(): Promise<void> {
    this.log('Initializing library from:', this.libraryPath);
    await this.scan();
  }

  /**
   * Scan the library directory and build the index
   */
  async scan(): Promise<void> {
    const items = new Map<string, LibraryItem>();
    const byCategory = new Map<LibraryCategory, LibraryItem[]>();
    const byTag = new Map<string, LibraryItem[]>();
    const chains = new Map<string, Chain>();
    const searchIndex: SearchEntry[] = [];

    // Initialize category maps
    for (const cat of CATEGORIES) {
      byCategory.set(cat, []);
    }

    // Find all markdown files
    const pattern = '**/*.md';
    const files = await glob(pattern, {
      cwd: this.libraryPath,
      ignore: ['node_modules/**', 'mcp-server/**', '.git/**'],
    });

    this.log(`Found ${files.length} markdown files`);

    for (const file of files) {
      // Skip index files
      if (file.endsWith('_index.md') || file === 'README.md') {
        continue;
      }

      const item = this.parseFile(file);
      if (item) {
        items.set(item.id, item);

        // Add to category index
        const categoryItems = byCategory.get(item.category) || [];
        categoryItems.push(item);
        byCategory.set(item.category, categoryItems);

        // Add to tag index
        for (const tag of item.metadata.tags || []) {
          const tagItems = byTag.get(tag) || [];
          tagItems.push(item);
          byTag.set(tag, tagItems);
        }

        // Add to search index
        searchIndex.push({
          id: item.id,
          text: item.searchableText,
          weight: this.calculateWeight(item),
        });

        // Parse chains
        if (item.category === 'chains') {
          try {
            const chain = parseChain(item);
            chains.set(item.id, chain);
          } catch (error) {
            this.log('Failed to parse chain:', item.id, error);
          }
        }
      }
    }

    this.index = {
      items,
      byCategory,
      byTag,
      chains,
      searchIndex,
    };

    this.log(`Indexed ${items.size} items, ${chains.size} chains`);
  }

  /**
   * Parse a single file into a LibraryItem
   */
  private parseFile(relativePath: string): LibraryItem | null {
    try {
      const fullPath = join(this.libraryPath, relativePath);
      const content = readFileSync(fullPath, 'utf-8');
      const stats = statSync(fullPath);

      // Extract category and subcategory from path
      const parts = relativePath.split('/');
      const category = parts[0] as LibraryCategory;

      if (!CATEGORIES.includes(category)) {
        return null;
      }

      const subcategory = parts.length > 2 ? parts[1] : undefined;
      const name = basename(relativePath, '.md');

      // Parse markdown
      const { metadata, body } = parseMarkdown(content);

      // Extract or use title
      const title = metadata.title || extractTitle(body) || name;
      const description = metadata.description || extractDescription(body);

      // Build ID
      const id = relativePath.replace(/\.md$/, '');

      const item: LibraryItem = {
        id,
        name,
        category,
        subcategory,
        path: fullPath,
        relativePath,
        content,
        body,
        metadata: {
          ...metadata,
          title,
          description,
        },
        searchableText: '',
        modifiedAt: stats.mtime,
      };

      // Create searchable text
      item.searchableText = createSearchableText(item);

      return item;
    } catch (error) {
      this.log('Failed to parse file:', relativePath, error);
      return null;
    }
  }

  /**
   * Calculate search weight for an item
   */
  private calculateWeight(item: LibraryItem): number {
    let weight = 1.0;

    // Prompts and chains are higher priority
    if (item.category === 'prompts') weight *= 1.5;
    if (item.category === 'chains') weight *= 1.4;
    if (item.category === 'skills') weight *= 1.3;

    // Items with more metadata are more useful
    if (item.metadata.tags?.length) weight *= 1.1;
    if (item.metadata.description) weight *= 1.1;

    return weight;
  }

  /**
   * Get all items
   */
  getAllItems(): LibraryItem[] {
    if (!this.index) return [];
    return Array.from(this.index.items.values());
  }

  /**
   * Get items by category
   */
  getByCategory(category: LibraryCategory): LibraryItem[] {
    if (!this.index) return [];
    return this.index.byCategory.get(category) || [];
  }

  /**
   * Get a single item by ID or fuzzy name
   */
  getItem(idOrName: string): LibraryItem | null {
    if (!this.index) return null;

    // Try exact ID match first
    const exactMatch = this.index.items.get(idOrName);
    if (exactMatch) return exactMatch;

    // Try with .md extension removed
    const withoutExt = idOrName.replace(/\.md$/, '');
    const withoutExtMatch = this.index.items.get(withoutExt);
    if (withoutExtMatch) return withoutExtMatch;

    // Try fuzzy matching on name
    let bestMatch: LibraryItem | null = null;
    let bestScore = 0;

    for (const item of this.index.items.values()) {
      // Match against ID
      const idScore = fuzzyMatch(idOrName, item.id);
      if (idScore > bestScore) {
        bestScore = idScore;
        bestMatch = item;
      }

      // Match against name
      const nameScore = fuzzyMatch(idOrName, item.name);
      if (nameScore > bestScore) {
        bestScore = nameScore;
        bestMatch = item;
      }

      // Match against aliases
      for (const alias of item.metadata.aliases || []) {
        const aliasScore = fuzzyMatch(idOrName, alias);
        if (aliasScore > bestScore) {
          bestScore = aliasScore;
          bestMatch = item;
        }
      }
    }

    // Only return if score is good enough
    return bestScore >= 0.5 ? bestMatch : null;
  }

  /**
   * Search for items matching a query
   */
  search(query: string, limit = 10): SearchResult[] {
    if (!this.index) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    const results: SearchResult[] = [];

    for (const entry of this.index.searchIndex) {
      const item = this.index.items.get(entry.id);
      if (!item) continue;

      let score = 0;
      const matches: string[] = [];

      // Check each query word
      for (const word of queryWords) {
        if (entry.text.includes(word)) {
          score += entry.weight;
          matches.push(word);
        }
      }

      // Bonus for name match
      if (normalizeName(item.name).includes(normalizedQuery)) {
        score *= 2;
      }

      // Bonus for title match
      if (item.metadata.title?.toLowerCase().includes(normalizedQuery)) {
        score *= 1.5;
      }

      if (score > 0) {
        results.push({ item, score, matches });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }

  /**
   * Get suggestions based on user intent/context
   */
  suggest(userMessage: string, limit = 5): Suggestion[] {
    if (!this.index) return [];

    const normalizedMessage = userMessage.toLowerCase();
    const suggestions: Suggestion[] = [];
    const seenIds = new Set<string>();

    // Check intent patterns
    for (const pattern of INTENT_PATTERNS) {
      const matchedKeywords = pattern.keywords.filter((kw) =>
        normalizedMessage.includes(kw)
      );

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(
          0.9,
          0.3 + matchedKeywords.length * 0.2 + pattern.priority * 0.03
        );

        for (const itemId of pattern.suggestedItems) {
          if (seenIds.has(itemId)) continue;
          seenIds.add(itemId);

          const item = this.index.items.get(itemId);
          if (item) {
            suggestions.push({
              item,
              reason: `Detected intent: ${pattern.intent}`,
              confidence,
            });
          }
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return suggestions.slice(0, limit);
  }

  /**
   * Get a chain by ID
   */
  getChain(idOrName: string): Chain | null {
    if (!this.index) return null;

    // Try exact match
    const exactMatch = this.index.chains.get(idOrName);
    if (exactMatch) return exactMatch;

    // Try with chains/ prefix
    const withPrefix = `chains/${idOrName}`;
    const prefixMatch = this.index.chains.get(withPrefix);
    if (prefixMatch) return prefixMatch;

    // Fuzzy match
    for (const [id, chain] of this.index.chains) {
      if (fuzzyMatch(idOrName, chain.name) >= 0.6) {
        return chain;
      }
    }

    return null;
  }

  /**
   * Get all chains
   */
  getAllChains(): Chain[] {
    if (!this.index) return [];
    return Array.from(this.index.chains.values());
  }

  /**
   * Save a new prompt to the library
   */
  savePrompt(request: SavePromptRequest): LibraryItem | null {
    const { category, subcategory, name, content, metadata } = request;

    // Build path
    let relativePath: string;
    if (subcategory) {
      relativePath = `${category}/${subcategory}/${name}.md`;
    } else {
      relativePath = `${category}/${name}.md`;
    }

    const fullPath = join(this.libraryPath, relativePath);

    // Ensure directory exists
    const dir = dirname(fullPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Build file content with frontmatter if metadata provided
    let fileContent = content;
    if (metadata && Object.keys(metadata).length > 0) {
      const frontmatter = Object.entries(metadata)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}:\n${value.map((v) => `  - ${v}`).join('\n')}`;
          }
          return `${key}: ${value}`;
        })
        .join('\n');
      fileContent = `---\n${frontmatter}\n---\n\n${content}`;
    }

    // Write file
    writeFileSync(fullPath, fileContent, 'utf-8');

    // Re-parse and add to index
    const item = this.parseFile(relativePath);
    if (item && this.index) {
      this.index.items.set(item.id, item);

      const categoryItems = this.index.byCategory.get(item.category) || [];
      categoryItems.push(item);
      this.index.byCategory.set(item.category, categoryItems);

      this.index.searchIndex.push({
        id: item.id,
        text: item.searchableText,
        weight: this.calculateWeight(item),
      });
    }

    return item;
  }

  /**
   * Get library stats
   */
  getStats(): { total: number; byCategory: Record<string, number> } {
    if (!this.index) return { total: 0, byCategory: {} };

    const byCategory: Record<string, number> = {};
    for (const [cat, items] of this.index.byCategory) {
      byCategory[cat] = items.length;
    }

    return {
      total: this.index.items.size,
      byCategory,
    };
  }
}
