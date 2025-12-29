# 開発コマンド

## 基本コマンド
```bash
npm install              # 依存関係インストール
npm run build           # TypeScriptビルド
npm run dev             # 開発サーバー（watch mode）
npm test                # テスト実行
npm run lint            # ESLint実行
```

## テスト
```bash
npm test                # 全テスト実行
npm test -- --watch     # watchモード
```

## MCP Inspector（デバッグ）
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## Git操作
```bash
git status              # 状態確認
git diff                # 変更確認
git add .               # ステージング
git commit -m "メッセージ"  # コミット（日本語）
git push origin main    # プッシュ
```

## システムコマンド（Darwin/macOS）
```bash
ls -la                  # ファイル一覧
find . -name "*.ts"     # ファイル検索
grep -r "pattern" src/  # パターン検索
```
