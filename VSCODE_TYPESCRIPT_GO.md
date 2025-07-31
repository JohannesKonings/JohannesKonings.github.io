# VS Code + TypeScript-Go Setup Guide

This project is now configured to use TypeScript-Go (tsgo) for both command-line builds and VS Code type checking.

## VS Code Configuration

### 1. Install Required Extension

VS Code will now prompt you to install the **TypeScript (Native Preview)** extension when you open the workspace. This extension enables TypeScript-Go integration in VS Code.

### 2. Extension Configuration

The workspace is already configured with:

```json
{
  "typescript.experimental.useTsgo": true
}
```

This setting tells VS Code to use TypeScript-Go instead of the built-in TypeScript language service for:

- Type checking
- IntelliSense
- Error reporting
- Go to definition
- Refactoring

### 3. Workspace Layout

The configuration is applied at multiple levels:

- **Root workspace** (`.vscode/settings.json`): Global TypeScript-Go settings
- **Astro workspace** (`websites/astro/.vscode/`): Astro-specific + TypeScript-Go
- **TanStack workspace** (`websites/tanstack/.vscode/`): React-specific + TypeScript-Go

## Features in VS Code

With TypeScript-Go enabled, you'll get:

✅ **Faster type checking** - Native Go performance  
✅ **Same TypeScript compatibility** - Full TS 5.8 feature support  
✅ **Better error messages** - Improved diagnostic output  
✅ **Incremental compilation** - Faster rebuilds  
✅ **Modern module resolution** - Enhanced ESM support

## Verification

To verify TypeScript-Go is working in VS Code:

1. **Check status bar**: Look for "tsgo" in the bottom status bar when editing TypeScript files
2. **Extension active**: The TypeScript (Native Preview) extension should be active
3. **Command palette**: `TypeScript: Restart TS Server` should show TypeScript-Go

## Troubleshooting

### Extension Not Installing

If the extension doesn't install automatically:

```bash
code --install-extension TypeScriptTeam.native-preview
```

### Fallback to Regular TypeScript

If you need to temporarily disable TypeScript-Go:

1. Open Command Palette (`Cmd/Ctrl + Shift + P`)
2. Run `TypeScript (Native Preview): Disable (Experimental)`
3. Or remove `"typescript.experimental.useTsgo": true` from settings

### Performance Issues

If you experience performance issues:

1. Restart the TypeScript service: `Cmd/Ctrl + Shift + P` → `TypeScript: Restart TS Server`
2. Check TypeScript-Go version: `npx tsgo --version`
3. Ensure you're using `target: "esnext"` in tsconfig.json

## Command Line Usage

VS Code integration works alongside command-line usage:

```bash
# Type check all projects (same as VS Code)
pnpm tsc:check

# Type check specific workspace
pnpm --filter astro type-check
pnpm --filter tanstack type-check

# Build with type checking
pnpm build:astro
pnpm build:tanstack
```

## Benefits Over Regular TypeScript

1. **Performance**: 2-5x faster compilation in large projects
2. **Memory**: Lower memory usage for large codebases
3. **Features**: Better support for modern ECMAScript features
4. **Compatibility**: 100% compatible with existing TypeScript code
5. **Future-proof**: Microsoft's next-generation TypeScript implementation

The configuration ensures both your development environment and CI/CD pipelines use the same TypeScript-Go tooling for consistency.
