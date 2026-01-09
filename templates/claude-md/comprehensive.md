# CLAUDE.md - Comprehensive Template

> Full project context with detailed guidelines

Copy this file to your project root and customize.

---

# Project: [Project Name]

[Brief description of what this project does and who it's for]

## Quick Start

```bash
# Prerequisites
node >= 18
npm >= 9

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x |
| Runtime | Node.js 20.x |
| Framework | [Framework] |
| Database | [Database] |
| ORM | [ORM] |
| Testing | [Test Framework] |
| Styling | [CSS Solution] |

## Project Structure

```
.
├── src/
│   ├── app/              # App routes and pages
│   ├── components/       # React components
│   │   ├── ui/          # Base UI components
│   │   └── features/    # Feature-specific components
│   ├── lib/             # Shared utilities
│   │   ├── api/         # API client functions
│   │   ├── db/          # Database utilities
│   │   └── utils/       # Helper functions
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   └── config/          # Configuration
├── tests/               # Test files
├── scripts/             # Build/deployment scripts
└── docs/                # Documentation
```

## Architecture

### Data Flow
```
User Action → Component → Hook/Action → API Route → Service → Database
                                              ↓
User ← Component ← State Update ← Response ←─┘
```

### Key Patterns
- **Repository Pattern**: Database access through repository classes
- **Service Layer**: Business logic in service classes
- **React Server Components**: Default, use 'use client' when needed

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types - use `unknown` or proper types
- Prefer interfaces over types for objects
- Use const assertions for constants

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserProfile` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProfile` |

### Component Structure
```tsx
// 1. Imports
import { ... } from '...';

// 2. Types
interface Props { ... }

// 3. Component
export function ComponentName({ prop }: Props) {
  // 3a. Hooks
  // 3b. Derived state
  // 3c. Handlers
  // 3d. Effects
  // 3e. Render
}
```

### Error Handling
- Use try/catch for async operations
- Return typed errors from services
- Log errors with context
- Show user-friendly messages

## Important Files

### Configuration
- `src/config/env.ts` - Environment variables
- `src/config/constants.ts` - App constants
- `next.config.js` - Next.js configuration

### Database
- `src/lib/db/client.ts` - Database client
- `src/lib/db/schema.ts` - Schema definitions
- `prisma/schema.prisma` - Prisma schema (if using)

### Auth
- `src/lib/auth/session.ts` - Session management
- `src/lib/auth/guards.ts` - Auth guards

## Testing

### Test Structure
```typescript
describe('Feature', () => {
  describe('scenario', () => {
    it('should behave correctly', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- path/to/file  # Specific file
npm run test:coverage # With coverage
```

## Common Tasks

### Adding a New Feature
1. Create types in `src/types/`
2. Add API route in `src/app/api/`
3. Create service in `src/lib/services/`
4. Build component in `src/components/`
5. Write tests

### Database Changes
1. Update schema
2. Generate migration: `npm run db:migrate:create`
3. Apply migration: `npm run db:migrate`
4. Update types if needed

### Environment Variables
- Never commit `.env`
- Add new vars to `.env.example`
- Document in this file

## Troubleshooting

### Common Issues
| Issue | Solution |
|-------|----------|
| Types out of sync | Run `npm run generate` |
| Database connection fails | Check `.env` DATABASE_URL |
| Build fails | Clear `.next` and rebuild |

## Resources

- [Framework Docs](link)
- [Internal Wiki](link)
- [API Reference](link)
