# ポートフォリオ設計（AI Enabling向け）

## 概要

**何を作るか**：Zenn記事検索MCPサーバーに対してAI Enablingを適用したサンプル

**何を見せるか**：実際のプロジェクトでAI Enablingをやるとどうなるか

---

## 1. ポートフォリオの構造

```
ai-enabling-example/
  README.md                      # AI Enablingとは、なぜやったか、設計判断の根拠
  
  # プロジェクト本体（Zenn記事検索MCPサーバー）
  src/
    index.ts
    server.ts
    tools/
      list-articles.ts
      search-articles.ts
      get-article.ts
  package.json
  tsconfig.json
  
  # AI Enabling成果物（実際に使われている状態）
  CLAUDE.md                      # Claude Code用の指示
  .cursorrules                   # Cursor用の指示
  .github/
    copilot-instructions.md      # Copilot用の指示
    workflows/
      claude.yml                 # PRレビュー + Issue自動実装
```

---

## 2. 対象スコープ

### やること

| 区分 | 内容 |
|------|------|
| プロジェクト本体 | Zenn記事検索MCPサーバー（list / search / get） |
| AI Enabling成果 | CLAUDE.md、.cursorrules、copilot-instructions.md |
| CI統合 | PRへの自動レビュー、Issueからの自動実装（@claude） |
| README | AI Enablingとは何か、設計判断の根拠（トレードオフ含む） |

### やらないこと

- 汎用的なガイドライン・ポリシーのドキュメント集
- 効果測定ダッシュボードの実装
- 複数のMCPサーバー
- LLMOps / RAG基盤

---

## 3. Zenn記事検索MCPサーバー仕様

### 3.1 機能

| ツール | 説明 |
|--------|------|
| `list_articles` | 記事一覧を取得（RSS or API） |
| `search_articles` | 記事をキーワード検索 |
| `get_article` | 記事の本文を取得 |

### 3.2 技術選定

| 項目 | 選定 | 理由 |
|------|------|------|
| 言語 | TypeScript | MCP SDKの主流、型安全 |
| スキーマ定義 | Zod | MCP SDK v1.0以降の標準 |
| データ取得 | Zenn RSS（`/feed`） | APIキー不要、シンプル |
| ランタイム | Node.js 20.x | LTS |

### 3.3 ディレクトリ構成

```
src/
  index.ts              # エントリーポイント
  server.ts             # MCPサーバー本体
  tools/
    list-articles.ts    # 記事一覧取得
    search-articles.ts  # 記事検索
    get-article.ts      # 記事本文取得
  utils/
    rss-parser.ts       # RSS解析
    fetcher.ts          # HTTP取得
    logger.ts           # ロギング
tests/
  tools.test.ts
```

### 3.4 ツール定義（例）

**注**: MCP SDK v1.0以降は`McpServer`クラスとZodスキーマを使用

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';

const server = new McpServer({
  name: 'zenn-search',
  version: '1.0.0'
});

// list_articles
server.registerTool(
  'list_articles',
  {
    title: 'List Zenn Articles',
    description: 'Zennの記事一覧を取得します',
    inputSchema: {
      limit: z.number().optional().describe('取得件数（デフォルト: 20）')
    },
    outputSchema: {
      articles: z.array(z.object({
        title: z.string(),
        url: z.string(),
        publishedAt: z.string()
      }))
    }
  },
  async ({ limit = 20 }) => {
    // Implementation
    const output = { articles: [] };
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output
    };
  }
);

// search_articles
server.registerTool(
  'search_articles',
  {
    title: 'Search Zenn Articles',
    description: 'Zennの記事をキーワードで検索します',
    inputSchema: {
      query: z.string().describe('検索キーワード')
    },
    outputSchema: {
      articles: z.array(z.object({
        title: z.string(),
        url: z.string(),
        publishedAt: z.string()
      }))
    }
  },
  async ({ query }) => {
    // Implementation
  }
);

