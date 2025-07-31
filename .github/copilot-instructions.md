# GitHub Copilot Instructions

## Package Management

When adding dependencies to package.json files, always use exact versions without range operators:

- ✅ Use: `"package-name": "1.2.3"`
- ❌ Avoid: `"package-name": "^1.2.3"` or `"package-name": "~1.2.3"`

This ensures reproducible builds and prevents unexpected version updates that could introduce breaking changes.

### Examples

**Good:**
```json
{
  "dependencies": {
    "react": "18.2.0",
    "@tanstack/react-router": "1.58.3",
    "tailwindcss": "3.4.1"
  }
}
```

**Avoid:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "@tanstack/react-router": "~1.58.3",
    "tailwindcss": ">=3.4.1"
  }
}
```

This applies to both `dependencies` and `devDependencies` sections.
