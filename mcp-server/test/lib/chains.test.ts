import { describe, it, expect, beforeEach } from 'vitest';
import { ChainManager } from '../../src/lib/chains.js';
import type { Chain, ChainStep } from '../../src/types.js';

const mockChain: Chain = {
  id: 'chains/test-workflow',
  name: 'Test Workflow',
  description: 'A test workflow',
  overview: 'Step 1 -> Step 2 -> Done',
  prerequisites: ['Requirement 1'],
  steps: [
    {
      stepNumber: 1,
      title: 'First Step',
      prompt: 'Do the first thing with [variable_name]',
      expectedOutput: ['Output 1'],
      decisionPoint: 'Continue if OK',
    },
    {
      stepNumber: 2,
      title: 'Second Step',
      prompt: 'Do the second thing with {{another_var}}',
      expectedOutput: ['Output 2', 'Output 3'],
    },
    {
      stepNumber: 3,
      title: 'Final Step',
      prompt: 'Wrap up',
      expectedOutput: [],
    },
  ],
  tips: ['Tip 1', 'Tip 2'],
  item: {} as Chain['item'],
};

describe('ChainManager', () => {
  let manager: ChainManager;

  beforeEach(() => {
    manager = new ChainManager(false);
  });

  describe('startChain', () => {
    it('should create a new session with correct initial state', () => {
      const session = manager.startChain(mockChain);

      expect(session.id).toBeDefined();
      expect(session.id.length).toBe(16);
      expect(session.chainId).toBe('chains/test-workflow');
      expect(session.chainName).toBe('Test Workflow');
      expect(session.currentStep).toBe(1);
      expect(session.totalSteps).toBe(3);
      expect(session.completedSteps).toEqual([]);
      expect(session.startedAt).toBeInstanceOf(Date);
    });

    it('should accept initial context', () => {
      const context = { project: 'test-project', feature: 'auth' };
      const session = manager.startChain(mockChain, context);

      expect(session.context).toEqual(context);
    });

    it('should create unique session IDs', () => {
      const session1 = manager.startChain(mockChain);
      const session2 = manager.startChain(mockChain);

      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('getSession', () => {
    it('should retrieve an existing session', () => {
      const created = manager.startChain(mockChain);
      const retrieved = manager.getSession(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent session', () => {
      const result = manager.getSession('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAllSessions', () => {
    it('should return all active sessions', () => {
      manager.startChain(mockChain);
      manager.startChain(mockChain);
      manager.startChain(mockChain);

      const sessions = manager.getAllSessions();

      expect(sessions).toHaveLength(3);
    });

    it('should return empty array when no sessions', () => {
      const sessions = manager.getAllSessions();

      expect(sessions).toEqual([]);
    });
  });

  describe('advanceStep', () => {
    it('should advance to next step', () => {
      const session = manager.startChain(mockChain);
      const advanced = manager.advanceStep(session.id);

      expect(advanced?.currentStep).toBe(2);
      expect(advanced?.completedSteps).toContain(1);
    });

    it('should not exceed total steps', () => {
      const session = manager.startChain(mockChain);
      manager.advanceStep(session.id);
      manager.advanceStep(session.id);
      const final = manager.advanceStep(session.id);

      expect(final?.currentStep).toBe(3);
    });

    it('should track completed steps without duplicates', () => {
      const session = manager.startChain(mockChain);
      manager.advanceStep(session.id);
      manager.advanceStep(session.id);

      expect(session.completedSteps).toEqual([1, 2]);
    });

    it('should return null for non-existent session', () => {
      const result = manager.advanceStep('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('goToStep', () => {
    it('should jump to a specific step', () => {
      const session = manager.startChain(mockChain);
      const result = manager.goToStep(session.id, 3);

      expect(result?.currentStep).toBe(3);
    });

    it('should not go below step 1', () => {
      const session = manager.startChain(mockChain);
      manager.goToStep(session.id, 0);

      expect(session.currentStep).toBe(1);
    });

    it('should not exceed total steps', () => {
      const session = manager.startChain(mockChain);
      manager.goToStep(session.id, 10);

      expect(session.currentStep).toBe(1);
    });

    it('should return null for non-existent session', () => {
      const result = manager.goToStep('nonexistent', 2);

      expect(result).toBeNull();
    });
  });

  describe('updateContext', () => {
    it('should merge new context values', () => {
      const session = manager.startChain(mockChain, { existing: 'value' });
      manager.updateContext(session.id, { newKey: 'newValue' });

      expect(session.context).toEqual({
        existing: 'value',
        newKey: 'newValue',
      });
    });

    it('should overwrite existing keys', () => {
      const session = manager.startChain(mockChain, { key: 'old' });
      manager.updateContext(session.id, { key: 'new' });

      expect(session.context.key).toBe('new');
    });

    it('should return null for non-existent session', () => {
      const result = manager.updateContext('nonexistent', { key: 'value' });

      expect(result).toBeNull();
    });
  });

  describe('endSession', () => {
    it('should remove the session', () => {
      const session = manager.startChain(mockChain);
      const result = manager.endSession(session.id);

      expect(result).toBe(true);
      expect(manager.getSession(session.id)).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const result = manager.endSession('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getCurrentStep', () => {
    it('should return the current step from chain', () => {
      const session = manager.startChain(mockChain);
      const step = manager.getCurrentStep(session, mockChain);

      expect(step?.stepNumber).toBe(1);
      expect(step?.title).toBe('First Step');
    });

    it('should return correct step after advancing', () => {
      const session = manager.startChain(mockChain);
      manager.advanceStep(session.id);
      const step = manager.getCurrentStep(session, mockChain);

      expect(step?.stepNumber).toBe(2);
      expect(step?.title).toBe('Second Step');
    });

    it('should return null for invalid step number', () => {
      const session = manager.startChain(mockChain);
      session.currentStep = 99;
      const step = manager.getCurrentStep(session, mockChain);

      expect(step).toBeNull();
    });
  });

  describe('substituteVariables', () => {
    it('should substitute [variable] format', () => {
      const prompt = 'Hello [name], welcome to [project]';
      const context = { name: 'Alice', project: 'TestApp' };

      const result = manager.substituteVariables(prompt, context);

      expect(result).toBe('Hello Alice, welcome to TestApp');
    });

    it('should substitute {{variable}} format', () => {
      const prompt = 'Value: {{my_value}}';
      const context = { my_value: '42' };

      const result = manager.substituteVariables(prompt, context);

      expect(result).toBe('Value: 42');
    });

    it('should handle mixed formats', () => {
      const prompt = '[name] has {{count}} items';
      const context = { name: 'Bob', count: '5' };

      const result = manager.substituteVariables(prompt, context);

      expect(result).toBe('Bob has 5 items');
    });

    it('should normalize variable names', () => {
      const prompt = '[Variable Name] and {{Another Var}}';
      const context = { variable_name: 'A', another_var: 'B' };

      const result = manager.substituteVariables(prompt, context);

      expect(result).toBe('A and B');
    });

    it('should preserve unmatched variables', () => {
      const prompt = 'Hello [unknown]';
      const context = {};

      const result = manager.substituteVariables(prompt, context);

      expect(result).toBe('Hello [unknown]');
    });
  });

  describe('formatStep', () => {
    it('should format a step with all fields', () => {
      const session = manager.startChain(mockChain, { variable_name: 'TEST' });
      const step = mockChain.steps[0];
      const formatted = manager.formatStep(step, session);

      expect(formatted).toContain('## Step 1: First Step');
      expect(formatted).toContain('### Prompt');
      expect(formatted).toContain('Do the first thing with TEST');
      expect(formatted).toContain('### Expected Output');
      expect(formatted).toContain('- Output 1');
      expect(formatted).toContain('**Decision Point:**');
    });

    it('should handle step without decision point', () => {
      const session = manager.startChain(mockChain);
      const step = mockChain.steps[1];
      const formatted = manager.formatStep(step, session);

      expect(formatted).not.toContain('Decision Point');
    });

    it('should handle step without expected output', () => {
      const session = manager.startChain(mockChain);
      const step = mockChain.steps[2];
      const formatted = manager.formatStep(step, session);

      expect(formatted).not.toContain('### Expected Output');
    });
  });

  describe('formatSessionStatus', () => {
    it('should show progress information', () => {
      const session = manager.startChain(mockChain);
      manager.advanceStep(session.id);
      const status = manager.formatSessionStatus(session);

      expect(status).toContain('**Chain:** Test Workflow');
      expect(status).toContain('**Progress:**');
      expect(status).toContain('**Current Step:** 2 of 3');
      expect(status).toContain('█');
    });
  });

  describe('getStats', () => {
    it('should return stats about active sessions', () => {
      manager.startChain(mockChain);
      manager.startChain(mockChain);

      const stats = manager.getStats();

      expect(stats.active).toBe(2);
      expect(stats.byChain['Test Workflow']).toBe(2);
    });

    it('should return zero for no sessions', () => {
      const stats = manager.getStats();

      expect(stats.active).toBe(0);
      expect(stats.byChain).toEqual({});
    });
  });
});
