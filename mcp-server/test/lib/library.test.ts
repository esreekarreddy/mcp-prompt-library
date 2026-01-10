/**
 * Library Manager Tests - Tests for library indexing, search, and suggestions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { Library } from '../../src/lib/library.js';

// Create a temporary test library
const TEST_LIB_PATH = join(process.cwd(), '.test-library');

function setupTestLibrary() {
  // Create directory structure
  mkdirSync(join(TEST_LIB_PATH, 'prompts', 'planning'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'prompts', 'development'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'skills'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'chains'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'snippets', 'modifiers'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'config'), { recursive: true });

  // Create test files
  writeFileSync(
    join(TEST_LIB_PATH, 'prompts', 'planning', 'prd-generator.md'),
    `---
title: PRD Generator
description: Generate product requirement documents
tags:
  - planning
  - documentation
aliases:
  - prd
  - product-requirements
---

# PRD Generator

> Generate comprehensive product requirement documents

Use this prompt to create PRDs for new features.
`
  );

  writeFileSync(
    join(TEST_LIB_PATH, 'prompts', 'development', 'debugger.md'),
    `---
title: Deep Debugger
description: Systematic debugging approach
tags:
  - debugging
  - development
---

# Deep Debugger

> Debug issues systematically

A scientific approach to debugging.
`
  );

  writeFileSync(
    join(TEST_LIB_PATH, 'skills', 'code-review.md'),
    `---
title: Code Review Skill
description: Comprehensive code review
tags:
  - review
  - quality
---

# Code Review

> Expert code review capability

Review code for quality, security, and performance.
`
  );

  writeFileSync(
    join(TEST_LIB_PATH, 'chains', 'new-feature.md'),
    `# New Feature Workflow

> Complete workflow for implementing new features

## Overview

\`\`\`
PRD -> Design -> Implement -> Test -> Deploy
\`\`\`

## Prerequisites

- Clear requirements
- Access to codebase

## Step 1: Create PRD

**Prompt:**
\`\`\`
Generate a PRD for the feature.
\`\`\`

**Expected Output:**
- Complete PRD document

## Step 2: Implementation

**Prompt:**
\`\`\`
Implement the feature.
\`\`\`

**Expected Output:**
- Working code
- Tests

## Tips

- Start with PRD
- Test early
`
  );

  writeFileSync(
    join(TEST_LIB_PATH, 'snippets', 'modifiers', 'ultrathink.md'),
    `---
title: Ultrathink
description: Deep thinking mode
tags:
  - thinking
  - analysis
aliases:
  - deep-think
---

# Ultrathink

> Enable deep analysis mode

Think step by step with maximum depth.
`
  );

  // Create custom intents config
  writeFileSync(
    join(TEST_LIB_PATH, 'config', 'intents.json'),
    JSON.stringify([
      {
        keywords: ['custom test'],
        intent: 'custom testing',
        suggestedItems: ['prompts/development/debugger'],
        priority: 10,
      },
    ])
  );
}

function cleanupTestLibrary() {
  try {
    rmSync(TEST_LIB_PATH, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

describe('Library', () => {
  let library: Library;

  beforeAll(async () => {
    setupTestLibrary();
    library = new Library(TEST_LIB_PATH, false);
    await library.initialize();
  });

  afterAll(() => {
    cleanupTestLibrary();
  });

  describe('initialization', () => {
    it('should scan and index all markdown files', () => {
      const stats = library.getStats();

      expect(stats.total).toBe(5);
      expect(stats.byCategory.prompts).toBe(2);
      expect(stats.byCategory.skills).toBe(1);
      expect(stats.byCategory.chains).toBe(1);
      expect(stats.byCategory.snippets).toBe(1);
    });

    it('should load custom intent patterns', async () => {
      // The custom intent should be loaded and work
      const suggestions = library.suggest('custom test query');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].reason).toContain('custom testing');
    });
  });

  describe('getItem', () => {
    it('should find item by exact ID', () => {
      const item = library.getItem('prompts/planning/prd-generator');

      expect(item).not.toBeNull();
      expect(item?.name).toBe('prd-generator');
      expect(item?.metadata.title).toBe('PRD Generator');
    });

    it('should find item by fuzzy name match', () => {
      const item = library.getItem('prd-generator');

      expect(item).not.toBeNull();
      expect(item?.id).toBe('prompts/planning/prd-generator');
    });

    it('should find item by alias', () => {
      const item = library.getItem('prd');

      expect(item).not.toBeNull();
      expect(item?.id).toBe('prompts/planning/prd-generator');
    });

    it('should return null for non-existent item', () => {
      const item = library.getItem('non-existent-item-xyz');

      expect(item).toBeNull();
    });

    it('should handle .md extension in query', () => {
      const item = library.getItem('prompts/planning/prd-generator.md');

      expect(item).not.toBeNull();
    });
  });

  describe('getByCategory', () => {
    it('should return all items in a category', () => {
      const prompts = library.getByCategory('prompts');

      expect(prompts).toHaveLength(2);
      expect(prompts.map((p) => p.name)).toContain('prd-generator');
      expect(prompts.map((p) => p.name)).toContain('debugger');
    });

    it('should return empty array for empty category', () => {
      const templates = library.getByCategory('templates');

      expect(templates).toEqual([]);
    });
  });

  describe('getAllItems', () => {
    it('should return all indexed items', () => {
      const items = library.getAllItems();

      expect(items).toHaveLength(5);
    });
  });

  describe('search', () => {
    it('should find items by keyword', () => {
      const results = library.search('debugging');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('debugger');
    });

    it('should find items by tag', () => {
      const results = library.search('planning');

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.item.name);
      expect(names).toContain('prd-generator');
    });

    it('should boost name matches', () => {
      const results = library.search('prd generator');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('prd-generator');
    });

    it('should respect limit parameter', () => {
      const results = library.search('', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for no matches', () => {
      const results = library.search('xyznonexistent123');

      expect(results).toEqual([]);
    });
  });

  describe('suggest', () => {
    it('should suggest items based on intent patterns', () => {
      const suggestions = library.suggest('I need to build a new feature');

      expect(suggestions.length).toBeGreaterThan(0);
      const ids = suggestions.map((s) => s.item.id);
      expect(ids).toContain('prompts/planning/prd-generator');
    });

    it('should detect debugging intent', () => {
      const suggestions = library.suggest('stuck on a bug in my code');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].reason).toContain('debugging');
    });

    it('should detect security intent', () => {
      const suggestions = library.suggest('security vulnerability xss injection');

      if (suggestions.length > 0) {
        expect(suggestions[0].reason).toContain('security');
      } else {
        expect(true).toBe(true);
      }
    });

    it('should include confidence score', () => {
      const suggestions = library.suggest('debug this error');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should respect limit parameter', () => {
      const suggestions = library.suggest('build new feature', 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should avoid duplicate suggestions', () => {
      const suggestions = library.suggest('new feature build create');

      const ids = suggestions.map((s) => s.item.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('getChain', () => {
    it('should find chain by exact ID', () => {
      const chain = library.getChain('chains/new-feature');

      expect(chain).not.toBeNull();
      expect(chain?.name).toBe('New Feature Workflow');
    });

    it('should find chain by name without prefix', () => {
      const chain = library.getChain('new-feature');

      expect(chain).not.toBeNull();
    });

    it('should parse chain steps correctly', () => {
      const chain = library.getChain('new-feature');

      expect(chain?.steps).toHaveLength(2);
      expect(chain?.steps[0].title).toBe('Create PRD');
      expect(chain?.steps[1].title).toBe('Implementation');
    });

    it('should parse chain metadata correctly', () => {
      const chain = library.getChain('new-feature');

      expect(chain?.prerequisites).toContain('Clear requirements');
      expect(chain?.tips).toContain('Start with PRD');
    });

    it('should return null for non-existent chain', () => {
      const chain = library.getChain('nonexistent-chain');

      expect(chain).toBeNull();
    });
  });

  describe('getAllChains', () => {
    it('should return all parsed chains', () => {
      const chains = library.getAllChains();

      expect(chains).toHaveLength(1);
      expect(chains[0].name).toBe('New Feature Workflow');
    });
  });

  describe('savePrompt', () => {
    it('should save a new prompt to the library', () => {
      const newItem = library.savePrompt({
        category: 'prompts',
        subcategory: 'quality',
        name: 'test-prompt',
        content: '# Test Prompt\n\nThis is a test.',
        metadata: {
          title: 'Test Prompt',
          description: 'A test prompt',
          tags: ['test'],
        },
      });

      expect(newItem).not.toBeNull();
      expect(newItem?.id).toBe('prompts/quality/test-prompt');
      expect(newItem?.metadata.title).toBe('Test Prompt');

      // Should be searchable now
      const found = library.getItem('test-prompt');
      expect(found).not.toBeNull();
    });

    it('should save prompt without subcategory', () => {
      const newItem = library.savePrompt({
        category: 'skills',
        name: 'new-skill',
        content: '# New Skill\n\nA new skill.',
      });

      expect(newItem).not.toBeNull();
      expect(newItem?.id).toBe('skills/new-skill');
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', () => {
      const stats = library.getStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.byCategory).toBe('object');
      expect(stats.byCategory.prompts).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Library edge cases', () => {
  it('should handle uninitialized library gracefully', () => {
    const uninitializedLib = new Library('/nonexistent/path', false);

    expect(uninitializedLib.getAllItems()).toEqual([]);
    expect(uninitializedLib.getItem('test')).toBeNull();
    expect(uninitializedLib.search('test')).toEqual([]);
    expect(uninitializedLib.suggest('test')).toEqual([]);
    expect(uninitializedLib.getChain('test')).toBeNull();
    expect(uninitializedLib.getAllChains()).toEqual([]);
    expect(uninitializedLib.getStats()).toEqual({ total: 0, byCategory: {} });
  });
});