// get_article
server.registerTool(
  'get_article',
  {
    title: 'Get Zenn Article',
    description: 'Zennの記事本文を取得します',
    inputSchema: {
      slug: z.string().describe('記事のslug')
    },
    outputSchema: {
      title: z.string(),
      content: z.string(),
      publishedAt: z.string()
    }
  },
  async ({ slug }) => {
    // Implementation
  }
);
```

---

## 4. AI Enabling成果物仕様

### 4.1 CLAUDE.md

このプロジェクトでClaude Codeを使うための指示。

```markdown
# CLAUDE.md

## プロジェクト概要
Zenn記事検索MCPサーバー。AI Enablingの実践サンプル。

## 技術スタック
- TypeScript
- Node.js 20.x
- MCP SDK（@modelcontextprotocol/sdk）

## ディレクトリ構成
- src/: ソースコード
- src/tools/: MCPツール実装
- tests/: テスト

## コマンド
- `npm install`: 依存関係インストール
- `npm run build`: ビルド
- `npm run dev`: 開発サーバー起動
- `npm test`: テスト実行
- `npm run lint`: lint実行

## コーディング規約
- 関数にはJSDocコメントを付ける
- エラーハンドリングは必ず行う
- 新規関数には単体テストを書く

## 注意事項
- 外部APIキーは使用しない（RSSのみ）
- console.logではなくloggerを使う
```

### 4.2 .cursorrules

```markdown
# Project Rules

## 概要
Zenn記事検索MCPサーバー。TypeScriptで実装。

## コーディング規約
- TypeScriptを使用
- 関数にはJSDocコメントを付ける
- エラーハンドリングは必ず行う
- async/awaitを使用（コールバック不可）

## テスト
- 新規関数には単体テストを書く
- テストファイルは tests/ に配置

## セキュリティ
- 環境変数は直接コードに書かない
- 外部入力は必ずバリデーション
```

### 4.3 .github/copilot-instructions.md

```markdown
# Copilot Instructions

## General
- Use TypeScript for all code
- Follow functional programming patterns where appropriate
- Write comprehensive error handling

## Testing
- Write unit tests for new functions
- Use descriptive test names

## Security
- Never hardcode secrets
- Validate all external inputs
```

---

## 5. CI統合仕様（Claude Code Actions）

### 5.1 セットアップ

Claude Code CLIで `/install-github-app` を実行してセットアップ。

### 5.2 ワークフロー（.github/workflows/claude.yml）

```yaml
name: Claude Code

on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  issues:
    types: [opened, assigned]
  pull_request_review:
    types: [submitted]
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-code:
    if: |
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
      (github.event_name == 'issues' && contains(github.event.issue.body, '@claude')) ||
      github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
```

### 5.3 できること

| 機能 | トリガー | 説明 |
|------|----------|------|
| PRレビュー | PR作成・更新時 | 自動でコードレビュー |
| Issue実装 | `@claude` メンション | Issueの内容に基づいて実装・PR作成 |
| 質問回答 | `@claude` メンション | コードに関する質問に回答 |

---

## 6. README仕様

READMEに記載すべき内容：

### 6.1 構成

```markdown
# Zenn Article Search MCP Server

AI Enablingを実践したサンプルプロジェクト。

## このリポジトリについて

Zenn記事検索MCPサーバーに対して、以下のAI Enablingを適用しています：

- **CLAUDE.md / .cursorrules / copilot-instructions.md**: AIツール用の指示
- **GitHub Actions統合**: PRレビュー、Issue自動実装

## Quickstart

### MCPサーバーを試す（ローカル）

1. クローン
2. npm install
3. npm run build
4. Claude Desktopで接続設定

### CI統合を試す（フォーク）

1. リポジトリをフォーク
2. Claude Codeで `/install-github-app` 実行
3. Issueを作成して `@claude` メンション

## AI Enablingとは

（定義と、なぜ重要かを簡潔に説明）

## 設計判断の根拠

### なぜZenn記事検索MCPか

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| 社内ドキュメント検索 | 実用的だが外部公開しにくい | ❌ |
| GitHub API連携 | 汎用的だがAPIキー必要 | ❌ |
| Zenn記事検索 | 公開情報、APIキー不要、自分の記事 | ✅ |

### なぜRSSを使うか

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| Zenn API（非公式） | 詳細取れるが壊れやすい | ❌ |
| スクレイピング | 柔軟だが壊れやすい | ❌ |
| RSS | シンプル、安定 | ✅ |

