#!/usr/bin/env node
/**
 * AI Library CLI - Direct command-line access to your prompt library
 *
 * Usage:
 *   ai-lib get <name>              Get a prompt by name
 *   ai-lib search <query>          Search prompts
 *   ai-lib suggest <message>       Get suggestions based on intent
 *   ai-lib list [category]         List all prompts or by category
 *   ai-lib chains                  List available chains
 *   ai-lib compose <prompts...>    Combine multiple prompts/snippets
 *   ai-lib random [category]       Get a random prompt
 *   ai-lib stats                   Show library statistics
 */

import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { Library } from './lib/library.js';
import type { LibraryCategory } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const c = (color: keyof typeof colors, text: string) => `${colors[color]}${text}${colors.reset}`;

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

// Determine library path
let libraryPath: string;
if (process.env.AI_LIBRARY_PATH) {
  libraryPath = resolve(process.env.AI_LIBRARY_PATH);
} else {
  libraryPath = resolve(__dirname, '..', '..');
}

// Help text
const HELP = `
${c('bright', 'AI Library CLI')} - Your prompt library at your fingertips

${c('yellow', 'USAGE:')}
  ai-lib <command> [options]

${c('yellow', 'COMMANDS:')}
  ${c('green', 'get')} <name>              Fetch a prompt by ID or fuzzy name
  ${c('green', 'search')} <query>          Search prompts by keyword
  ${c('green', 'suggest')} <message>       Get smart suggestions for what you're doing
  ${c('green', 'list')} [category]         List prompts (optionally filter by category)
  ${c('green', 'chains')}                  Show available workflow chains
  ${c('green', 'compose')} <items...>      Combine multiple prompts/snippets
  ${c('green', 'random')} [category]       Get a random prompt for inspiration
  ${c('green', 'stats')}                   Show library statistics
  ${c('green', 'help')}                    Show this help

${c('yellow', 'CATEGORIES:')}
  prompts, snippets, templates, skills, instructions, chains, contexts, examples

${c('yellow', 'EXAMPLES:')}
  ai-lib get prd-generator
  ai-lib get debugger
  ai-lib search "security audit"
  ai-lib suggest "I need to build a new feature"
  ai-lib list prompts
  ai-lib compose prd-generator ultrathink step-by-step
  ai-lib random snippets

${c('yellow', 'ENVIRONMENT:')}
  AI_LIBRARY_PATH    Path to your AI library (default: ${libraryPath})
`;

