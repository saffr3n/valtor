import js from '@eslint/js';
import ts from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js, jsdoc },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  ts.configs.recommended,
  {
    files: ['**/*.{ts,mts,cts}'],
    ...jsdoc.configs['flat/recommended-typescript-error'],
  },
  {
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'jsdoc/no-undefined-types': 'error',
      'jsdoc/require-param': ['error', { ignoreWhenAllParamsMissing: true }],
      'jsdoc/require-returns': ['error', { publicOnly: true }],
      'jsdoc/tag-lines': [
        'error',
        'always',
        { applyToEndTag: false, startLines: 1 },
      ],
    },
  },
  prettier,
]);
