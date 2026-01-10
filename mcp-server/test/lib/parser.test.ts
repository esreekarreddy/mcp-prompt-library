/**
 * Parser Tests - Comprehensive tests for markdown parsing and fuzzy matching
 */

import { describe, it, expect } from 'vitest';
import {
  parseMarkdown,
  extractTitle,
  extractDescription,
  createSearchableText,
  normalizeName,
  fuzzyMatch,
  parseChain,
} from '../../src/lib/parser.js';
import type { LibraryItem, LibraryItemMetadata } from '../../src/types.js';

describe('parseMarkdown', () => {
  it('should parse content with valid YAML frontmatter', () => {
    const content = `---
title: Test Prompt
description: A test description
tags:
  - test
  - example
---

# Test Prompt

This is the body content.`;

    const result = parseMarkdown(content);

    expect(result.metadata.title).toBe('Test Prompt');
    expect(result.metadata.description).toBe('A test description');
    expect(result.metadata.tags).toEqual(['test', 'example']);
    expect(result.body).toContain('# Test Prompt');
    expect(result.body).toContain('This is the body content.');
  });

  it('should handle content without frontmatter', () => {
    const content = `# Simple Prompt

Just some content without frontmatter.`;

    const result = parseMarkdown(content);

    expect(result.metadata).toEqual({});
    expect(result.body).toBe(content.trim());
  });

  it('should handle empty content', () => {
    const result = parseMarkdown('');

    expect(result.metadata).toEqual({});
    expect(result.body).toBe('');
  });

  it('should handle malformed frontmatter gracefully', () => {
    const content = `---
invalid yaml: [not closed
---

Content here.`;

    const result = parseMarkdown(content);

    // Should not throw, returns empty metadata
    expect(result.metadata).toEqual({});
  });
});

describe('extractTitle', () => {
  it('should extract H1 heading', () => {
    const body = `# My Amazing Title

Some content here.`;

    expect(extractTitle(body)).toBe('My Amazing Title');
  });

  it('should extract title from middle of document', () => {
    const body = `Some intro text.

# The Real Title

More content.`;

    expect(extractTitle(body)).toBe('The Real Title');
  });

  it('should fall back to first non-empty line', () => {
    const body = `This is the first line

Second line here.`;

    expect(extractTitle(body)).toBe('This is the first line');
  });

  it('should strip markdown formatting from first line', () => {
    const body = `> Blockquote title

Content.`;

    expect(extractTitle(body)).toBe('Blockquote title');
  });

  it('should return undefined for empty content', () => {
    expect(extractTitle('')).toBeUndefined();
    expect(extractTitle('   \n   \n   ')).toBeUndefined();
  });
});

describe('extractDescription', () => {
  it('should extract blockquote description', () => {
    const body = `# Title

> This is a description in a blockquote.

Content here.`;

    expect(extractDescription(body)).toBe('This is a description in a blockquote.');
  });

  it('should extract first paragraph after H1', () => {
    const body = `# Title

This is the first paragraph that serves as description.

More content here.`;

    expect(extractDescription(body)).toBe(
      'This is the first paragraph that serves as description.'
    );
  });

  it('should not extract code blocks as description', () => {
    const body = `# Title

\`\`\`javascript
const code = 'not a description';
\`\`\`

Real paragraph.`;

    const desc = extractDescription(body);
    expect(desc === undefined || !desc.includes('const code')).toBe(true);
  });

  it('should truncate long descriptions', () => {
    const longParagraph = 'A'.repeat(300);
    const body = `# Title

${longParagraph}`;

    const desc = extractDescription(body);
    expect(desc?.length).toBeLessThanOrEqual(200);
  });
});

