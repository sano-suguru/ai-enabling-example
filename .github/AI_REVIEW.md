# AI自動レビュー・自動実装ガイド

このプロジェクトでは、GitHub ModelsベースのAI自動レビュー・自動実装システムを導入しています。

## システム概要

GitHub Modelsの無料枠を利用して、以下の機能を提供します：

- PRの自動コードレビュー
- Issueからの自動実装・PR作成

## セットアップ

### 1. リポジトリ権限の設定

Settings > Actions > General で以下を有効化：

- Read and write permissions
- Allow GitHub Actions to create and approve pull requests

### 2. 完了

ワークフローとスクリプトは既に配置されています。追加の設定は不要です。

## 使い方

### PRレビュー

PRを作成または更新すると、自動的にAIがコードレビューを実施してコメントを投稿します。

レビュー観点：
- コード品質（可読性、保守性）
- セキュリティ（脆弱性、入力検証）
- パフォーマンス
- ベストプラクティス

### Issue自動実装

Issueのコメントに `@ai-bot` とメンションすると、AIが自動で実装を行い、PRを作成します。

具体的な指示を書くことで、より正確な実装が得られます。

## 技術仕様

- AI基盤: GitHub Models (gpt-4o)
- API制限: 15req/min, 150req/day（無料枠）
- 認証: GITHUB_TOKEN（追加のAPIキー不要）

## カスタマイズ

AIモデルを変更する場合は、`.github/workflows/ai-review.yml` の `AI_MODEL` 環境変数を編集してください。

利用可能なモデル：
- gpt-4o
- deepseek-r1
- llama-3.3-70b-instruct

## 参考

- [GitHub Models](https://github.blog/ai-and-ml/llms/solving-the-inference-problem-for-open-source-ai-projects-with-github-models/)
- [GitHub Actions](https://docs.github.com/en/actions)
