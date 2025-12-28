/**
 * get_article MCPツール実装
 * 指定されたURL/slugの記事本文を取得
 */

import { fetchUrl } from '../utils/fetcher.js';
import * as logger from '../utils/logger.js';

/**
 * get_articleツールの入力パラメータ
 */
export interface GetArticleInput {
  /** 記事のURL */
  url: string;
}

/**
 * get_articleツールの出力
 */
export interface GetArticleOutput {
  /** 記事タイトル */
  title: string;
  /** 記事の内容（HTMLテキスト） */
  content: string;
  /** 取得したURL */
  url: string;
  [key: string]: unknown;
}

/**
 * 指定されたURLの記事本文を取得
 * 注: 簡易実装のため、HTMLをそのまま返す
 *
 * @param input - ツール入力パラメータ
 * @returns 記事の内容
 * @throws 記事の取得に失敗した場合にエラー
 */
export async function getArticle(input: GetArticleInput): Promise<GetArticleOutput> {
  const { url } = input;

  try {
    logger.info('記事を取得中', { url });

    // URLのバリデーション
    if (!url.startsWith('https://zenn.dev/')) {
      throw new Error('有効なZenn記事のURLを指定してください');
    }

    // 記事HTMLを取得
    const html = await fetchUrl(url);

    // タイトルを抽出（簡易実装：<title>タグから）
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(' | Zenn', '').trim() : 'タイトル不明';

    logger.info('記事の取得に成功', { url, title });

    return {
      title,
      content: html,
      url,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('記事の取得に失敗', error);
    throw new Error(`記事の取得に失敗: ${error.message}`);
  }
}
