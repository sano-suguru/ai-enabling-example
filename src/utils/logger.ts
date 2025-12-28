/**
 * MCPサーバー用のシンプルなロガーユーティリティ
 * stdout上のMCPプロトコルと干渉しないようにstderrに出力
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * デバッグメッセージをログ出力
 * @param message - ログメッセージ
 * @param meta - オプションのメタデータオブジェクト
 */
export function debug(message: string, meta?: Record<string, unknown>): void {
  log(LogLevel.DEBUG, message, meta);
}

/**
 * 情報メッセージをログ出力
 * @param message - ログメッセージ
 * @param meta - オプションのメタデータオブジェクト
 */
export function info(message: string, meta?: Record<string, unknown>): void {
  log(LogLevel.INFO, message, meta);
}

/**
 * 警告メッセージをログ出力
 * @param message - ログメッセージ
 * @param meta - オプションのメタデータオブジェクト
 */
export function warn(message: string, meta?: Record<string, unknown>): void {
  log(LogLevel.WARN, message, meta);
}

/**
 * エラーメッセージをログ出力
 * @param message - ログメッセージ
 * @param meta - オプションのメタデータオブジェクトまたはErrorオブジェクト
 */
export function error(message: string, meta?: Record<string, unknown> | Error): void {
  const metadata = meta instanceof Error ? { error: meta.message, stack: meta.stack } : meta;
  log(LogLevel.ERROR, message, metadata);
}

/**
 * 内部ログ出力関数
 * @param level - ログレベル
 * @param message - ログメッセージ
 * @param meta - オプションのメタデータ
 */
function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const logMessage = meta
    ? `[${timestamp}] ${level}: ${message} ${JSON.stringify(meta)}`
    : `[${timestamp}] ${level}: ${message}`;

  // MCPプロトコルと干渉しないようstderrに出力
  console.error(logMessage);
}
