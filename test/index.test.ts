import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrompt,
  searchPrompts,
  listPrompts,
  getStats,
  composePrompts,
  getPromptContent,
  clearCache,
  CATEGORIES
} from '../src/index.js';

beforeEach(() => {
  clearCache();
});

describe('getPrompt', () => {
  it('finds prompt by exact filename', () => {
    const prompt = getPrompt('prd-generator');
    expect(prompt).not.toBeNull();
    expect(prompt?.id).toContain('prd-generator');
  });

  it('finds prompt by alias', () => {
    const prompt = getPrompt('system');
    expect(prompt).not.toBeNull();
    expect(prompt?.id).toContain('master-system-prompt');
  });

  it('finds prompt by partial match', () => {
    const prompt = getPrompt('debugger');
    expect(prompt).not.toBeNull();
  });

  it('returns null for non-existent prompt', () => {
    const prompt = getPrompt('this-does-not-exist-xyz');
    expect(prompt).toBeNull();
  });

  it('includes content without frontmatter', () => {
    const prompt = getPrompt('prd-generator');
    expect(prompt?.content).toBeDefined();
    expect(prompt?.content).not.toContain('---');
  });

  it('is case-insensitive when matching', () => {
    const lower = getPrompt('prd-generator');
    const upper = getPrompt('PRD-GENERATOR');
    const mixed = getPrompt('PrD-GeNeRaToR');
    
    expect(lower).not.toBeNull();
    expect(upper).not.toBeNull();
    expect(mixed).not.toBeNull();
    expect(lower?.id).toBe(upper?.id);
    expect(lower?.id).toBe(mixed?.id);
  });

  it('is case-insensitive for full ID paths', () => {
    const lower = getPrompt('prompts/planning/prd-generator');
    const upper = getPrompt('PROMPTS/PLANNING/PRD-GENERATOR');
    
    expect(lower).not.toBeNull();
    expect(upper).not.toBeNull();
    expect(lower?.id).toBe(upper?.id);
  });
});

describe('searchPrompts', () => {
  it('finds prompts matching query', () => {
    const results = searchPrompts('security');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.title.toLowerCase().includes('security'))).toBe(true);
  });

  it('returns results with scores', () => {
    const results = searchPrompts('debug');
    expect(results[0].score).toBeDefined();
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('filters by category', () => {
    const results = searchPrompts('code', { category: 'skills' });
    expect(results.every(r => r.category === 'skills')).toBe(true);
  });

  it('respects limit option', () => {
    const results = searchPrompts('a', { limit: 3 });
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('returns empty array for no matches', () => {
    const results = searchPrompts('xyznonexistentquery123');
    expect(results).toEqual([]);
  });
});

describe('listPrompts', () => {
  it('lists all prompts when no category specified', () => {
    const prompts = listPrompts();
    expect(prompts.length).toBeGreaterThan(50);
  });

  it('filters by category', () => {
    const skills = listPrompts('skills');
    expect(skills.every(p => p.category === 'skills')).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
  });

  it('returns sorted results', () => {
    const prompts = listPrompts();
    const ids = prompts.map(p => p.id);
    expect(ids).toEqual([...ids].sort());
  });
});

describe('getStats', () => {
  it('returns total count', () => {
    const stats = getStats();
    expect(stats.total).toBeGreaterThan(80);
  });

  it('breaks down by category', () => {
    const stats = getStats();
    expect(stats.byCategory.prompts).toBeGreaterThan(10);
    expect(stats.byCategory.skills).toBeGreaterThan(5);
    expect(stats.byCategory.snippets).toBeGreaterThan(10);
  });

  it('includes all categories', () => {
    const stats = getStats();
    for (const category of CATEGORIES) {
      expect(stats.byCategory[category]).toBeDefined();
    }
  });
});

describe('composePrompts', () => {
  it('combines multiple prompts', () => {
    const composed = composePrompts(['ultrathink', 'step-by-step']);
    expect(composed).toContain('Ultrathink');
    expect(composed).toContain('---');
  });

  it('handles missing prompts gracefully', () => {
    const composed = composePrompts(['ultrathink', 'nonexistent123']);
    expect(composed).toContain('Ultrathink');
    expect(composed).not.toContain('nonexistent123');
  });

  it('returns empty string for all invalid prompts', () => {
    const composed = composePrompts(['xyz123', 'abc456']);
    expect(composed).toBe('');
  });
});

describe('getPromptContent', () => {
  it('returns raw content', () => {
    const content = getPromptContent('prd-generator');
    expect(content).not.toBeNull();
    expect(typeof content).toBe('string');
    expect(content!.length).toBeGreaterThan(100);
  });

  it('returns null for non-existent prompt', () => {
    const content = getPromptContent('nonexistent123');
    expect(content).toBeNull();
  });
});

describe('CATEGORIES', () => {
  it('includes all expected categories', () => {
    expect(CATEGORIES).toContain('prompts');
    expect(CATEGORIES).toContain('skills');
    expect(CATEGORIES).toContain('snippets');
    expect(CATEGORIES).toContain('templates');
    expect(CATEGORIES).toContain('chains');
    expect(CATEGORIES).toContain('instructions');
    expect(CATEGORIES).toContain('contexts');
    expect(CATEGORIES).toContain('examples');
  });
});

describe('prompt content integrity', () => {
  it('all prompts have required fields', () => {
    const prompts = listPrompts();
    for (const prompt of prompts) {
      expect(prompt.id).toBeDefined();
      expect(prompt.title).toBeDefined();
      expect(prompt.category).toBeDefined();
      expect(prompt.content).toBeDefined();
      expect(prompt.filePath).toBeDefined();
    }
  });

  it('no prompt has empty content', () => {
    const prompts = listPrompts();
    for (const prompt of prompts) {
      expect(prompt.content.length).toBeGreaterThan(10);
    }
  });

  it('key prompts are accessible', () => {
    const keyPrompts = [
      'prd-generator',
      'ultrathink',
      'security-audit',
      'code-review',
      'debugging'
    ];
    
    for (const name of keyPrompts) {
      const prompt = getPrompt(name);
      expect(prompt).not.toBeNull();
    }
  });
});
