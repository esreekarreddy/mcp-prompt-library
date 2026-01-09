/**
 * Chain Tools - Multi-step workflow management
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Library } from '../lib/library.js';
import { ChainManager } from '../lib/chains.js';

export function registerChainTools(
  server: McpServer,
  library: Library,
  chainManager: ChainManager,
  ensureInitialized: () => Promise<void>
) {
  // list_chains
  server.tool(
    'list_chains',
    'List all available workflow chains in the library',
    {},
    async () => {
      await ensureInitialized();
      const chains = library.getAllChains();

      if (chains.length === 0) {
        return { content: [{ type: 'text', text: 'No chains found in the library.' }] };
      }

      const lines = ['# Available Workflow Chains', '', 'Multi-step workflows for common development tasks:', ''];
      for (const chain of chains) {
        lines.push(`## ${chain.name}`);
        lines.push(`**ID:** \`${chain.id}\``);
        lines.push(`**Steps:** ${chain.steps.length}`);
        if (chain.description) lines.push(`> ${chain.description}`);
        if (chain.overview) lines.push(`\`\`\`\n${chain.overview}\n\`\`\``);
        lines.push('');
      }
      lines.push('---', 'Use `start_chain <chain_id>` to begin a workflow.');
      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // start_chain
  server.tool(
    'start_chain',
    'Start a multi-step workflow chain. Chains guide you through complex processes like building features, fixing bugs, or security hardening.',
    {
      chain: z.string().describe('Chain ID or name (e.g., "new-feature", "bug-fix", "security-hardening")'),
      context: z.record(z.string()).optional().describe('Key-value pairs for variable substitution in prompts'),
    },
    async ({ chain: chainName, context = {} }) => {
      await ensureInitialized();
      const chain = library.getChain(chainName);

      if (!chain) {
        const allChains = library.getAllChains();
        let errorMsg = `Chain "${chainName}" not found.`;
        if (allChains.length > 0) {
          errorMsg += '\n\nAvailable chains:\n';
          for (const c of allChains) {
            errorMsg += `- ${c.id} (${c.name})\n`;
          }
        }
        return { content: [{ type: 'text', text: errorMsg }], isError: true };
      }

      const session = chainManager.startChain(chain, context);
      const currentStep = chainManager.getCurrentStep(session, chain);

      const lines = [`# Started Chain: ${chain.name}`, '', chainManager.formatSessionStatus(session), ''];

      if (chain.prerequisites.length > 0) {
        lines.push('## Prerequisites');
        for (const prereq of chain.prerequisites) {
          lines.push(`- ${prereq}`);
        }
        lines.push('');
      }

      if (currentStep) {
        lines.push(chainManager.formatStep(currentStep, session));
      }

      lines.push('---');
      lines.push(`**Session ID:** \`${session.id}\``);
      lines.push('');
      lines.push('**Commands:**');
      lines.push('- `chain_next session_id="..."` - Advance to next step');
      lines.push('- `chain_status session_id="..."` - View current progress');
      lines.push('- `chain_step session_id="..." step=N` - Jump to specific step');

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // chain_next
  server.tool(
    'chain_next',
    'Advance to the next step in an active chain session',
    {
      session_id: z.string().describe('The session ID from start_chain'),
    },
    async ({ session_id }) => {
      await ensureInitialized();
      const session = chainManager.getSession(session_id);

      if (!session) {
        return { content: [{ type: 'text', text: `Session "${session_id}" not found.` }], isError: true };
      }

      const chain = library.getChain(session.chainId);
      if (!chain) {
        return { content: [{ type: 'text', text: 'Chain no longer exists.' }], isError: true };
      }

      if (session.currentStep >= session.totalSteps) {
        chainManager.endSession(session_id);
        return {
          content: [{
            type: 'text',
            text: `# Chain Complete!\n\nYou have completed all ${session.totalSteps} steps of "${chain.name}".\n\nSession ended.`
          }]
        };
      }

      const updatedSession = chainManager.advanceStep(session_id);
      if (!updatedSession) {
        return { content: [{ type: 'text', text: 'Failed to advance step.' }], isError: true };
      }

      const currentStep = chainManager.getCurrentStep(updatedSession, chain);
      const lines = [chainManager.formatSessionStatus(updatedSession), ''];
      if (currentStep) {
        lines.push(chainManager.formatStep(currentStep, updatedSession));
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // chain_status
  server.tool(
    'chain_status',
    'View the current status and step of an active chain session',
    {
      session_id: z.string().optional().describe('Session ID (if not provided, shows all active sessions)'),
    },
    async ({ session_id }) => {
      await ensureInitialized();

      if (session_id) {
        const session = chainManager.getSession(session_id);
        if (!session) {
          return { content: [{ type: 'text', text: `Session "${session_id}" not found.` }], isError: true };
        }

        const chain = library.getChain(session.chainId);
        const lines = [`# Chain Status: ${session.chainName}`, '', chainManager.formatSessionStatus(session), ''];

        if (chain) {
          const currentStep = chainManager.getCurrentStep(session, chain);
          if (currentStep) {
            lines.push('## Current Step');
            lines.push(chainManager.formatStep(currentStep, session));
          }
        }

        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      const sessions = chainManager.getAllSessions();
      if (sessions.length === 0) {
        return {
          content: [{ type: 'text', text: 'No active chain sessions.\n\nUse `start_chain <chain_id>` to begin a workflow.' }]
        };
      }

      const lines = ['# Active Chain Sessions', ''];
      for (const session of sessions) {
        lines.push(`## ${session.chainName}`);
        lines.push(`**Session:** \`${session.id}\``);
        lines.push(`**Step:** ${session.currentStep}/${session.totalSteps}`);
        lines.push(`**Started:** ${session.startedAt.toISOString()}`);
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );

  // chain_step (jump to specific step)
  server.tool(
    'chain_step',
    'Jump to a specific step in an active chain session',
    {
      session_id: z.string().describe('The session ID'),
      step: z.number().int().min(1).describe('Step number to jump to'),
    },
    async ({ session_id, step }) => {
      await ensureInitialized();
      const session = chainManager.getSession(session_id);

      if (!session) {
        return { content: [{ type: 'text', text: `Session "${session_id}" not found.` }], isError: true };
      }

      const chain = library.getChain(session.chainId);
      if (!chain) {
        return { content: [{ type: 'text', text: 'Chain no longer exists.' }], isError: true };
      }

      if (step < 1 || step > session.totalSteps) {
        return {
          content: [{ type: 'text', text: `Invalid step number. Must be between 1 and ${session.totalSteps}.` }],
          isError: true
        };
      }

      const updatedSession = chainManager.goToStep(session_id, step);
      if (!updatedSession) {
        return { content: [{ type: 'text', text: 'Failed to jump to step.' }], isError: true };
      }

      const currentStep = chainManager.getCurrentStep(updatedSession, chain);
      const lines = [`# Jumped to Step ${step}`, '', chainManager.formatSessionStatus(updatedSession), ''];
      if (currentStep) {
        lines.push(chainManager.formatStep(currentStep, updatedSession));
      }

      return { content: [{ type: 'text', text: lines.join('\n') }] };
    }
  );
}
