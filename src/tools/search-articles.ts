/**
 * search_articles MCPツール実装
 * Zenn記事をキーワードで検索
 */

import { fetchZennFeed } from '../utils/fetcher.js';
import { parseRssFeed, filterArticles, ZennArticle } from '../utils/rss-parser.js';
import * as logger from '../utils/logger.js';

/**
 * search_articlesツールの入力パラメータ
 */
export interface SearchArticlesInput {
  /** Zennユーザー名 */
  username: string;
  /** 検索キーワード */
  query: string;
}

/**
 * search_articlesツールの出力
 */
export interface SearchArticlesOutput {
  /** 検索にマッチした記事の配列 */
  articles: ZennArticle[];
  [key: string]: unknown;
}

/**
 * Zenn記事をキーワードで検索
 * @param input - ツール入力パラメータ
 * @returns 検索にマッチした記事一覧
 * @throws 検索に失敗した場合にエラー
 */
export async function searchArticles(input: SearchArticlesInput): Promise<SearchArticlesOutput> {
  const { username, query } = input;

  try {
    logger.info('記事を検索中', { username, query });

    // Zenn RSSフィードを取得（すべての記事を取得）
    const rssXml = await fetchZennFeed(username, true);

    // RSSをパース
    const articles = await parseRssFeed(rssXml);

    // キーワードでフィルタリング
    const filteredArticles = filterArticles(articles, query);

    logger.info('記事検索に成功', { query, count: filteredArticles.length });

    return { articles: filteredArticles };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('記事検索に失敗', error);
    throw new Error(`記事検索に失敗: ${error.message}`);
  }
}