async function main() {
  // Initialize library
  const library = new Library(libraryPath, false);

  if (!existsSync(libraryPath)) {
    console.error(c('red', `Error: Library not found at ${libraryPath}`));
    process.exit(1);
  }

  await library.initialize();

  switch (command) {
    case 'get':
    case 'g':
      await cmdGet(library, commandArgs);
      break;

    case 'search':
    case 's':
      await cmdSearch(library, commandArgs);
      break;

    case 'suggest':
    case 'sg':
      await cmdSuggest(library, commandArgs);
      break;

    case 'list':
    case 'ls':
    case 'l':
      await cmdList(library, commandArgs);
      break;

    case 'chains':
    case 'c':
      await cmdChains(library);
      break;

    case 'compose':
    case 'co':
      await cmdCompose(library, commandArgs);
      break;

    case 'random':
    case 'r':
      await cmdRandom(library, commandArgs);
      break;

    case 'stats':
      await cmdStats(library);
      break;

    case 'help':
    case '-h':
    case '--help':
    case undefined:
      console.log(HELP);
      break;

    default:
      console.error(c('red', `Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
  }
}

async function cmdGet(library: Library, args: string[]) {
  const name = args.join(' ');
  if (!name) {
    console.error(c('red', 'Usage: ai-lib get <name>'));
    process.exit(1);
  }

  const item = library.getItem(name);

  if (!item) {
    console.error(c('red', `Prompt "${name}" not found.`));

    const suggestions = library.search(name, 3);
    if (suggestions.length > 0) {
      console.log(c('yellow', '\nDid you mean:'));
      for (const s of suggestions) {
        console.log(`  ${c('cyan', s.item.id)}`);
      }
    }
    process.exit(1);
  }

  console.log(c('bright', `\n# ${item.metadata.title || item.name}\n`));

  if (item.metadata.description) {
    console.log(c('dim', `> ${item.metadata.description}\n`));
  }

  console.log(c('dim', `Category: ${item.category}${item.subcategory ? `/${item.subcategory}` : ''}`));
  if (item.metadata.tags?.length) {
    console.log(c('dim', `Tags: ${item.metadata.tags.join(', ')}`));
  }
  console.log(c('dim', '─'.repeat(60)));
  console.log();
  console.log(item.body);
}

async function cmdSearch(library: Library, args: string[]) {
  const query = args.join(' ');
  if (!query) {
    console.error(c('red', 'Usage: ai-lib search <query>'));
    process.exit(1);
  }

  const results = library.search(query, 10);

  if (results.length === 0) {
    console.log(c('yellow', `No results found for "${query}"`));
    return;
  }

  console.log(c('bright', `\nSearch results for "${query}":\n`));

  for (const result of results) {
    const item = result.item;
    console.log(`${c('cyan', item.id)}`);
    console.log(`  ${item.metadata.title || item.name}`);
    if (item.metadata.description) {
      console.log(`  ${c('dim', item.metadata.description.substring(0, 80))}`);
    }
    console.log();
  }
}

async function cmdSuggest(library: Library, args: string[]) {
  const message = args.join(' ');
  if (!message) {
    console.error(c('red', 'Usage: ai-lib suggest <message>'));
    console.log(c('dim', 'Example: ai-lib suggest "I need to build a new user authentication feature"'));
    process.exit(1);
  }

  const suggestions = library.suggest(message, 5);

  if (suggestions.length === 0) {
    console.log(c('yellow', 'No specific suggestions found. Try being more specific.'));
    return;
  }

  console.log(c('bright', '\nRecommended prompts:\n'));

  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    const confidence = Math.round(s.confidence * 100);
    console.log(`${c('green', `${i + 1}.`)} ${c('cyan', s.item.id)}`);
    console.log(`   ${s.item.metadata.title || s.item.name}`);
    console.log(`   ${c('dim', s.reason)} ${c('yellow', `(${confidence}% match)`)}`);
    console.log();
  }

  console.log(c('dim', 'Use: ai-lib get <id> to fetch any of these'));
}

async function cmdList(library: Library, args: string[]) {
  const category = args[0] as LibraryCategory | undefined;

  if (category) {
    const items = library.getByCategory(category);

    if (items.length === 0) {
      console.log(c('yellow', `No items in category "${category}"`));
      return;
    }

    console.log(c('bright', `\n${category.toUpperCase()} (${items.length} items):\n`));

    // Group by subcategory
    const bySubcat = new Map<string, typeof items>();
    for (const item of items) {
      const sub = item.subcategory || 'general';
      const group = bySubcat.get(sub) || [];
      group.push(item);
      bySubcat.set(sub, group);
    }

    for (const [subcat, subItems] of bySubcat) {
      console.log(c('yellow', `  ${subcat}/`));
      for (const item of subItems) {
        console.log(`    ${c('cyan', item.name)} - ${item.metadata.description || ''}`);
      }
    }
  } else {
    const stats = library.getStats();
    console.log(c('bright', '\nLibrary Overview:\n'));

    for (const [cat, count] of Object.entries(stats.byCategory)) {
      console.log(`  ${c('cyan', cat.padEnd(15))} ${count} items`);
    }

    console.log(c('dim', '\nUse: ai-lib list <category> for details'));
  }
}

async function cmdChains(library: Library) {
  const chains = library.getAllChains();

  if (chains.length === 0) {
    console.log(c('yellow', 'No chains found in the library.'));
    return;
  }

  console.log(c('bright', '\nAvailable Workflow Chains:\n'));

  for (const chain of chains) {
    console.log(`${c('green', chain.name)}`);
    console.log(`  ${c('dim', chain.id)}`);
    console.log(`  ${chain.steps.length} steps`);
    if (chain.description) {
      console.log(`  ${chain.description}`);
    }
    if (chain.overview) {
      console.log(`  ${c('cyan', chain.overview)}`);
    }
    console.log();
  }
}

async function cmdCompose(library: Library, args: string[]) {
  if (args.length < 1) {
    console.error(c('red', 'Usage: ai-lib compose <prompt1> [prompt2] [snippet1] ...'));
    console.log(c('dim', 'Example: ai-lib compose prd-generator ultrathink step-by-step'));
    process.exit(1);
  }

  const items = [];
  const notFound = [];

  for (const name of args) {
    const item = library.getItem(name);
    if (item) {
      items.push(item);
    } else {
      notFound.push(name);
    }
  }

  if (notFound.length > 0) {
    console.error(c('yellow', `Warning: Could not find: ${notFound.join(', ')}`));
  }

  if (items.length === 0) {
    console.error(c('red', 'No items found to compose.'));
    process.exit(1);
  }

  console.log(c('bright', '\n# Composed Prompt\n'));
  console.log(c('dim', `Combining: ${items.map((i) => i.name).join(' + ')}\n`));
  console.log(c('dim', '─'.repeat(60)));
  console.log();

  // Compose: snippets/modifiers first, then main prompts
  const modifiers = items.filter((i) => i.category === 'snippets');
  const others = items.filter((i) => i.category !== 'snippets');

  // Add modifiers at the top if they exist
  for (const mod of modifiers) {
    // Extract just the content (usually short)
    const content = mod.body.replace(/^#.*\n/, '').trim();
    console.log(content);
    console.log();
  }

  // Add main content
  for (const item of others) {
    if (others.length > 1) {
      console.log(c('cyan', `--- ${item.metadata.title || item.name} ---`));
      console.log();
    }
    console.log(item.body);
    console.log();
  }
}

async function cmdRandom(library: Library, args: string[]) {
  const category = args[0] as LibraryCategory | undefined;

  let items = library.getAllItems();

  if (category) {
    items = items.filter((i) => i.category === category);
    if (items.length === 0) {
      console.error(c('red', `No items in category "${category}"`));
      process.exit(1);
    }
  }

  const item = items[Math.floor(Math.random() * items.length)];

  console.log(c('bright', '\n# Random Prompt\n'));
  console.log(`${c('cyan', item.id)}`);
  console.log();

  if (item.metadata.description) {
    console.log(c('dim', `> ${item.metadata.description}`));
    console.log();
  }

  console.log(c('dim', '─'.repeat(60)));
  console.log();
  console.log(item.body);
}

async function cmdStats(library: Library) {
  const stats = library.getStats();

  console.log(c('bright', '\nAI Library Statistics\n'));
  console.log(`${c('cyan', 'Total items:')} ${stats.total}`);
  console.log();
  console.log(c('yellow', 'By category:'));

  for (const [cat, count] of Object.entries(stats.byCategory)) {
    const bar = '█'.repeat(Math.ceil(count / 2));
    console.log(`  ${cat.padEnd(15)} ${c('green', bar)} ${count}`);
  }

  console.log();
  console.log(c('dim', `Library path: ${libraryPath}`));
}

main().catch((err) => {
  console.error(c('red', 'Error:'), err.message);
  process.exit(1);
});
