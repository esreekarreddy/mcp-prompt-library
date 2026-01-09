/**
 * AI Library MCP Server - Type Definitions
 */

// Library item categories
export type LibraryCategory =
  | 'prompts'
  | 'snippets'
  | 'templates'
  | 'skills'
  | 'instructions'
  | 'chains'
  | 'contexts'
  | 'examples';

// Subcategories within each category
export type PromptSubcategory = 'planning' | 'development' | 'quality' | 'design';
export type SnippetSubcategory = 'modifiers' | 'output-formats' | 'constraints';
export type TemplateSubcategory = 'claude-md' | 'cursorrules' | 'copilot' | 'docs';
export type InstructionSubcategory = 'personas' | 'standards' | 'workflows';
export type ContextSubcategory = 'stacks' | 'patterns' | 'guides';
export type ExampleSubcategory = 'prds' | 'architecture-docs' | 'code-reviews';

// Parsed frontmatter metadata
export interface LibraryItemMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  aliases?: string[];
  author?: string;
  version?: string;
  created?: string;
  updated?: string;
  related?: string[];
  [key: string]: unknown;
}

// A single library item (prompt, snippet, template, etc.)
export interface LibraryItem {
  // Identity
  id: string; // e.g., "prompts/planning/prd-generator"
  name: string; // e.g., "prd-generator"
  category: LibraryCategory;
  subcategory?: string;

  // File info
  path: string; // absolute path
  relativePath: string; // relative to library root

  // Content
  content: string; // full file content
  body: string; // content without frontmatter
  metadata: LibraryItemMetadata;

  // Computed
  searchableText: string; // lowercased text for searching
  modifiedAt: Date;
}

// Chain step definition
export interface ChainStep {
  stepNumber: number;
  title: string;
  prompt: string;
  expectedOutput: string[];
  decisionPoint?: string;
}

// Parsed chain
export interface Chain {
  id: string;
  name: string;
  description: string;
  overview: string;
  prerequisites: string[];
  steps: ChainStep[];
  summary?: string;
  tips?: string[];
  item: LibraryItem;
}

// Active chain session
export interface ChainSession {
  id: string;
  chainId: string;
  chainName: string;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  context: Record<string, string>; // user-provided context for variable substitution
  completedSteps: number[];
}

// Library index for fast lookups
export interface LibraryIndex {
  items: Map<string, LibraryItem>;
  byCategory: Map<LibraryCategory, LibraryItem[]>;
  byTag: Map<string, LibraryItem[]>;
  chains: Map<string, Chain>;
  searchIndex: SearchEntry[];
}

// Search index entry
export interface SearchEntry {
  id: string;
  text: string; // searchable text
  weight: number; // relevance weight
}

// Search result
export interface SearchResult {
  item: LibraryItem;
  score: number;
  matches: string[]; // matched keywords
}

// Intent patterns for smart suggestions
export interface IntentPattern {
  keywords: string[];
  intent: string;
  suggestedItems: string[]; // item IDs to suggest
  priority: number;
}

// Suggestion result
export interface Suggestion {
  item: LibraryItem;
  reason: string;
  confidence: number; // 0-1
}

// Tool response types
export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

// Server configuration
export interface ServerConfig {
  libraryPath: string;
  enableChains: boolean;
  enableSuggestions: boolean;
  maxSearchResults: number;
  debug: boolean;
}

// MCP Resource types
export interface PromptResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

// Save prompt request
export interface SavePromptRequest {
  category: LibraryCategory;
  subcategory?: string;
  name: string;
  content: string;
  metadata?: LibraryItemMetadata;
}
