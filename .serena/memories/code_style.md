# コードスタイル・規約

## Git コミットメッセージ
- **言語**: 日本語で記述
- **形式**: Conventional Commit風（例: "機能追加: MCPサーバーの基本実装"）
- **署名なし**: "Generated with Claude Code"やCo-Author署名を含めない
- **絵文字禁止**: コミットメッセージ、PR、Issue、ドキュメントに絵文字を使わない

## TypeScript
- strict modeを有効化
- **JSDocコメントは日本語**で記述
- **コード内コメントも日本語**
- async/awaitを使用（コールバックは使わない）
- 関数型プログラミングパターンを推奨

## MCPサーバー実装パターン
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

server.registerTool(
    'tool-name',
    {
        title: 'ツールタイトル',
        description: 'ツール説明',
        inputSchema: { param: z.string().describe('パラメータ説明') },
        outputSchema: { result: z.string() }
    },
    async ({ param }) => {
        const output = { result: 'value' };
        return {
            content: [{ type: 'text', text: JSON.stringify(output) }],
            structuredContent: output
        };
    }
);
```

## ロギング
- `console.log`の代わりに`logger`ユーティリティを使用
- ログレベル: info, warn, error, debug
