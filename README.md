# Zenn Article Search MCP Server

AI Enablingを実践したサンプルプロジェクト

## このリポジトリについて

Zenn記事検索MCPサーバーに対して、以下のAI Enablingを適用しています：

- **CLAUDE.md / .cursorrules / copilot-instructions.md**: AIツール用の指示
- **GitHub Actions統合**: PRレビュー、Issue自動実装
- **.mcp.json**: Claude Code用MCP統合（Context7、Serena）

## Quickstart

### MCPサーバーを試す（ローカル）

```bash
# 1. クローン
git clone https://github.com/sano-suguru/ai-enabling-example.git
cd ai-enabling-example

# 2. 依存関係のインストール
npm install

# 3. ビルド
npm run build

# 4. Claude Desktopで接続設定
# ~/Library/Application Support/Claude/claude_desktop_config.json に以下を追加：
{
  "mcpServers": {
    "zenn-search": {
      "command": "node",
      "args": ["/absolute/path/to/ai-enabling-example/build/index.js"]
    }
  }
}

# 5. Claude Desktopを再起動して、list_articlesツールを試す
```

### MCPツールの動作例

#### list_articles - 記事一覧取得

```
Zennユーザー「zenn」の記事を5件取得してください
```

| # | タイトル | 公開日 |
|---|----------|--------|
| 1 | [記事のAIレビュー機能の使い方](https://zenn.dev/zenn/articles/how-to-use-ai-review) | 2025/08/20 |
| 2 | [PublicationにGitHubリポジトリを連携してZennのコンテンツを管理する](https://zenn.dev/zenn/articles/connect-to-github-publication) | 2025/01/15 |
| 3 | [ZennをPWAとして使用する](https://zenn.dev/zenn/articles/how-to-use-pwa) | 2024/10/02 |
| 4 | [Publication Proの機能と管理](https://zenn.dev/zenn/articles/publication-pro-features) | 2023/12/18 |
| 5 | [再設定用のメールアドレスを設定する](https://zenn.dev/zenn/articles/recovery-email) | 2023/07/10 |

#### search_articles - キーワード検索

```
Zennユーザー「zenn」の記事から「Markdown」で検索してください
```

| # | タイトル |
|---|----------|
| 1 | [Zenn CLIで記事・本を管理する方法](https://zenn.dev/zenn/articles/zenn-cli-guide) |
| 2 | [Zennのスラッグ（slug）とは](https://zenn.dev/zenn/articles/what-is-slug) |
| 3 | [ZennのMarkdown記法一覧](https://zenn.dev/zenn/articles/markdown-guide) |

#### get_article - 記事本文取得

```
https://zenn.dev/zenn/articles/markdown-guide の記事本文を取得してください
```

記事のタイトルとHTML本文が返されます。

### AI自動レビューを試す（フォーク）

このリポジトリをフォークして、無料のAI自動レビューを体験できます。

**動作例:**
- [AIレビューの例](https://github.com/sano-suguru/ai-enabling-example/pull/6#issuecomment-2566935050) - コード品質、セキュリティ、パフォーマンスの指摘
- [AI自動実装の例](https://github.com/sano-suguru/ai-enabling-example/pull/8) - Issueから自動でコード生成・PR作成

```bash
# 1. このリポジトリをGitHubでフォーク

# 2. Settings → Actions → General で権限を有効化
#    ✅ Read and write permissions
#    ✅ Allow GitHub Actions to create and approve pull requests

# 3. テストPRを作成
git checkout -b test-ai-review
echo "console.log('test');" > test.js
git add . && git commit -m "test: AI review"
git push origin test-ai-review

# 4. GitHubでPRを作成 → AIが自動レビュー！

# 5. Issueで自動実装を試す
#    Issueを作成して @ai-bot とメンション → 自動でPRが作成される
```

**特徴:**
- 完全無料（GitHub Models使用）
- 追加のAPIキー不要
- PRの自動レビュー（コード品質、セキュリティ、パフォーマンス）
- Issueからの自動実装・PR作成（`@ai-bot`メンション）

### 開発

```bash
# 開発サーバー起動（watch mode）
npm run dev

# テスト実行
npm test

# Lint
npm run lint
```

## AI Enablingとは

AI Enabling（AI支援開発の実現）とは、AIツール（Claude Code、Cursor、GitHub Copilotなど）がプロジェクトのコンテキストを理解し、効果的に開発支援できるようにするための取り組みです。

### なぜ重要か

- **開発効率の向上**: AIがプロジェクト固有の規約や構造を理解することで、より適切な提案が可能に
- **品質の維持**: 一貫したコーディング規約やアーキテクチャパターンの適用
- **オンボーディングの加速**: 新しい開発者（人間・AI）がプロジェクトを素早く理解できる

## 設計判断の根拠

### なぜZenn記事検索MCPか

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| 社内ドキュメント検索 | 実用的だが外部公開しにくい | ❌ |
| GitHub API連携 | 汎用的だがAPIキー必要 | ❌ |
| Zenn記事検索 | 公開情報、APIキー不要 | ✅ |

### なぜRSSを使うか

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| Zenn API（非公式） | 詳細取れるが壊れやすい | ❌ |
| スクレイピング | 柔軟だが壊れやすい | ❌ |
| RSS | シンプル、安定 | ✅ |

### AI Enabling成果物の設計

| 成果物 | 目的 | トレードオフ |
|--------|------|-------------|
| CLAUDE.md | Claude Codeへの指示 | 詳細すぎると制約 ↔ 簡素すぎると意図不明 |
| .cursorrules | Cursorへの指示 | 同上 |
| CI統合 | 自動化 | 過度な自動化は品質低下 ↔ 手動は非効率 |

### なぜGitHub Modelsか

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| Claude.ai (Anthropic API) | 高品質だがAPIキー・課金必要 | ❌ |
| GitHub Copilot | 高品質だが月額料金必要 | ❌ |
| GitHub Models | 無料、APIキー不要、複数モデル選択可能 | ✅ |

### なぜ自前スクリプト（.cjs）か

| 選択肢 | トレードオフ | 判断 |
|--------|-------------|------|
| Claude Code Actions | 公式、高品質だが有料（Pro/Team必要） | ❌ |
| GitHub Copilot Autofix | ネイティブ統合だが有料（Copilot必要） | ❌ |
| 自前スクリプト + GitHub Models | 完全無料、カスタマイズ可能だが保守が必要 | ✅ |

## 技術構成

### CI統合の仕組み

- **ワークフロー**: [.github/workflows/ai-review.yml](.github/workflows/ai-review.yml)でPR/Issueイベントをトリガー
- **レビューロジック**: [.github/scripts/ai-review.cjs](.github/scripts/ai-review.cjs)でdiffを取得しAIに送信
- **実装ロジック**: [.github/scripts/ai-implement.cjs](.github/scripts/ai-implement.cjs)でIssue内容を解析しコード生成・PR作成
- **AI基盤**: GitHub Models API（OpenAI互換エンドポイント: `https://models.inference.ai.azure.com`）
- **認証**: Personal Access Token（`AI_GITHUB_TOKEN` secret）

## MCPツール仕様

| ツール | 説明 | 入力 | 出力 |
|--------|------|------|------|
| `list_articles` | 記事一覧取得 | `username: string`, `limit?: number` | `articles: Article[]` |
| `search_articles` | キーワード検索 | `username: string`, `query: string` | `articles: Article[]` |
| `get_article` | 記事本文取得 | `url: string` | `title`, `content`, `url` |

### Article型

```typescript
{
  title: string;        // 記事タイトル
  url: string;          // 記事URL
  publishedAt: string;  // 公開日時（ISO 8601）
  description?: string; // 記事の概要
}
```

### Claude Codeで使う

このリポジトリをクローンすると、`.mcp.json`により自動的にMCPサーバーが認識されます。

```bash
git clone https://github.com/sano-suguru/ai-enabling-example.git
cd ai-enabling-example
npm install && npm run build
# Claude Codeを再起動すると、zenn-searchツールが利用可能に
```

## MCP統合（.mcp.json）

このプロジェクトでは、Claude Codeの開発効率を高めるために以下のMCPサーバーを導入しています。

| MCP | 用途 | コマンド |
|-----|------|---------|
| **zenn-search** | このプロジェクトのMCPサーバー | `node build/index.js` |
| **[Context7](https://github.com/upstash/context7)** | ライブラリドキュメント検索 | `npx -y @upstash/context7-mcp` |
| **[Serena](https://github.com/oraios/serena)** | コードインデックス・セマンティック検索 | `uvx --from git+https://github.com/oraios/serena serena start-mcp-server` |

### なぜMCPを統合するか

| 課題 | 解決策 |
|------|--------|
| Claude Codeはライブラリの最新ドキュメントを知らない | Context7で最新ドキュメントを取得 |
| Claude Codeにはコードインデックス機能がない | Serenaでセマンティック検索を追加 |

### Serenaのセットアップ

```bash
# プロジェクトを初期化
uvx --from git+https://github.com/oraios/serena serena project create . --language typescript

# インデックスを作成
uvx --from git+https://github.com/oraios/serena serena project index .
```

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js 20.x
- **フレームワーク**: MCP SDK (`@modelcontextprotocol/sdk`)
- **スキーマ定義**: Zod
- **RSS解析**: rss-parser
- **データソース**: Zenn RSS feeds

## 参考リソース

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Zenn RSS仕様](https://zenn.dev/zenn/articles/zenn-feed-rss)

## ライセンス

MIT
