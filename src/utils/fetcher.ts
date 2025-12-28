/**
 * RSSフィードとWebコンテンツを取得するHTTP fetcherユーティリティ
 * Node.js組み込みのfetch API（Node.js 18+で利用可能）を使用
 */

import * as logger from './logger.js';

/**
 * エラーハンドリング付きでURLからコンテンツを取得
 * @param url - 取得するURL
 * @param options - オプションのfetchオプション
 * @returns レスポンステキスト
 * @throws fetchが失敗するか、非OKステータスを返した場合にエラー
 */
export async function fetchUrl(url: string, options?: RequestInit): Promise<string> {
  try {
    logger.debug('URLを取得中', { url });

    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'Zenn-Article-Search-MCP/1.0',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTPエラー ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    logger.debug('URLの取得に成功', { url, length: text.length });

    return text;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('URLの取得に失敗', error);
    throw new Error(`${url}の取得に失敗: ${error.message}`);
  }
}

/**
 * 特定のユーザーのZenn RSSフィードを取得
 * @param username - Zennユーザー名
 * @param includeAll - すべての記事を含めるか（デフォルト: false、約20件を返す）
 * @returns RSS feed XMLを文字列として返す
 */
export async function fetchZennFeed(username: string, includeAll = false): Promise<string> {
  // ユーザー名のバリデーション
  if (!username || typeof username !== 'string') {
    throw new Error('無効なユーザー名が指定されました');
  }

  const baseUrl = `https://zenn.dev/${username}/feed`;
  const url = includeAll ? `${baseUrl}?all=1` : baseUrl;

  logger.info('Zennフィードを取得中', { username, includeAll });

  return fetchUrl(url);
}
