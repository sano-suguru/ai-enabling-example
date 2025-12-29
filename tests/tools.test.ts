/**
 * MCPツールの基本的なテスト
 * Node.js組み込みのtest runnerを使用
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { listArticles } from '../build/tools/list-articles.js';
import { searchArticles } from '../build/tools/search-articles.js';
import { getArticle } from '../build/tools/get-article.js';

const MOCK_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Zenn Feed</title>
    <link>https://zenn.dev</link>
    <description>Mock feed</description>
    <item>
      <title>APIの基本</title>
      <link>https://zenn.dev/zenn/articles/api-basics</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <description>APIの説明</description>
    </item>
    <item>
      <title>Markdownの書き方</title>
      <link>https://zenn.dev/zenn/articles/markdown-howto</link>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
      <description>Markdownの説明</description>
    </item>
    <item>
      <title>テスト戦略</title>
      <link>https://zenn.dev/zenn/articles/test-strategy</link>
      <pubDate>Wed, 03 Jan 2024 00:00:00 GMT</pubDate>
      <description>テストの説明</description>
    </item>
    <item>
      <title>パフォーマンス改善</title>
      <link>https://zenn.dev/zenn/articles/performance</link>
      <pubDate>Thu, 04 Jan 2024 00:00:00 GMT</pubDate>
      <description>速度の説明</description>
    </item>
    <item>
      <title>型安全な実装</title>
      <link>https://zenn.dev/zenn/articles/type-safety</link>
      <pubDate>Fri, 05 Jan 2024 00:00:00 GMT</pubDate>
      <description>TypeScriptの説明</description>
    </item>
    <item>
      <title>リファクタリングのコツ</title>
      <link>https://zenn.dev/zenn/articles/refactoring</link>
      <pubDate>Sat, 06 Jan 2024 00:00:00 GMT</pubDate>
      <description>改善の説明</description>
    </item>
  </channel>
</rss>`;

const MOCK_ARTICLE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ZennのMarkdown記法一覧 | Zenn</title>
  </head>
  <body>
    <h1>Mock Article</h1>
    <p>content</p>
  </body>
</html>`;

let originalFetch: typeof fetch | undefined;

before(() => {
  originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (url.startsWith('https://zenn.dev/') && url.includes('/feed')) {
      return new Response(MOCK_RSS_XML, {
        status: 200,
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      });
    }

    if (url === 'https://zenn.dev/zenn/articles/markdown-guide') {
      return new Response(MOCK_ARTICLE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  }) as typeof fetch;
});

after(() => {
  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }
});

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
      assert.strictEqual(result.title, 'ZennのMarkdown記法一覧', 'タイトルが正しく抽出されること');
      assert.strictEqual(
        result.url,
        'https://zenn.dev/zenn/articles/markdown-guide',
        '正しいURLが返されること'
      );
    });
  });
});