describe('normalizeName', () => {
  it('should lowercase and normalize', () => {
    expect(normalizeName('PRD-Generator')).toBe('prd generator');
    expect(normalizeName('deep_debugger')).toBe('deep debugger');
    expect(normalizeName('ULTRATHINK')).toBe('ultrathink');
  });

  it('should remove .md extension', () => {
    expect(normalizeName('prd-generator.md')).toBe('prd generator');
    expect(normalizeName('test.md')).toBe('test');
  });

  it('should handle empty string', () => {
    expect(normalizeName('')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(normalizeName('  test  ')).toBe('test');
  });
});

describe('fuzzyMatch', () => {
  it('should return 1.0 for exact match', () => {
    expect(fuzzyMatch('prd-generator', 'prd-generator')).toBe(1.0);
    expect(fuzzyMatch('PRD-Generator', 'prd-generator')).toBe(1.0); // case-insensitive
  });

  it('should return 0.8 for contains match', () => {
    expect(fuzzyMatch('prd', 'prd-generator')).toBe(0.8);
    expect(fuzzyMatch('debug', 'deep-debugger')).toBe(0.8);
  });

  it('should return partial score for word match', () => {
    const score = fuzzyMatch('security audit', 'security-audit-prompt');
    expect(score).toBeGreaterThan(0.3);
    expect(score).toBeLessThanOrEqual(0.8);
  });

  it('should return low score for partial character match', () => {
    const score = fuzzyMatch('xyz', 'abc');
    expect(score).toBeLessThan(0.3);
  });

  it('should handle typos with partial matching', () => {
    const score = fuzzyMatch('debuger', 'debugger');
    expect(score).toBeGreaterThan(0);
  });
});

describe('createSearchableText', () => {
  it('should combine all searchable fields', () => {
    const item = {
      name: 'prd-generator',
      body: 'Create a PRD document.',
      metadata: {
        title: 'PRD Generator',
        description: 'Generate product requirement documents',
        tags: ['planning', 'documentation'],
        aliases: ['prd', 'product-requirements'],
      } as LibraryItemMetadata,
      category: 'prompts',
      subcategory: 'planning',
    };

    const text = createSearchableText(item);

    expect(text).toContain('prd generator');
    expect(text).toContain('prompts');
    expect(text).toContain('planning');
    expect(text).toContain('documentation');
    expect(text).toContain('product requirements');
  });

  it('should lowercase and remove special characters', () => {
    const item = {
      name: 'Test-Item',
      body: 'Content with @special #characters!',
      metadata: {} as LibraryItemMetadata,
      category: 'prompts',
    };

    const text = createSearchableText(item);

    expect(text).not.toContain('@');
    expect(text).not.toContain('#');
    expect(text).not.toContain('!');
    expect(text).toBe(text.toLowerCase());
  });

  it('should handle missing optional fields', () => {
    const item = {
      name: 'minimal',
      body: 'Just body',
      metadata: {} as LibraryItemMetadata,
      category: 'prompts',
    };

    const text = createSearchableText(item);

    expect(text).toContain('minimal');
    expect(text).toContain('just body');
    expect(text).toContain('prompts');
  });
});

describe('parseChain', () => {
  it('should parse a complete chain document', () => {
    const mockItem: LibraryItem = {
      id: 'chains/test-chain',
      name: 'test-chain',
      category: 'chains',
      path: '/test/chains/test-chain.md',
      relativePath: 'chains/test-chain.md',
      content: '',
      body: `# Test Workflow Chain

> A test chain for unit testing

## Overview

\`\`\`
Step 1 -> Step 2 -> Done
\`\`\`

## Prerequisites

- Node.js installed
- TypeScript configured

## Step 1: Setup

**Prompt:**
\`\`\`
Initialize the project.
\`\`\`

**Expected Output:**
- Project structure created
- Dependencies installed

**Decision Point:** Proceed if setup complete

## Step 2: Implementation

**Prompt:**
\`\`\`
Implement the feature.
\`\`\`

**Expected Output:**
- Feature implemented
- Tests passing

## Tips

- Take your time
- Review output carefully`,
      metadata: {},
      searchableText: '',
      modifiedAt: new Date(),
    };

    const chain = parseChain(mockItem);

    expect(chain.id).toBe('chains/test-chain');
    expect(chain.name).toBe('Test Workflow Chain');
    expect(chain.description).toBe('A test chain for unit testing');
    expect(chain.overview).toContain('Step 1 -> Step 2');
    expect(chain.prerequisites).toContain('Node.js installed');
    expect(chain.prerequisites).toContain('TypeScript configured');
    expect(chain.steps).toHaveLength(2);

    // Check Step 1
    expect(chain.steps[0].stepNumber).toBe(1);
    expect(chain.steps[0].title).toBe('Setup');
    expect(chain.steps[0].prompt).toBe('Initialize the project.');
    expect(chain.steps[0].expectedOutput).toContain('Project structure created');
    expect(chain.steps[0].decisionPoint).toBe('Proceed if setup complete');

    // Check Step 2
    expect(chain.steps[1].stepNumber).toBe(2);
    expect(chain.steps[1].title).toBe('Implementation');

    // Check tips
    expect(chain.tips).toContain('Take your time');
    expect(chain.tips).toContain('Review output carefully');
  });

  it('should handle chain without optional sections', () => {
    const mockItem: LibraryItem = {
      id: 'chains/minimal',
      name: 'minimal',
      category: 'chains',
      path: '/test/chains/minimal.md',
      relativePath: 'chains/minimal.md',
      content: '',
      body: `# Minimal Chain

## Step 1: Only Step

**Prompt:**
\`\`\`
Do the thing.
\`\`\``,
      metadata: {},
      searchableText: '',
      modifiedAt: new Date(),
    };

    const chain = parseChain(mockItem);

    expect(chain.name).toBe('Minimal Chain');
    expect(chain.prerequisites).toEqual([]);
    expect(chain.tips).toEqual([]);
    expect(chain.steps).toHaveLength(1);
  });

  it('should extract first line as name when no H1 present', () => {
    const mockItem: LibraryItem = {
      id: 'chains/no-title',
      name: 'no-title',
      category: 'chains',
      path: '/test/chains/no-title.md',
      relativePath: 'chains/no-title.md',
      content: '',
      body: 'Just some content without a title.',
      metadata: {},
      searchableText: '',
      modifiedAt: new Date(),
    };

    const chain = parseChain(mockItem);

    expect(chain.name).toBe('Just some content without a title.');
  });
});
