/**
 * RSS解析ユーティリティ
 * rss-parserライブラリを使用してZenn RSSフィードを解析
 */

import Parser from 'rss-parser';
import * as logger from './logger.js';

/**
 * Zenn記事の型定義
 */
export interface ZennArticle {
  /** 記事タイトル */
  title: string;
  /** 記事URL */
  url: string;
  /** 公開日時（ISO 8601形式） */
  publishedAt: string;
  /** 記事の概要・説明 */
  description?: string;
}

/**
 * RSS-Parserのカスタムフィールド型定義
 */
interface CustomFeed {
  // 現時点ではカスタムフィールドなし
}

interface CustomItem {
  // 現時点ではカスタムフィールドなし
}

// RSS Parserインスタンスの作成
const parser: Parser<CustomFeed, CustomItem> = new Parser();

/**
 * RSS XMLをパースしてZenn記事の配列に変換
 * @param rssXml - RSS feed XML文字列
 * @returns パースされたZenn記事の配列
 * @throws RSSのパースに失敗した場合にエラー
 */
export async function parseRssFeed(rssXml: string): Promise<ZennArticle[]> {
  try {
    logger.debug('RSSフィードをパース中');

    const feed = await parser.parseString(rssXml);

    if (!feed.items || feed.items.length === 0) {
      logger.warn('RSSフィードにアイテムが見つかりませんでした');
      return [];
    }

    const articles: ZennArticle[] = feed.items.map((item) => ({
      title: item.title || '無題',
      url: item.link || '',
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      description: item.contentSnippet || item.content || '',
    }));

    logger.debug('RSSフィードのパースに成功', { count: articles.length });

    return articles;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('RSSフィードのパースに失敗', error);
    throw new Error(`RSSフィードのパースに失敗: ${error.message}`);
  }
}

/**
 * 記事リストをキーワードでフィルタリング
 * @param articles - 記事の配列
 * @param query - 検索キーワード
 * @returns フィルタリングされた記事の配列
 */
export function filterArticles(articles: ZennArticle[], query: string): ZennArticle[] {
  if (!query || query.trim() === '') {
    return articles;
  }

  const lowerQuery = query.toLowerCase();

  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      (article.description && article.description.toLowerCase().includes(lowerQuery))
  );
}
