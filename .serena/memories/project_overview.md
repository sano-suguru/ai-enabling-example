# プロジェクト概要

## 目的
Zenn記事検索MCPサーバー - AI Enabling実践のサンプルプロジェクト

## 技術スタック
- **言語**: TypeScript (strict mode)
- **ランタイム**: Node.js 20.x (LTS)
- **フレームワーク**: MCP SDK (`@modelcontextprotocol/sdk`)
- **スキーマ検証**: Zod
- **RSS解析**: rss-parser
- **データソース**: Zenn RSS feeds（APIキー不要）

## MCPツール
1. `list_articles` - Zennユーザーの記事一覧取得
2. `search_articles` - キーワードで記事検索
3. `get_article` - 記事本文取得

## ディレクトリ構造
```
src/
  index.ts              # エントリーポイント
  server.ts             # MCPサーバー実装
  tools/
    list-articles.ts    # list_articlesツール
    search-articles.ts  # search_articlesツール
    get-article.ts      # get_articleツール
  utils/
    rss-parser.ts       # RSS解析ユーティリティ
    fetcher.ts          # HTTP fetchユーティリティ
    logger.ts           # ログユーティリティ
tests/
  tools.test.ts         # ツールテスト
```

## AI Enabling成果物
- CLAUDE.md - Claude Code用指示
- .cursorrules - Cursor用指示
- .github/copilot-instructions.md - GitHub Copilot用指示
- .github/workflows/ai-review.yml - AI自動レビュー・自動実装