### AI Enabling成果物の設計

| 成果物 | 目的 | トレードオフ |
|--------|------|-------------|
| CLAUDE.md | Claude Codeへの指示 | 詳細すぎると制約になる ↔ 簡素すぎると意図が伝わらない |
| .cursorrules | Cursorへの指示 | 同上 |
| CI統合 | 自動化 | 過度な自動化は品質低下 ↔ 手動では効率悪い |

## 参考リソース

- MCP公式ドキュメント
- Claude Code Actions公式ドキュメント
```

---

## 7. 完成条件（Acceptance Criteria）

### 7.1 MCPサーバー

- [ ] `npm install` で依存関係がインストールされる
- [ ] `npm run build` でビルドされる
- [ ] `npm run dev` で開発サーバーが起動する
- [ ] Claude Desktop / Cursor で接続できる
- [ ] `list_articles` が動作する
- [ ] `search_articles` が動作する
- [ ] `get_article` が動作する
- [ ] テストが通る

### 7.2 AI Enabling成果物

- [ ] CLAUDE.md がある
- [ ] .cursorrules がある
- [ ] .github/copilot-instructions.md がある
- [ ] .github/workflows/claude.yml がある

### 7.3 CI統合

- [ ] PRを作成するとClaudeが自動レビューする
- [ ] Issueで `@claude` メンションすると実装・PR作成される

### 7.4 README

- [ ] Quickstartがある（MCPサーバー、CI統合）
- [ ] AI Enablingの説明がある
- [ ] 設計判断の根拠（トレードオフ）がある

---

## 8. 実装順序

### Phase 1: 骨格（1日）

1. リポジトリ作成
2. package.json、tsconfig.json
3. MCPサーバーの雛形（Hello World）
4. README骨格

### Phase 2: MCPサーバー実装（2日）

1. list_articles ツール
2. search_articles ツール
3. get_article ツール
4. Claude Desktopでの接続確認
5. テスト追加

### Phase 3: AI Enabling成果物（1日）

1. CLAUDE.md
2. .cursorrules
3. .github/copilot-instructions.md

### Phase 4: CI統合（1日）

1. `/install-github-app` でセットアップ
2. .github/workflows/claude.yml 作成
3. PRレビュー動作確認
4. Issue自動実装動作確認

### Phase 5: README仕上げ（1日）

1. Quickstart
2. AI Enablingの説明
3. 設計判断の根拠

---

## 9. 評価者の体験

| ステップ | 体験 |
|----------|------|
| 1. READMEを読む | AI Enablingとは何か、このプロジェクトで何をやったかを理解 |
| 2. MCPサーバーを試す（ローカル） | `npm install` → `npm run build` → Claude Desktopで接続 → 記事検索 |
| 3. AI Enabling成果物を確認 | CLAUDE.md、.cursorrules、CI統合を確認 |
| 4. フォークしてCI統合を試す | `/install-github-app` → Issueで `@claude` → 自動実装を体験 |

---

## 10. リポジトリ名

`ai-enabling-example`

---

## 11. 決定事項サマリ

| 項目 | 決定 |
|------|------|
| 狙い | AI Enabling採用向けポートフォリオ |
| 対象プロジェクト | Zenn記事検索MCPサーバー |
| MCPサーバー機能 | list_articles、search_articles、get_article |
| データ取得 | Zenn RSS |
| AI Enabling成果 | CLAUDE.md、.cursorrules、copilot-instructions.md、CI統合 |
| CI統合 | PRレビュー、Issue自動実装（Claude MAX $100で追加費用なし） |
| READMEの役割 | AI Enablingの説明 + 設計判断の根拠 |

---

## 12. 参考リソース

| リソース | URL |
|----------|-----|
| MCP公式ドキュメント | https://modelcontextprotocol.io/ |
| MCP TypeScript SDK | https://github.com/modelcontextprotocol/typescript-sdk |
| Claude Code Actions | https://docs.anthropic.com/claude-code/github-actions |
| Zenn RSS | https://zenn.dev/{username}/feed |