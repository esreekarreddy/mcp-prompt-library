# JSON Output

> Format output as valid JSON

## Snippet

```
Return the result as valid JSON. No markdown, no explanation, just JSON.
```

## Usage

Use when:
- Parsing output programmatically
- Storing structured data
- Integrating with other tools

## Examples

### Structured Data
```
Analyze this codebase structure.

Return the result as valid JSON with this schema:
{
  "files": [{ "path": string, "purpose": string }],
  "dependencies": [{ "name": string, "version": string }],
  "patterns": [string]
}
```

### Configuration
```
Generate a configuration for this project.

Return the result as valid JSON. No markdown, no explanation, just JSON.
```

## Variations

### With Schema
```
Return as JSON matching this TypeScript interface:
interface Result {
  field1: string;
  field2: number[];
}
```

### Pretty Printed
```
Return as formatted JSON with 2-space indentation.
```
