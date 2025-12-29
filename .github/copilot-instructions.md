# Copilot Instructions

このリポジトリのツール横断の一次情報はルートの `AGENTS.md` に集約しています。
ただし、参照リンクの追従は環境や機能によって保証されないため、このファイルには Copilot が確実に読むべき最小限の重要事項だけを重複して記載します。

## 最重要

- 変更は TypeScript で行う（`tsconfig.json` は strict）
- JSDoc とコード内コメントは日本語
- 非同期処理は `async/await`（コールバックは避ける）
- 外部入力は Zod 等でバリデーション
- `console.log` ではなく `src/utils/logger.ts` を使う
- 後方互換/削除予定の残骸を残さない（使わないコード・設定は削除して参照も更新）
- コミットメッセージは日本語・絵文字なし（"機能追加: 〜" / "修正: 〜" / "ドキュメント: 〜"）

## 検証コマンド

コマンドの正は `package.json` の scripts と `.github/workflows/ci.yml` です。

- `npm run build`
- `npm test`
- `npm run lint`
