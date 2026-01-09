# CLAUDE.md - CLI Tool Template

> Project context for command-line tools

Copy this file to your project root as `CLAUDE.md`.

---

# Project: [CLI Name]

A command-line tool for [purpose].

## Quick Start

```bash
# Install dependencies
npm install

# Run in development
npm run dev -- [command] [args]

# Build
npm run build

# Install globally (for testing)
npm link

# Run tests
npm test
```

## Tech Stack

- **Language**: TypeScript
- **CLI Framework**: Commander.js / Yargs
- **Output**: Chalk + Ora (spinners)
- **Config**: Cosmiconfig
- **Testing**: Vitest

## Project Structure

```
.
├── src/
│   ├── index.ts              # Entry point
│   ├── cli.ts                # CLI setup and commands
│   ├── commands/
│   │   ├── init.ts
│   │   ├── run.ts
│   │   └── config.ts
│   ├── lib/
│   │   ├── config.ts         # Config loading
│   │   ├── logger.ts         # Console output
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── tests/
├── bin/
│   └── cli.js                # Executable entry
├── package.json
└── tsconfig.json
```

## CLI Structure

### Entry Point
```typescript
// src/cli.ts
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { runCommand } from './commands/run';

const program = new Command();

program
  .name('mycli')
  .description('Description of what this CLI does')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(initCommand);

program
  .command('run <file>')
  .description('Run a file')
  .option('-w, --watch', 'Watch for changes')
  .action(runCommand);

program.parse();
```

### Command Pattern
```typescript
// src/commands/init.ts
import { logger } from '../lib/logger';
import { loadConfig } from '../lib/config';

interface InitOptions {
  template: string;
}

export async function initCommand(options: InitOptions) {
  const spinner = logger.spinner('Initializing project...');
  
  try {
    // Do the work
    await createProject(options.template);
    
    spinner.succeed('Project initialized!');
  } catch (error) {
    spinner.fail('Failed to initialize');
    logger.error(error.message);
    process.exit(1);
  }
}
```

### Logger Utility
```typescript
// src/lib/logger.ts
import chalk from 'chalk';
import ora from 'ora';

export const logger = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  spinner: (msg: string) => ora(msg).start(),
};
```

### Configuration Loading
```typescript
// src/lib/config.ts
import { cosmiconfig } from 'cosmiconfig';

const explorer = cosmiconfig('mycli');

export async function loadConfig() {
  const result = await explorer.search();
  if (!result) {
    return getDefaultConfig();
  }
  return { ...getDefaultConfig(), ...result.config };
}
```

## Coding Standards

### Error Handling
```typescript
// Always exit with proper codes
process.exit(0);  // Success
process.exit(1);  // Error

// Catch and format errors
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof UserError) {
    logger.error(error.message);
    process.exit(1);
  }
  // Unexpected error - show stack in debug mode
  throw error;
}
```

### User Prompts
```typescript
import { confirm, input, select } from '@inquirer/prompts';

const name = await input({ message: 'Project name:' });
const confirmed = await confirm({ message: 'Continue?' });
const choice = await select({
  message: 'Select template:',
  choices: [
    { value: 'basic', name: 'Basic' },
    { value: 'full', name: 'Full' },
  ],
});
```

### Progress Indication
```typescript
import ora from 'ora';

const spinner = ora('Loading...').start();
// Do work
spinner.text = 'Processing...';
// More work
spinner.succeed('Done!');
// Or on error
spinner.fail('Failed');
```

## Testing CLIs

```typescript
// tests/cli.test.ts
import { execSync } from 'child_process';

describe('CLI', () => {
  it('should show help', () => {
    const output = execSync('node ./bin/cli.js --help').toString();
    expect(output).toContain('Usage:');
  });

  it('should init project', () => {
    const output = execSync('node ./bin/cli.js init --template basic').toString();
    expect(output).toContain('initialized');
  });
});
```

## Package.json Setup

```json
{
  "name": "mycli",
  "bin": {
    "mycli": "./bin/cli.js"
  },
  "files": ["bin", "dist"],
  "scripts": {
    "dev": "tsx src/cli.ts",
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

## Executable Entry

```javascript
// bin/cli.js
#!/usr/bin/env node
require('../dist/cli.js');
```
