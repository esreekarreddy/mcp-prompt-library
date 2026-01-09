/**
 * Chain Manager - Manages active chain sessions and workflow state
 */

import type { Chain, ChainSession, ChainStep } from '../types.js';
import { randomBytes } from 'crypto';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Chain Manager handles active workflow sessions
 */
export class ChainManager {
  private sessions: Map<string, ChainSession> = new Map();
  private debug: boolean;

  constructor(debug = false) {
    this.debug = debug;
  }

  /**
   * Log debug messages
   */
  private log(...args: unknown[]): void {
    if (this.debug) {
      console.error('[ChainManager]', ...args);
    }
  }

  /**
   * Start a new chain session
   */
  startChain(chain: Chain, context: Record<string, string> = {}): ChainSession {
    const session: ChainSession = {
      id: generateSessionId(),
      chainId: chain.id,
      chainName: chain.name,
      currentStep: 1,
      totalSteps: chain.steps.length,
      startedAt: new Date(),
      context,
      completedSteps: [],
    };

    this.sessions.set(session.id, session);
    this.log('Started chain session:', session.id, 'for chain:', chain.name);

    return session;
  }

  /**
   * Get a chain session by ID
   */
  getSession(sessionId: string): ChainSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): ChainSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Advance to the next step in a chain
   */
  advanceStep(sessionId: string): ChainSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Mark current step as completed
    if (!session.completedSteps.includes(session.currentStep)) {
      session.completedSteps.push(session.currentStep);
    }

    // Advance to next step
    if (session.currentStep < session.totalSteps) {
      session.currentStep++;
      this.log('Advanced session', sessionId, 'to step', session.currentStep);
    }

    return session;
  }

  /**
   * Go back to a previous step
   */
  goToStep(sessionId: string, stepNumber: number): ChainSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (stepNumber >= 1 && stepNumber <= session.totalSteps) {
      session.currentStep = stepNumber;
      this.log('Moved session', sessionId, 'to step', stepNumber);
    }

    return session;
  }

  /**
   * Update session context (for variable substitution)
   */
  updateContext(
    sessionId: string,
    updates: Record<string, string>
  ): ChainSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.context = { ...session.context, ...updates };
    return session;
  }

  /**
   * End a chain session
   */
  endSession(sessionId: string): boolean {
    const existed = this.sessions.has(sessionId);
    this.sessions.delete(sessionId);
    if (existed) {
      this.log('Ended session:', sessionId);
    }
    return existed;
  }

  /**
   * Get the current step from a chain for a session
   */
  getCurrentStep(session: ChainSession, chain: Chain): ChainStep | null {
    return chain.steps.find((s) => s.stepNumber === session.currentStep) || null;
  }

  /**
   * Substitute context variables in a prompt
   * Variables are in format [variable_name] or {{variable_name}}
   */
  substituteVariables(prompt: string, context: Record<string, string>): string {
    let result = prompt;

    // Handle [variable] format
    result = result.replace(/\[([^\]]+)\]/g, (match, varName) => {
      const key = varName.toLowerCase().replace(/\s+/g, '_');
      return context[key] || context[varName] || match;
    });

    // Handle {{variable}} format
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const key = varName.trim().toLowerCase().replace(/\s+/g, '_');
      return context[key] || context[varName.trim()] || match;
    });

    return result;
  }

  /**
   * Format a step for display
   */
  formatStep(step: ChainStep, session: ChainSession): string {
    const lines: string[] = [];

    lines.push(`## Step ${step.stepNumber}: ${step.title}`);
    lines.push('');

    if (step.prompt) {
      const substitutedPrompt = this.substituteVariables(step.prompt, session.context);
      lines.push('### Prompt');
      lines.push('```');
      lines.push(substitutedPrompt);
      lines.push('```');
      lines.push('');
    }

    if (step.expectedOutput.length > 0) {
      lines.push('### Expected Output');
      for (const output of step.expectedOutput) {
        lines.push(`- ${output}`);
      }
      lines.push('');
    }

    if (step.decisionPoint) {
      lines.push(`> **Decision Point:** ${step.decisionPoint}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format session status for display
   */
  formatSessionStatus(session: ChainSession): string {
    const progress = `${session.completedSteps.length}/${session.totalSteps}`;
    const progressBar = this.createProgressBar(
      session.currentStep,
      session.totalSteps
    );

    return [
      `**Chain:** ${session.chainName}`,
      `**Progress:** ${progress} steps completed`,
      `**Current Step:** ${session.currentStep} of ${session.totalSteps}`,
      ``,
      progressBar,
    ].join('\n');
  }

  /**
   * Create a visual progress bar
   */
  private createProgressBar(current: number, total: number): string {
    const width = 20;
    const filled = Math.round((current / total) * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round((current / total) * 100);

    return `[${bar}] ${percent}%`;
  }

  /**
   * Get stats about active sessions
   */
  getStats(): { active: number; byChain: Record<string, number> } {
    const byChain: Record<string, number> = {};

    for (const session of this.sessions.values()) {
      byChain[session.chainName] = (byChain[session.chainName] || 0) + 1;
    }

    return {
      active: this.sessions.size,
      byChain,
    };
  }
}
