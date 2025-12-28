/**
 * Zenn記事検索用のMCPサーバー実装
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { listArticles } from './tools/list-articles.js';
import { searchArticles } from './tools/search-articles.js';
import { getArticle } from './tools/get-article.js';

/**
 * MCPサーバーインスタンスの作成と設定
 */
export const server = new McpServer({
  name: 'zenn-search',
  version: '1.0.0',
});

/**
 * list_articles ツールの登録
 * 指定されたZennユーザーの記事一覧を取得
 */
server.registerTool(
  'list_articles',
  {
    title: 'Zenn記事一覧取得',
    description: '指定されたZennユーザーの記事一覧を取得します',
    inputSchema: {
      username: z.string().describe('Zennユーザー名'),
      limit: z.number().optional().describe('取得する記事の最大数（デフォルト: 20）'),
    },
    outputSchema: {
      articles: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          publishedAt: z.string(),
          description: z.string().optional(),
        })
      ),
    },
  },
  async ({ username, limit }) => {
    const output = await listArticles({ username, limit });
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
);

/**
 * search_articles ツールの登録
 * Zenn記事をキーワードで検索
 */
server.registerTool(
  'search_articles',
  {
    title: 'Zenn記事検索',
    description: '指定されたZennユーザーの記事をキーワードで検索します',
    inputSchema: {
      username: z.string().describe('Zennユーザー名'),
      query: z.string().describe('検索キーワード'),
    },
    outputSchema: {
      articles: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
          publishedAt: z.string(),
          description: z.string().optional(),
        })
      ),
    },
  },
  async ({ username, query }) => {
    const output = await searchArticles({ username, query });
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
);

/**
 * get_article ツールの登録
 * 指定されたURLの記事本文を取得
 */
server.registerTool(
  'get_article',
  {
    title: 'Zenn記事本文取得',
    description: '指定されたURLのZenn記事本文を取得します',
    inputSchema: {
      url: z.string().url().describe('Zenn記事のURL'),
    },
    outputSchema: {
      title: z.string(),
      content: z.string(),
      url: z.string(),
    },
  },
  async ({ url }) => {
    const output = await getArticle({ url });
    return {
      content: [{ type: 'text', text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }
);
