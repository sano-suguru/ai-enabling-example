/**
 * list_articles MCPツール実装
 * 指定されたZennユーザーの記事一覧を取得
 */

import { fetchZennFeed } from '../utils/fetcher.js';
import { parseRssFeed, ZennArticle } from '../utils/rss-parser.js';
import * as logger from '../utils/logger.js';

/**
 * list_articlesツールの入力パラメータ
 */
export interface ListArticlesInput {
  /** Zennユーザー名 */
  username: string;
  /** 取得する記事の最大数（デフォルト: 20） */
  limit?: number;
}

/**
 * list_articlesツールの出力
 */
export interface ListArticlesOutput {
  /** 記事の配列 */
  articles: ZennArticle[];
  [key: string]: unknown;
}

/**
 * 指定されたZennユーザーの記事一覧を取得
 * @param input - ツール入力パラメータ
 * @returns 記事一覧
 * @throws 記事の取得に失敗した場合にエラー
 */
export async function listArticles(input: ListArticlesInput): Promise<ListArticlesOutput> {
  const { username, limit = 20 } = input;

  try {
    logger.info('記事一覧を取得中', { username, limit });

    // Zenn RSSフィードを取得
    const rssXml = await fetchZennFeed(username, false);

    // RSSをパース
    const articles = await parseRssFeed(rssXml);

    // limit数まで記事を切り詰め
    const limitedArticles = articles.slice(0, limit);

    logger.info('記事一覧の取得に成功', { count: limitedArticles.length });

    return { articles: limitedArticles };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('記事一覧の取得に失敗', error);
    throw new Error(`記事一覧の取得に失敗: ${error.message}`);
  }
}
