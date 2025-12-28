# CI統合テスト

このファイルはClaude Code ActionsのCI統合をテストするために作成されました。

## 確認事項

- [x] ワークフローファイル (`.github/workflows/claude.yml`) が作成されている
- [x] `ANTHROPIC_API_KEY` を使用するように修正されている
- [ ] GitHubシークレットに `ANTHROPIC_API_KEY` が設定されている
- [ ] PRの自動レビューが動作する
- [ ] Issueの自動実装が動作する

## 次のステップ

1. https://console.anthropic.com でAPIキーを取得
2. GitHubリポジトリの Settings → Secrets and variables → Actions で `ANTHROPIC_API_KEY` を設定
3. このPRでClaudeの自動レビューが動作することを確認
4. Issueで `@claude` メンションして自動実装を確認
