/**
 * MCPツールの基本的なテスト
 * Node.js組み込みのtest runnerを使用
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { listArticles } from '../build/tools/list-articles.js';
import { searchArticles } from '../build/tools/search-articles.js';
import { getArticle } from '../build/tools/get-article.js';

describe('MCP Tools', () => {
  describe('listArticles', () => {
    it('should return articles for a valid username', async () => {
      // テスト用に実際のZennユーザー名を使用
      const result = await listArticles({ username: 'zenn', limit: 5 });

      assert.ok(result.articles, 'articles配列が存在すること');
      assert.ok(Array.isArray(result.articles), 'articlesが配列であること');
      assert.ok(result.articles.length <= 5, 'limitが適用されていること');

      if (result.articles.length > 0) {
        const article = result.articles[0];
        assert.ok(article.title, '記事にtitleがあること');
        assert.ok(article.url, '記事にurlがあること');
        assert.ok(article.publishedAt, '記事にpublishedAtがあること');
      }
    });

    it('should throw error for invalid username', async () => {
      await assert.rejects(
        async () => {
          await listArticles({ username: '', limit: 5 });
        },
        Error,
        '空のユーザー名でエラーになること'
      );
    });
  });

  describe('searchArticles', () => {
    it('should filter articles by query', async () => {
      const result = await searchArticles({
        username: 'zenn',
        query: 'API'
      });

      assert.ok(result.articles, 'articles配列が存在すること');
      assert.ok(Array.isArray(result.articles), 'articlesが配列であること');

      // 検索結果が含まれる場合、キーワードが含まれているか確認
      if (result.articles.length > 0) {
        const article = result.articles[0];
        const hasKeyword =
          article.title.toLowerCase().includes('api') ||
          (article.description && article.description.toLowerCase().includes('api'));

        assert.ok(hasKeyword, '検索キーワードが記事に含まれていること');
      }
    });
  });

  describe('getArticle', () => {
    it('should throw error for invalid URL', async () => {
      await assert.rejects(
        async () => {
          await getArticle({ url: 'https://example.com/article' });
        },
        Error,
        'Zenn以外のURLでエラーになること'
      );
    });

    it('should fetch article content for valid URL', async () => {
      // 実際のZenn記事URLを使用（Zennの公式記事）
      const result = await getArticle({
        url: 'https://zenn.dev/zenn/articles/markdown-guide'
      });

      assert.ok(result.title, 'タイトルが取得されること');
      assert.ok(result.content, 'コンテンツが取得されること');
      assert.ok(result.url, 'URLが含まれること');
      assert.strictEqual(
        result.url,
        'https://zenn.dev/zenn/articles/markdown-guide',
        '正しいURLが返されること'
      );
    });
  });
});
