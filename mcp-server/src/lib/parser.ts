/**
 * Markdown Parser - Parses library files and extracts metadata
 */

import matter from 'gray-matter';
import type { LibraryItemMetadata, ChainStep, Chain, LibraryItem } from '../types.js';

/**
 * Parse a markdown file with optional frontmatter
 */
export function parseMarkdown(content: string): {
  metadata: LibraryItemMetadata;
  body: string;
} {
  try {
    const parsed = matter(content);
    return {
      metadata: parsed.data as LibraryItemMetadata,
      body: parsed.content.trim(),
    };
  } catch {
    // If parsing fails, treat entire content as body
    return {
      metadata: {},
      body: content.trim(),
    };
  }
}

/**
 * Extract title from markdown content
 * Looks for H1 heading or first line
 */
export function extractTitle(body: string): string | undefined {
  // Try H1 heading first
  const h1Match = body.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Try first non-empty line
  const lines = body.split('\n').filter((l) => l.trim());
  if (lines.length > 0) {
    // Remove markdown formatting
    return lines[0].replace(/^[#>*-]+\s*/, '').trim();
  }

  return undefined;
}

/**
 * Extract description from markdown content
 * Looks for blockquote after title or first paragraph
 */
export function extractDescription(body: string): string | undefined {
  // Try blockquote (common pattern: > Description here)
  const blockquoteMatch = body.match(/^>\s*(.+)$/m);
  if (blockquoteMatch) {
    return blockquoteMatch[1].trim();
  }

  // Try first paragraph after H1
  const afterH1 = body.replace(/^#\s+.+$/m, '').trim();
  const firstPara = afterH1.split(/\n\n/)[0];
  if (firstPara && !firstPara.startsWith('#') && !firstPara.startsWith('```')) {
    return firstPara.replace(/\n/g, ' ').trim().substring(0, 200);
  }

  return undefined;
}

/**
 * Parse a chain markdown file into structured Chain object
 */
export function parseChain(item: LibraryItem): Chain {
  const { body } = item;
  const lines = body.split('\n');

  // Extract basic info
  const name = extractTitle(body) || item.name;
  const description = extractDescription(body) || '';

  // Extract overview (usually in a code block after Overview heading)
  let overview = '';
  const overviewMatch = body.match(/## Overview[\s\S]*?```([\s\S]*?)```/);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  }

  // Extract prerequisites
  const prerequisites: string[] = [];
  const prereqMatch = body.match(/## Prerequisites\s*([\s\S]*?)(?=\n##|\n---)/);
  if (prereqMatch) {
    const prereqLines = prereqMatch[1].split('\n');
    for (const line of prereqLines) {
      const listItem = line.match(/^[-*]\s+(.+)/);
      if (listItem) {
        prerequisites.push(listItem[1].trim());
      }
    }
  }

  // Extract steps
  const steps: ChainStep[] = [];
  const stepPattern = /## Step (\d+):\s*(.+?)(?=\n##|\n---|\*\*Chain|\*\*Tips|$)/gs;
  let stepMatch;

  while ((stepMatch = stepPattern.exec(body)) !== null) {
    const stepNumber = parseInt(stepMatch[1], 10);
    const stepContent = stepMatch[2] + body.substring(stepMatch.index + stepMatch[0].length).split(/\n## Step \d+:/)[0];

    // Extract title (after the colon in "## Step N: Title")
    const titleMatch = stepContent.match(/^([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Step ${stepNumber}`;

    // Extract prompt (in code block after **Prompt:**)
    let prompt = '';
    const promptMatch = stepContent.match(/\*\*Prompt:\*\*\s*```[\s\S]*?([\s\S]*?)```/);
    if (promptMatch) {
      prompt = promptMatch[1].trim();
    }

    // Extract expected output
    const expectedOutput: string[] = [];
    const outputMatch = stepContent.match(/\*\*Expected Output:\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|\n---|$)/);
    if (outputMatch) {
      const outputLines = outputMatch[1].split('\n');
      for (const line of outputLines) {
        const listItem = line.match(/^[-*]\s+(.+)/);
        if (listItem) {
          expectedOutput.push(listItem[1].trim());
        }
      }
    }

    // Extract decision point
    let decisionPoint: string | undefined;
    const decisionMatch = stepContent.match(/\*\*Decision Point:\*\*\s*(.+)/);
    if (decisionMatch) {
      decisionPoint = decisionMatch[1].trim();
    }

    steps.push({
      stepNumber,
      title,
      prompt,
      expectedOutput,
      decisionPoint,
    });
  }

  // Extract tips
  const tips: string[] = [];
  const tipsMatch = body.match(/## Tips\s*([\s\S]*?)(?=\n##|$)/);
  if (tipsMatch) {
    const tipLines = tipsMatch[1].split('\n');
    for (const line of tipLines) {
      const listItem = line.match(/^[-*]\s+(.+)/);
      if (listItem) {
        tips.push(listItem[1].trim());
      }
    }
  }

  return {
    id: item.id,
    name,
    description,
    overview,
    prerequisites,
    steps,
    tips,
    item,
  };
}

/**
 * Create searchable text from a library item
 */
export function createSearchableText(item: {
  name: string;
  body: string;
  metadata: LibraryItemMetadata;
  category: string;
  subcategory?: string;
}): string {
  const parts = [
    item.name,
    item.category,
    item.subcategory,
    item.metadata.title,
    item.metadata.description,
    ...(item.metadata.tags || []),
    ...(item.metadata.aliases || []),
    item.body,
  ];

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize a name for matching (fuzzy-friendly)
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\.md$/, '')
    .trim();
}

/**
 * Calculate fuzzy match score between query and target
 */
export function fuzzyMatch(query: string, target: string): number {
  const normalizedQuery = normalizeName(query);
  const normalizedTarget = normalizeName(target);

  // Exact match
  if (normalizedTarget === normalizedQuery) return 1.0;

  // Contains match
  if (normalizedTarget.includes(normalizedQuery)) return 0.8;

  // Word match
  const queryWords = normalizedQuery.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);
  const matchedWords = queryWords.filter((qw) =>
    targetWords.some((tw) => tw.includes(qw) || qw.includes(tw))
  );
  if (matchedWords.length > 0) {
    return 0.5 * (matchedWords.length / queryWords.length);
  }

  // Levenshtein-like partial matching for typos
  let matches = 0;
  for (let i = 0; i < Math.min(normalizedQuery.length, normalizedTarget.length); i++) {
    if (normalizedQuery[i] === normalizedTarget[i]) matches++;
  }
  return 0.3 * (matches / Math.max(normalizedQuery.length, normalizedTarget.length));
}
