#!/usr/bin/env node
/**
 * AI Library MCP Server - Entry Point
 *
 * This MCP server exposes your AI prompt library with:
 * - Resources: Browse prompts, templates, chains by category
 * - Tools: get_prompt, search_prompts, suggest_prompts, start_chain, save_to_library
 *
 * Usage:
 *   ai-library-mcp                    # Uses default library path (parent directory)
 *   ai-library-mcp /path/to/library   # Custom library path
 *   ai-library-mcp --debug            # Enable debug logging
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// Get directory of this file
const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse arguments
const args = process.argv.slice(2);
const debug = args.includes('--debug') || args.includes('-d');
const nonFlagArgs = args.filter((a) => !a.startsWith('-'));

// Determine library path
let libraryPath: string;

if (nonFlagArgs.length > 0) {
  // Use provided path
  libraryPath = resolve(nonFlagArgs[0]);
} else if (process.env.AI_LIBRARY_PATH) {
  // Use environment variable
  libraryPath = resolve(process.env.AI_LIBRARY_PATH);
} else {
  // Default: parent directory of mcp-server (the ai-library root)
  libraryPath = resolve(__dirname, '..', '..');
}

// Validate library path
if (!existsSync(libraryPath)) {
  console.error(`Error: Library path does not exist: ${libraryPath}`);
  process.exit(1);
}

// Check for prompts directory to validate it's an AI library
const promptsPath = join(libraryPath, 'prompts');
if (!existsSync(promptsPath)) {
  console.error(`Error: Not a valid AI library (missing prompts/ directory): ${libraryPath}`);
  console.error('Make sure to point to the root of your AI library.');
  process.exit(1);
}

// Log startup info (to stderr, not stdout - important for MCP!)
console.error('AI Library MCP Server');
console.error(`Library: ${libraryPath}`);
console.error(`Debug: ${debug}`);

// Create and start server
async function main() {
  try {
    const server = createServer(libraryPath, debug);
    const transport = new StdioServerTransport();

    console.error('Starting server...');
    await server.connect(transport);
    console.error('Server running. Waiting for connections...');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
