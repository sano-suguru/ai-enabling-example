# CLAUDE.md

Claude Code は `CLAUDE.md` をメモリ（指示）ファイルとして起動時に読み込みます（Claude Code settings の scopes を参照）。

このリポジトリでは、ツール横断で共有する一次情報をルートの `AGENTS.md` に集約しています。
Claude Code で作業する際も、原則として `AGENTS.md` の内容を優先してください。

## 最重要（このファイルにも重複して明記）

- 変更は TypeScript で行う（`tsconfig.json` は strict）
- JSDoc とコード内コメントは日本語で記述する
- 非同期処理は `async/await` を使う（コールバックは避ける）
- 外部入力は必ずバリデーション（Zod）
- `console.log` は使わず `src/utils/logger.ts` を使う
- 後方互換/削除予定の残骸を残さない（使わないコード・設定は削除して参照も更新）
- コミットメッセージは日本語・絵文字なし（例: "修正: 〜"）

## コマンド

コマンドの正は `package.json` の scripts と `.github/workflows/ci.yml` です。

```bash
npm run build
npm test
npm run lint
```

## 参照

詳細なプロジェクト情報・規約・構成は `AGENTS.md` を参照してください。
