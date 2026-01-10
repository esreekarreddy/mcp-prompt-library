import { describe, it, expect } from 'vitest';
import { validateIntentPatterns, IntentPatternSchema } from '../../src/lib/schemas.js';

describe('validateIntentPatterns', () => {
  it('should validate correct intent patterns', () => {
    const validPatterns = [
      {
        keywords: ['test', 'testing'],
        intent: 'testing',
        suggestedItems: ['prompts/test'],
        priority: 5,
      },
    ];

    const result = validateIntentPatterns(validPatterns);
    expect(result).toEqual(validPatterns);
  });

  it('should reject patterns with empty keywords', () => {
    const invalidPatterns = [
      {
        keywords: [],
        intent: 'testing',
        suggestedItems: ['prompts/test'],
        priority: 5,
      },
    ];

    expect(() => validateIntentPatterns(invalidPatterns)).toThrow();
  });

  it('should reject patterns with missing intent', () => {
    const invalidPatterns = [
      {
        keywords: ['test'],
        suggestedItems: ['prompts/test'],
        priority: 5,
      },
    ];

    expect(() => validateIntentPatterns(invalidPatterns)).toThrow();
  });

  it('should reject patterns with priority out of range', () => {
    const invalidPatterns = [
      {
        keywords: ['test'],
        intent: 'testing',
        suggestedItems: ['prompts/test'],
        priority: 15,
      },
    ];

    expect(() => validateIntentPatterns(invalidPatterns)).toThrow();
  });

  it('should reject non-array input', () => {
    expect(() => validateIntentPatterns({ keywords: ['test'] })).toThrow();
    expect(() => validateIntentPatterns('invalid')).toThrow();
    expect(() => validateIntentPatterns(null)).toThrow();
  });

  it('should accept multiple valid patterns', () => {
    const validPatterns = [
      {
        keywords: ['debug', 'bug'],
        intent: 'debugging',
        suggestedItems: ['prompts/debugger'],
        priority: 10,
      },
      {
        keywords: ['test'],
        intent: 'testing',
        suggestedItems: ['skills/testing'],
        priority: 0,
      },
    ];

    const result = validateIntentPatterns(validPatterns);
    expect(result).toHaveLength(2);
  });
});
