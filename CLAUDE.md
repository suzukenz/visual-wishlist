## Development Workflow

実装完了後、以下のコマンドを**必ず実行**し、すべてのチェックに合格すること：

```bash
pnpm run typecheck  # TypeScriptの型チェック
pnpm run lint       # ESLintによる静的解析
```

すべての警告はエラーとして扱い、解決してからコミットすること。

## Implementation Policies

### React useEffect Policy

useEffect must be used only for synchronizing with the external world —
for example: API calls, WebSocket connections, browser APIs, external store subscriptions, or timers.
In all other cases, it must not be used.

Anti-patterns
• Copying props or derived values into local state
• Running logic in response to flag changes
• Handling user actions inside effects instead of event handlers
• Updating derived or validation states within effects
• Performing one-time initialization with an empty dependency array (use useMemo instead)

Principles

1. Compute during render when a value can be derived from props or state.
2. Handle user actions in event handlers, not in effects.
3. Keep effects only for real side effects that touch external systems.
4. Whenever you write a useEffect, add a short comment explaining what external resource it synchronizes with.

## Active Technologies

- TypeScript 5, Node.js (Next.js 16.0.1が要求) + Next.js 16.0.1, React 19.2.0, Tailwind CSS 4 (001-toy-priority-sorting)
- ファイルシステム(画像ファイル + JSONファイルで順序管理) (001-toy-priority-sorting)

## Recent Changes

- 001-toy-priority-sorting: Added TypeScript 5, Node.js (Next.js 16.0.1が要求) + Next.js 16.0.1, React 19.2.0, Tailwind CSS 4
