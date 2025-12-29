import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * ESLint v9（Flat Config）設定
 * TypeScript向けの最小構成（CIでの静的チェック用途）
 */
export default [
  {
    ignores: ['build/**', 'node_modules/**'],
  },
  ...tseslint.config({
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  }),
];
