/**
 * @esreekarreddy/ai-prompts
 * 
 * 94+ curated AI prompts, workflows, and coding standards for developers.
 * 
 * @example
 * ```typescript
 * import { getPrompt, searchPrompts, listPrompts } from '@esreekarreddy/ai-prompts';
 * 
 * // Get a specific prompt
 * const prd = getPrompt('prd-generator');
 * console.log(prd.content);
 * 
 * // Search for security prompts
 * const results = searchPrompts('security');
 * 
 * // List all prompts in a category
 * const prompts = listPrompts('prompts');
 * ```
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In production (installed package), files are in the package root
// In development, we're in src/ so we go up one level
const LIBRARY_ROOT = existsSync(join(__dirname, '..', 'prompts'))
  ? join(__dirname, '..')
  : join(__dirname, '..', '..');

/**
 * Categories available in the library
 */
export const CATEGORIES = [
  'prompts',
  'snippets', 
  'templates',
  'skills',
  'instructions',
  'chains',
  'contexts',
  'examples'
] as const;

export type Category = typeof CATEGORIES[number];

/**
 * Parsed prompt with frontmatter metadata
 */
export interface Prompt {
  /** Unique identifier (e.g., "prompts/planning/prd-generator") */
  id: string;
  /** Display title from frontmatter */
  title: string;
  /** Description from frontmatter */
  description: string;
  /** Tags for categorization */
  tags: string[];
  /** Alternative names for fuzzy matching */
  aliases: string[];
  /** Category (prompts, skills, etc.) */
  category: Category;
  /** Subcategory (planning, quality, etc.) */
  subcategory: string;
  /** Raw markdown content (without frontmatter) */
  content: string;
  /** Full file path */
  filePath: string;
}

/**
 * Search result with relevance score
 */
export interface SearchResult extends Prompt {
  /** Relevance score (higher = better match) */
  score: number;
}

// Cache for parsed prompts
let promptCache: Map<string, Prompt> | null = null;

/**
 * Parse a markdown file and extract frontmatter
 */
function parsePromptFile(filePath: string, category: Category, subcategory: string): Prompt | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    const filename = basename(filePath, extname(filePath));
    const id = `${category}/${subcategory}/${filename}`;
    
    return {
      id,
      title: data.title || filename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      description: data.description || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      aliases: Array.isArray(data.aliases) ? data.aliases : [],
      category,
      subcategory,
      content: body.trim(),
      filePath
    };
  } catch {
    return null;
  }
}

/**
 * Recursively scan a category directory for markdown files
 */
function scanCategory(category: Category): Prompt[] {
  const categoryPath = join(LIBRARY_ROOT, category);
  if (!existsSync(categoryPath)) return [];
  
  const prompts: Prompt[] = [];
  
  function scanDir(dir: string, subcategory: string) {
    const entries = readdirSync(dir);
    
    for (const entry of entries) {
      const entryPath = join(dir, entry);
      const stat = statSync(entryPath);
      
      if (stat.isDirectory()) {
        scanDir(entryPath, entry);
      } else if (entry.endsWith('.md') && !entry.startsWith('_')) {
        const prompt = parsePromptFile(entryPath, category, subcategory || 'general');
        if (prompt) prompts.push(prompt);
      }
    }
  }
  
  scanDir(categoryPath, '');
  return prompts;
}

/**
 * Build the full prompt cache
 */
function buildCache(): Map<string, Prompt> {
  if (promptCache) return promptCache;
  
  promptCache = new Map();
  
  for (const category of CATEGORIES) {
    const prompts = scanCategory(category);
    for (const prompt of prompts) {
      promptCache.set(prompt.id, prompt);
      
      // Also index by aliases
      for (const alias of prompt.aliases) {
        promptCache.set(alias.toLowerCase(), prompt);
      }
      
      // Index by filename
      const filename = basename(prompt.filePath, '.md');
      promptCache.set(filename.toLowerCase(), prompt);
    }
  }
  
  return promptCache;
}

/**
 * Clear the cache (useful for testing or hot-reload)
 */
export function clearCache(): void {
  promptCache = null;
}

/**
 * Get a prompt by ID, alias, or fuzzy name
 * 
 * @example
 * ```typescript
 * const prd = getPrompt('prd-generator');
 * const system = getPrompt('system');  // alias works
 * const debug = getPrompt('deep-debugger');
 * ```
 */
