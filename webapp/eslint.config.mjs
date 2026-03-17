import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import prettierPlugin from 'eslint-plugin-prettier'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'dist/**', 'next-env.d.ts']),
])

export default eslintConfig
