/**
 * Security Tests - Tests for path traversal protection and input sanitization
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { Library } from '../../src/lib/library.js';

const TEST_LIB_PATH = join(process.cwd(), '.test-security-library');
const OUTSIDE_PATH = join(process.cwd(), '.test-security-outside');

function setupTestLibrary() {
  mkdirSync(join(TEST_LIB_PATH, 'prompts', 'planning'), { recursive: true });
  mkdirSync(join(TEST_LIB_PATH, 'skills'), { recursive: true });
  mkdirSync(OUTSIDE_PATH, { recursive: true });

  writeFileSync(
    join(TEST_LIB_PATH, 'prompts', 'planning', 'test-prompt.md'),
    `---
title: Test Prompt
description: A test prompt
---

# Test Prompt

This is a test.
`
  );
}

function cleanupTestLibrary() {
  try {
    rmSync(TEST_LIB_PATH, { recursive: true, force: true });
    rmSync(OUTSIDE_PATH, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

describe('Security: Path Traversal Protection', () => {
  let library: Library;

  beforeAll(async () => {
    setupTestLibrary();
    library = new Library(TEST_LIB_PATH, false);
    await library.initialize();
  });

  afterAll(() => {
    cleanupTestLibrary();
  });

  describe('savePrompt path sanitization', () => {
    it('should sanitize path traversal via subcategory with ../ and keep file within library', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: '../../../outside',
        name: 'traversal-test1',
        content: '# Test',
      });

      // Should sanitize and save within library, not outside
      expect(result).not.toBeNull();
      expect(result?.path).toContain(TEST_LIB_PATH);
      expect(existsSync(join(OUTSIDE_PATH, 'traversal-test1.md'))).toBe(false);
      // Subcategory should be sanitized (no ../)
      expect(result?.subcategory).not.toContain('..');
      expect(result?.subcategory).not.toContain('/');
    });

    it('should sanitize path traversal via subcategory with ..\\ and keep file within library', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: '..\\..\\..\\outside',
        name: 'traversal-test2',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.path).toContain(TEST_LIB_PATH);
      expect(result?.subcategory).not.toContain('..');
      expect(result?.subcategory).not.toContain('\\');
    });

    it('should sanitize path traversal in name and keep file within library', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: 'planning',
        name: '../../../outside/malicious',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.path).toContain(TEST_LIB_PATH);
      expect(result?.name).not.toContain('..');
      expect(result?.name).not.toContain('/');
    });

    it('should sanitize forward slashes in subcategory', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: 'sub/nested/deep',
        name: 'slash-test',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.subcategory).not.toContain('/');
    });

    it('should sanitize backslashes in subcategory', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: 'sub\\nested\\deep',
        name: 'backslash-test',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.subcategory).not.toContain('\\');
    });

    it('should use "unnamed" for subcategory that becomes empty after sanitization', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: '../..',
        name: 'empty-sub-test',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.subcategory).toBe('unnamed');
      expect(result?.path).toContain(TEST_LIB_PATH);
    });

    it('should sanitize leading dots in name', () => {
      const result = library.savePrompt({
        category: 'prompts',
        name: '...hidden-file',
        content: '# Hidden',
      });

      expect(result).not.toBeNull();
      expect(result?.name).not.toMatch(/^\./);
    });

    it('should sanitize invalid filename characters', () => {
      const result = library.savePrompt({
        category: 'prompts',
        name: 'file<with>invalid:chars',
        content: '# Test',
      });

      expect(result).not.toBeNull();
      expect(result?.name).not.toMatch(/[<>:"|?*]/);
    });

    it('should handle valid subcategory normally', () => {
      const result = library.savePrompt({
        category: 'prompts',
        subcategory: 'quality',
        name: 'valid-prompt',
        content: '# Valid Prompt',
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe('prompts/quality/valid-prompt');
    });

    it('should reject invalid category', () => {
      const result = library.savePrompt({
        category: 'invalid-category' as any,
        name: 'test',
        content: '# Test',
      });

      expect(result).toBeNull();
    });
  });

  describe('glob scanning security', () => {
    it('should only scan known category folders', async () => {
      // Create a file outside known categories
      mkdirSync(join(TEST_LIB_PATH, 'secrets'), { recursive: true });
      writeFileSync(
        join(TEST_LIB_PATH, 'secrets', 'api-keys.md'),
        '# API Keys\n\nSECRET_KEY=abc123'
      );

      // Re-initialize library
      const newLibrary = new Library(TEST_LIB_PATH, false);
      await newLibrary.initialize();

      // The secrets file should NOT be indexed
      const item = newLibrary.getItem('api-keys');
      expect(item).toBeNull();

      const allItems = newLibrary.getAllItems();
      const secretsItems = allItems.filter(i => i.id.includes('secrets'));
      expect(secretsItems).toHaveLength(0);
    });
  });
});

describe('Security: Input Validation', () => {
  let library: Library;

  beforeAll(async () => {
    setupTestLibrary();
    library = new Library(TEST_LIB_PATH, false);
    await library.initialize();
  });

  afterAll(() => {
    cleanupTestLibrary();
  });

  it('should truncate extremely long names to 64 characters', () => {
    const longName = 'a'.repeat(1000);
    const result = library.savePrompt({
      category: 'prompts',
      name: longName,
      content: '# Test',
    });

    expect(result).not.toBeNull();
    expect(result?.name.length).toBeLessThanOrEqual(64);
  });

  it('should handle unicode in names', () => {
    const result = library.savePrompt({
      category: 'prompts',
      name: 'test-unicode-café',
      content: '# Test',
    });

    expect(result).not.toBeNull();
  });

  it('should strip null bytes from name', () => {
    const result = library.savePrompt({
      category: 'prompts',
      name: 'test\x00clean',
      content: '# Test',
    });

    expect(result).not.toBeNull();
    expect(result?.name).not.toContain('\x00');
    expect(result?.name).toBe('testclean');
  });

  it('should collapse multiple dashes from sanitization', () => {
    const result = library.savePrompt({
      category: 'prompts',
      name: 'test---multiple---dashes',
      content: '# Test',
    });

    expect(result).not.toBeNull();
    expect(result?.name).not.toContain('---');
  });
});
