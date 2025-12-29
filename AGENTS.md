# AGENTS.md

このファイルは、このリポジトリで作業するAIコーディングエージェント向けのプロジェクト指示です。

- Cursor は `AGENTS.md`（ルートおよびサブディレクトリ）をサポートします。詳細は Cursor Docs の「ルール → AGENTS.md」を参照してください。
- GitHub Copilot は agent instructions として `AGENTS.md` をサポートし、作業対象ファイルからディレクトリツリー上で最も近い `AGENTS.md` が優先されます（GitHub Docs）。
- Claude Code は `CLAUDE.md` を起動時に読み込みます（Claude Code settings の scopes 参照）。本リポジトリでは `CLAUDE.md` から本ファイルを参照する運用にします。

## プロジェクト概要

Zenn記事検索MCPサーバーです。Zennの公開RSSフィードから記事一覧・検索・本文取得を行うMCPツールを提供します。

## 技術スタック

- TypeScript（`tsconfig.json` は strict）
- Node.js（CI設定に従う）
- MCP SDK: `@modelcontextprotocol/sdk`
- スキーマ検証: Zod

## リポジトリ構成

- `src/` : 実装
  - `src/index.ts` : エントリポイント
  - `src/server.ts` : MCPサーバー
  - `src/tools/` : MCPツール
  - `src/utils/` : ユーティリティ（fetch/logger/rss等）
- `tests/` : テスト
- `.github/workflows/ci.yml` : CI

## 実行コマンド（ローカル/CI共通）

コマンドの正は `package.json` の scripts と `.github/workflows/ci.yml` です。

- 依存関係: `npm install`（CIは `npm ci`）
- ビルド: `npm run build`
- テスト: `npm test`
- Lint: `npm run lint`

## コーディング規約（重要）

- 言語: 変更は TypeScript で行う
- 非同期処理: `async/await` を使用（コールバック/Promiseチェーンは避ける）
- 入力検証: 外部入力は Zod 等で必ず検証する
- エラーハンドリング: `try/catch` で意味のあるメッセージにする
- ロギング: `console.log` ではなく `src/utils/logger.ts` を使う
- 後方互換/削除予定の残骸を残さない: 使わなくなったコードや設定は放置せず削除し、参照箇所も合わせて更新する

## コメント/ドキュメント

- JSDoc とコード内コメントは日本語で記述する

## Git運用

- コミットメッセージは日本語
- 絵文字は使用しない
- 形式: "機能追加: 〜", "修正: 〜", "ドキュメント: 〜"

## MCPツール実装ルール

- `McpServer` でツール登録する
- Zodで入力/出力スキーマを定義する
- ハンドラは `content` と `structuredContent` の両方を返す

## テスト方針

- 新規関数には単体テストを追加する
- `tests/` 配下に `*.test.ts` として追加する
- テスト名は動作が分かる日本語にする（AAAパターン推奨）
