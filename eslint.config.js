import js from '@eslint/js';
import ts, { config } from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import prettier from 'eslint-config-prettier/flat';

export default config(
  {
    files: ['**/*.{js,ts}'],
    extends: [js.configs.recommended, ts.configs.recommended],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    extends: [jsdoc.configs['flat/recommended-typescript-error']],
    rules: {
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
);
