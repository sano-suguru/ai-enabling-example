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
  AGENTS.md                      # ツール横断の一次情報（Cursorも参照）
  CLAUDE.md                      # Claude Code用の指示
  .github/
    copilot-instructions.md      # Copilot用の指示
    AI_REVIEW.md                 # AI自動レビューのガイド
    ai-review-config.json         # AIレビュー/自動実装の設定
    workflows/
      ai-review.yml              # PRレビュー + Issue自動実装（GitHub Models）
      ai-review-examples.yml     # 例（検証/参考用）
      ci.yml                     # build/test/lint のCI
    scripts/
      ai-review.cjs              # PRレビューロジック
      ai-implement.cjs           # Issue自動実装ロジック
      test-setup.cjs             # テスト補助
    skills/                      # 再利用しやすい知識（スキル）
```

---

## 2. 対象スコープ

### やること

| 区分 | 内容 |
|------|------|
| プロジェクト本体 | Zenn記事検索MCPサーバー（list / search / get） |
| AI Enabling成果 | AGENTS.md、CLAUDE.md、.github/copilot-instructions.md、AI_REVIEW.md |
| CI統合 | build/test/lint のCI + 残骸禁止のガードレール + PRへの自動レビュー、Issueからの自動実装（GitHub Models、@ai-bot） |
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

設計方針として、ツール横断で共有する一次情報はルートの `AGENTS.md` に集約し、`CLAUDE.md` は「Claude Codeが確実に読むべき最小限の重要事項」の重複に留める（参照リンクの追従が保証されないため）。

実体は `CLAUDE.md` を参照。

### 4.2 AGENTS.md

Cursor / Copilot / Claude Code で共通化できる一次情報（規約・コマンド・構成など）は `AGENTS.md` に集約する。

加えて、「後方互換/削除予定の残骸を残さない（不要コード・設定は削除し参照も更新）」を運用ルールとして明文化する。

### 4.3 .github/copilot-instructions.md

設計方針として、`AGENTS.md` を一次情報の集約先としつつ、Copilotが確実に読むべき重要事項を最小限だけ重複して書く。

実体は `.github/copilot-instructions.md` を参照。

---

## 5. CI統合仕様（GitHub Models）

### 5.1 セットアップ

Settings > Actions > General で権限を有効化:
- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

加えて、GitHub Models にアクセスできるトークンをリポジトリの Secrets に設定する（ワークフローは `AI_GITHUB_TOKEN` を参照）。

### 5.2 ワークフロー（.github/workflows/ai-review.yml）

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  ai-pr-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          ref: ${{ github.event.pull_request.head.sha }}
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install openai@^4.0.0
      - run: node .github/scripts/ai-review.cjs
        env:
          GITHUB_TOKEN: ${{ secrets.AI_GITHUB_TOKEN }}
          AI_MODEL: gpt-4o

  ai-issue-implementation:
    if: |
      github.event_name == 'issue_comment' &&
      contains(github.event.comment.body, '@ai-bot')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install openai@^4.0.0
      - run: node .github/scripts/ai-implement.cjs
        env:
          GITHUB_TOKEN: ${{ secrets.AI_GITHUB_TOKEN }}
          AI_MODEL: gpt-4o
```

### 5.3 できること

| 機能 | トリガー | 説明 |
|------|----------|------|
| PRレビュー | PR作成・更新時 | 自動でコードレビュー（無料） |
| Issue実装 | `@ai-bot` メンション | Issueの内容に基づいて実装・PR作成 |

### 5.4 特徴

- **APIキーの取り扱いを最小化**: GitHub Modelsにアクセス可能なトークンを Secrets（例: `AI_GITHUB_TOKEN`）として管理
- **複数モデル**: gpt-4o, deepseek-r1, llama-3.3-70b-instruct から選択可能
- **注意**: 利用可能なモデルやレート制限/料金は環境・契約・時期によって変動しうるため、最新の公式情報を参照する

---

## 6. README仕様

READMEに記載すべき内容：

### 6.1 構成

```markdown
# Zenn Article Search MCP Server

AI Enablingを実践したサンプルプロジェクト。

## このリポジトリについて

Zenn記事検索MCPサーバーに対して、以下のAI Enablingを適用しています：

- **AGENTS.md / CLAUDE.md / .github/copilot-instructions.md**: AIツール用の指示
- **GitHub Actions統合**: PRレビュー、Issue自動実装

## Quickstart

### MCPサーバーを試す（ローカル）

1. クローン
2. npm install
3. npm run build
4. Claude Desktopで接続設定

### CI統合を試す（フォーク）

1. リポジトリをフォーク
2. Settings > Actions > General で権限を有効化
3. PRを作成 → 自動レビュー
4. Issueを作成して `@ai-bot` メンション → 自動実装

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
| AGENTS.md | ツール横断の一次情報を集約 | すべてのツールが同一に解釈するとは限らない |
| CLAUDE.md | Claude Codeへの指示 | 詳細すぎると制約になる ↔ 簡素すぎると意図が伝わらない |
| .github/copilot-instructions.md | Copilotへの指示 | 同上 |
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
- [ ] AGENTS.md がある
- [ ] .github/copilot-instructions.md がある
- [ ] .github/AI_REVIEW.md がある
- [ ] .github/workflows/ai-review.yml がある

### 7.3 CI統合

- [ ] PRを作成するとAIが自動レビューする（GitHub Models）
- [ ] Issueで `@ai-bot` メンションすると実装・PR作成される

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

1. AGENTS.md
2. CLAUDE.md
3. .github/copilot-instructions.md

### Phase 4: CI統合（1日）

1. Settings > Actions > General で権限を有効化
2. .github/workflows/ai-review.yml 作成
3. .github/scripts/ai-review.cjs, ai-implement.cjs 実装
4. PRレビュー動作確認
5. Issue自動実装動作確認

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
| 3. AI Enabling成果物を確認 | AGENTS.md、CLAUDE.md、AI_REVIEW.md、CI統合を確認 |
| 4. フォークしてCI統合を試す | Settings権限有効化 → Issueで `@ai-bot` → 自動実装を体験 |

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
| AI Enabling成果 | AGENTS.md、CLAUDE.md、.github/copilot-instructions.md、AI_REVIEW.md、CI統合 |
| CI統合 | PRレビュー、Issue自動実装（GitHub Models） |
| READMEの役割 | AI Enablingの説明 + 設計判断の根拠 |

---

## 12. 参考リソース

| リソース | URL |
|----------|-----|
| MCP公式ドキュメント | https://modelcontextprotocol.io/ |
| MCP TypeScript SDK | https://github.com/modelcontextprotocol/typescript-sdk |
| GitHub Models | https://github.blog/ai-and-ml/llms/solving-the-inference-problem-for-open-source-ai-projects-with-github-models/ |
| Zenn RSS | https://zenn.dev/{username}/feed |