export function getPrompt(nameOrId: string): Prompt | null {
  const cache = buildCache();
  const normalized = nameOrId.toLowerCase().trim();
  
  // Exact match
  if (cache.has(normalized)) {
    return cache.get(normalized)!;
  }
  
  // Try with common prefixes
  for (const category of CATEGORIES) {
    const withPrefix = `${category}/${normalized}`;
    for (const [key, prompt] of cache) {
      if (key.includes(withPrefix) || key.endsWith(`/${normalized}`)) {
        return prompt;
      }
    }
  }
  
  // Fuzzy match (contains)
  for (const [key, prompt] of cache) {
    if (key.includes(normalized) || prompt.title.toLowerCase().includes(normalized)) {
      return prompt;
    }
  }
  
  return null;
}

/**
 * Search prompts by query string
 * 
 * @example
 * ```typescript
 * const results = searchPrompts('security');
 * // Returns prompts matching "security" in title, description, or tags
 * ```
 */
export function searchPrompts(query: string, options?: { 
  category?: Category;
  limit?: number;
}): SearchResult[] {
  const cache = buildCache();
  const normalized = query.toLowerCase().trim();
  const results: SearchResult[] = [];
  const seen = new Set<string>();
  
  for (const prompt of cache.values()) {
    if (seen.has(prompt.id)) continue;
    seen.add(prompt.id);
    
    // Filter by category if specified
    if (options?.category && prompt.category !== options.category) continue;
    
    let score = 0;
    
    // Title match (highest weight)
    if (prompt.title.toLowerCase().includes(normalized)) score += 10;
    
    // Description match
    if (prompt.description.toLowerCase().includes(normalized)) score += 5;
    
    // Tag match
    if (prompt.tags.some(t => t.toLowerCase().includes(normalized))) score += 8;
    
    // Alias match
    if (prompt.aliases.some(a => a.toLowerCase().includes(normalized))) score += 7;
    
    // Content match (lowest weight)
    if (prompt.content.toLowerCase().includes(normalized)) score += 2;
    
    if (score > 0) {
      results.push({ ...prompt, score });
    }
  }
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return options?.limit ? results.slice(0, options.limit) : results;
}

/**
 * List all prompts, optionally filtered by category
 * 
 * @example
 * ```typescript
 * const allPrompts = listPrompts();
 * const skills = listPrompts('skills');
 * ```
 */
export function listPrompts(category?: Category): Prompt[] {
  const cache = buildCache();
  const seen = new Set<string>();
  const results: Prompt[] = [];
  
  for (const prompt of cache.values()) {
    if (seen.has(prompt.id)) continue;
    seen.add(prompt.id);
    
    if (!category || prompt.category === category) {
      results.push(prompt);
    }
  }
  
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Get library statistics
 * 
 * @example
 * ```typescript
 * const stats = getStats();
 * console.log(stats.total);  // 94
 * console.log(stats.byCategory.prompts);  // 18
 * ```
 */
export function getStats(): {
  total: number;
  byCategory: Record<Category, number>;
} {
  const prompts = listPrompts();
  const byCategory = {} as Record<Category, number>;
  
  for (const category of CATEGORIES) {
    byCategory[category] = 0;
  }
  
  for (const prompt of prompts) {
    byCategory[prompt.category]++;
  }
  
  return {
    total: prompts.length,
    byCategory
  };
}

/**
 * Compose multiple prompts together
 * 
 * @example
 * ```typescript
 * const composed = composePrompts(['prd-generator', 'ultrathink', 'step-by-step']);
 * console.log(composed);  // Combined content of all three
 * ```
 */
export function composePrompts(names: string[]): string {
  const parts: string[] = [];
  
  for (const name of names) {
    const prompt = getPrompt(name);
    if (prompt) {
      parts.push(`# ${prompt.title}\n\n${prompt.content}`);
    }
  }
  
  return parts.join('\n\n---\n\n');
}

/**
 * Get the raw content of a prompt (just the markdown, no metadata)
 * 
 * @example
 * ```typescript
 * const content = getPromptContent('prd-generator');
 * // Use directly with AI APIs
 * ```
 */
export function getPromptContent(nameOrId: string): string | null {
  const prompt = getPrompt(nameOrId);
  return prompt?.content || null;
}

// Re-export types
export type { Category as PromptCategory };
