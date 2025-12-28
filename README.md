# Zenn Article Search MCP Server

AI Enablingを実践したサンプルプロジェクト

## このリポジトリについて

Zenn記事検索MCPサーバーに対して、以下のAI Enablingを適用しています：

- **CLAUDE.md / .cursorrules / copilot-instructions.md**: AIツール用の指示
- **GitHub Actions統合**: PRレビュー、Issue自動実装

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

### CI統合を試す（フォーク）

このリポジトリをフォークして、Claude Code Actionsを体験できます：

```bash
# 1. このリポジトリをGitHubでフォーク

# 2. Claude Codeで以下を実行してGitHub Appをインストール
# （Claude Code CLIまたはClaude Desktopから）
/install-github-app

# 3. GitHubリポジトリのSettings → Secrets and variables → Actions から
# ANTHROPIC_API_KEY を追加（https://console.anthropic.com で取得）

# 4. フォークしたリポジトリでIssueを作成
# 本文に @claude を含めると、Claudeが自動で実装してPRを作成

# 5. PRを作成すると、Claudeが自動レビュー
```

**できること:**
- PRの自動レビュー
- Issueからの自動実装・PR作成（`@claude`メンション）
- コードに関する質問への回答

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
