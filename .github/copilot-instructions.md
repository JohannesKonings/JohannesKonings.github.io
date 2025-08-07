# GitHub Copilot Instructions

## Package Management

When adding dependencies to package.json files, always use exact versions without range operators:

- ✅ Use: `"package-name": "1.2.3"`
- ❌ Avoid: `"package-name": "^1.2.3"` or `"package-name": "~1.2.3"`

This ensures reproducible builds and prevents unexpected version updates that could introduce breaking changes.

## Project Documentation

When creating implementation documentation or project specifications, always save them in the top-level `specs/` folder:

- ✅ Create documentation in: `/specs/project-name-spec.md`
- ✅ Use descriptive filenames like `tanstack-blog-implementation.md`
- ✅ Document current implementation status, completed features, pending tasks
- ✅ Include technical details: architecture decisions, dependencies, file structure
- ✅ Structure specs with clear sections for implemented vs. pending features
- ❌ Don't save specs in other folders or as temporary files

This ensures all project documentation is centralized and serves as both implementation reference and roadmap for future development.

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
