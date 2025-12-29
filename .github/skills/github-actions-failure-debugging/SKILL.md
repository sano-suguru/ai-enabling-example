---
name: github-actions-failure-debugging
description: このリポジトリの GitHub Actions CI（.github/workflows/ci.yml）の失敗を切り分け、ローカル再現によって原因を最短で特定する手順を提供する。PR/push の CI run が失敗している、または Build/Test/Lint の失敗ログ解釈が必要な場合に有効。
---

## 前提（このリポジトリのCI構成）

- ワークフロー: `CI`（`.github/workflows/ci.yml`）
- ジョブ: `build-test-lint`
- 実行順: `.github/workflows/ci.yml` を参照（現状: `npm ci` → `npm run build` → `npm test` → `npm run lint`）
- Node.js: `.github/workflows/ci.yml`（`actions/setup-node` の `node-version`）と `package.json` の `engines.node` を参照

## 1) まず「どこで落ちているか」を特定する

1. GitHub Actions の該当 run を開き、失敗している **ステップ名**（Install / Build / Test / Lint）を特定する
2. 同じ run の中で **最初に失敗したステップ**を起点に読む（後続の失敗は派生の可能性がある）
3. 可能なら失敗ログから、以下のどれに分類できるかを判断する
   - **環境/依存関係**: `npm ci` で落ちる（lockfile、node/npm、権限、ネットワーク等）
   - **コンパイル**: `tsc`（`npm run build`）で落ちる
   - **テスト**: `node --test`（`npm test`）で落ちる
   - **Lint**: ESLint（`npm run lint`）で落ちる

## 2) ローカルで同じ条件に寄せて再現する

- Node.js のバージョンをCIに合わせる（.github/workflows/ci.yml の `actions/setup-node` の `node-version` を参照）
- 可能ならクリーンな状態で再現する（依存関係を入れ直す）

推奨コマンド（CIと同順）:

```bash
npm ci
npm run build
npm test
npm run lint
```

注意:
- `npm test` は内部で `npm run build` を実行するため、ローカルでは `npm test` だけでコンパイルエラーが分かることもある
- `npm run test:manual` は外部ネットワークに依存する想定のため、CI失敗の切り分けでは原則使わない

## 3) 失敗タイプ別の最短ルート

### A. Install（`npm ci`）で失敗

- エラー文言をそのまま起点にする（例: `ERESOLVE`, `integrity`, `lockfile`, `node-gyp` など）
- `package-lock.json` の差分があるか確認する
- Node.jsバージョン差（ローカルが20未満等）がないか確認する

### B. Build（`npm run build` / `tsc`）で失敗

- TypeScript の診断（ファイルパスと行）を起点に修正する
- 影響範囲が大きい場合は、まず型エラーを0に戻す（型修正→リファクタは分ける）

### C. Test（`npm test`）で失敗

- 失敗したテスト名（Node test runner の出力）とスタックトレースから、該当テストを特定する
- テストは `tests/**/*.test.ts` を対象にしているため、まず `tests/` 配下の変更と依存先を確認する
- 外部I/O（ネットワーク等）が原因になりやすいので、テストがモック前提ならモックが効いているか（`fetch` など）を確認する

### D. Lint（`npm run lint`）で失敗

- ESLint のルール名と該当箇所（ファイル/行）を起点に直す
- 自動修正が有効なルールでも、まずは最小差分で直し、意図しない整形/変更を避ける

## 4) 修正の検証と「CIで落ちない」ことの確認

- ローカルで以下が通ることを確認する
  - `npm run build`
  - `npm test`
  - `npm run lint`
- 変更がCIに影響する場合（例: scripts、ワークフロー、テスト対象パス）、意図通りかを再確認する

## 5) レポート（PR/コメントに残すべき最小情報）

- 失敗した run（リンク）と、失敗したステップ名（Build/Test/Lintなど）
- ローカル再現手順（実行コマンドと再現有無）
- 原因（根本原因）と修正内容（要約）
- 追加した/変更した検証（build/test/lint の結果）
