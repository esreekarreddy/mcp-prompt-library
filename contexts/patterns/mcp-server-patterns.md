# MCP Server Best Practices (2026)

> Production patterns for Model Context Protocol servers based on latest SDK and industry standards.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    AI Client                         │
│              (Claude, GPT, Cursor)                   │
└─────────────────────┬───────────────────────────────┘
                      │ MCP Protocol (JSON-RPC)
                      ▼
┌─────────────────────────────────────────────────────┐
│                 MCP Server                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Tools     │ │  Resources  │ │   Prompts   │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │   DB    │   │   API   │   │  Files  │
   └─────────┘   └─────────┘   └─────────┘
```

## Implementation Pattern (TypeScript)

### Use McpServer (High-Level API)
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'my-production-server',
  version: '1.0.0',
});

// Register tools with Zod validation (automatic schema generation)
server.tool(
  'create_issue',
  {
    title: z.string().describe('Issue title'),
    body: z.string().describe('Issue description'),
    labels: z.array(z.string()).optional(),
  },
  async ({ title, body, labels }, extra) => {
    // extra.meta contains session/auth context
    const issue = await github.createIssue({ title, body, labels });
    
    return {
      content: [
        { type: 'text', text: `Created issue #${issue.number}` }
      ]
    };
  }
);

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Resources (Read-Only Data Sources)
```typescript
server.resource(
  'config://settings',
  'Application configuration',
  async () => ({
    contents: [{
      uri: 'config://settings',
      mimeType: 'application/json',
      text: JSON.stringify(await loadConfig())
    }]
  })
);
```

### Prompts (Reusable Templates)
```typescript
server.prompt(
  'debug-issue',
  {
    error: z.string().describe('Error message'),
    context: z.string().optional(),
  },
  async ({ error, context }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Debug this error: ${error}\n\nContext: ${context || 'None'}`
      }
    }]
  })
);
```

## Security Checklist

### 1. DNS Rebinding Protection (Critical for localhost)
```typescript
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';

const app = createMcpExpressApp({
  host: 'localhost',
  // Automatically validates Host header
});
```

### 2. OAuth 2.1 for Remote Servers
```typescript
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const transport = new StreamableHTTPServerTransport({
  authenticate: async (request) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Unauthorized');
    
    const session = await validateOAuth21Token(token);
    return { userId: session.userId, scopes: session.scopes };
  }
});
```

### 3. Input Validation (Always use Zod)
```typescript
server.tool(
  'execute_query',
  {
    // Strict validation prevents injection
    query: z.string().max(1000).regex(/^SELECT/i, 'Only SELECT allowed'),
    database: z.enum(['analytics', 'reporting']),
  },
  async ({ query, database }) => {
    // Safe to execute
  }
);
```

### 4. Sandboxing for Code Execution
```typescript
server.tool(
  'run_code',
  { code: z.string(), language: z.enum(['python', 'javascript']) },
  async ({ code, language }) => {
    // Execute in Docker container with resource limits
    const result = await sandbox.execute(code, {
      language,
      timeout: 5000,
      memoryLimit: '128mb',
      networkDisabled: true,
    });
    return { content: [{ type: 'text', text: result.output }] };
  }
);
```

## Performance Optimization

### 1. Progress Notifications (Long-running tools)
```typescript
server.tool(
  'analyze_codebase',
  { path: z.string() },
  async ({ path }, extra) => {
    const files = await getFiles(path);
    
    for (let i = 0; i < files.length; i++) {
      await analyzeFile(files[i]);
      
      // Send progress to prevent timeout
      await extra.sendProgressNotification({
        progress: i + 1,
        total: files.length,
        message: `Analyzing ${files[i].name}...`
      });
    }
    
    return { content: [{ type: 'text', text: 'Analysis complete' }] };
  }
);
```

### 2. Connection Pooling (Database servers)
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

server.tool('query', { sql: z.string() }, async ({ sql }) => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    return { content: [{ type: 'text', text: JSON.stringify(result.rows) }] };
  } finally {
    client.release();
  }
});
```

## Testing with InMemoryTransport

```typescript
import { InMemoryTransport } from '@modelcontextprotocol/sdk/common/transport.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { describe, it, expect } from 'vitest';

describe('MCP Server', () => {
  it('should execute tool correctly', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    
    // Connect server
    await server.connect(serverTransport);
    
    // Connect client
    const client = new Client({ name: 'test-client', version: '1.0' });
    await client.connect(clientTransport);
    
    // Call tool
    const result = await client.callTool('create_issue', {
      title: 'Test Issue',
      body: 'Test body'
    });
    
    expect(result.content[0].text).toContain('Created issue');
  });
});
```

## Monitoring with Sentry

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });

const server = Sentry.wrapMcpServerWithSentry(
  new McpServer({ name: 'my-server', version: '1.0.0' })
);
```

## Transport Selection

| Transport | Use Case | Example |
|-----------|----------|---------|
| `Stdio` | Local CLI tools, IDE extensions | Claude Desktop, Cursor |
| `StreamableHTTP` | Web services, remote APIs | Cloud deployments |
| `SSE` | ⚠️ Deprecated (June 2025) | Migrate to StreamableHTTP |

## Checklist for Production

- [ ] Using `McpServer` high-level API
- [ ] Zod validation on all tool inputs
- [ ] DNS rebinding protection (localhost servers)
- [ ] OAuth 2.1 (remote servers)
- [ ] Progress notifications for long tools
- [ ] Connection pooling for databases
- [ ] InMemoryTransport tests
- [ ] Sentry monitoring
- [ ] MCP Inspector tested (`npx @modelcontextprotocol/inspector`)
