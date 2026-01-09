# Design System Extractor

> Extract and standardize design tokens from existing code

## Prompt

```
Extract a design system from this codebase.

Find and standardize:

1. Colors: Scan for hex/rgb. Categorize (primary, secondary, bg, text, success, error). Create CSS variables.

2. Typography: Fonts, sizes, weights. Create a scale.

3. Spacing: Margins, padding, gaps. Create consistent scale (4, 8, 16, 24, 32px).

4. Components: Repeating patterns (buttons, cards, inputs). Create base + variants.

5. Shadows/Borders: Standardize to 2-3 options each.

Output:
1. Design tokens file
2. When to use what
3. Inconsistencies to fix
4. Migration plan

Make it practical. I should use this tomorrow.
```

## Usage Tips

- Use when inheriting a codebase with inconsistent styling
- Use before a visual refresh to understand current state
- Creates foundation for consistent future development
- Pair with designers if available for token naming

## Pairs Well With

- [tech-debt-audit.md](../development/tech-debt-audit.md) - Includes style debt
- [code-cleaner.md](../development/code-cleaner.md) - Clean up after extraction
- `snippets/modifiers/be-thorough.md` - Find all instances

## Expected Output

### 1. Design Tokens File

```css
/* tokens.css */

:root {
  /* Colors - Primary */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  
  /* Colors - Neutral */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
  
  /* Colors - Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Spacing */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
  
  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
  
  --border-width: 1px;
  --border-color: var(--color-gray-200);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

### 2. Usage Guide

| Token Category | Use For |
|---------------|---------|
| `--color-primary-*` | CTAs, links, active states |
| `--color-gray-*` | Text, backgrounds, borders |
| `--color-success/warning/error` | Feedback, validation |
| `--text-sm` | Secondary text, labels |
| `--text-base` | Body text |
| `--text-xl+` | Headings |
| `--space-2` | Tight spacing (inside buttons) |
| `--space-4` | Default spacing |
| `--space-8` | Section spacing |

### 3. Inconsistencies Found

```markdown
## Color Inconsistencies
- 14 different blue shades found → Consolidate to 5
- `#333` and `#374151` both used for text → Use --color-gray-700

## Typography Issues
- Font sizes: 11px, 12px, 13px, 14px found → Standardize to scale
- 4 different fonts loaded → Reduce to 2

## Spacing Chaos
- 47 unique spacing values → Reduce to 8-step scale
```

### 4. Migration Plan

| File | Current | Replace With |
|------|---------|--------------|
| `Button.tsx` | `color: #3b82f6` | `color: var(--color-primary-500)` |
| `Card.tsx` | `padding: 20px` | `padding: var(--space-5)` |
| `Input.tsx` | `font-size: 14px` | `font-size: var(--text-sm)` |
