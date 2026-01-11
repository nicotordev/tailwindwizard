import hono from '@hono/eslint-config'

export default [
  ...hono,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'n/no-process-exit': 'off',
      'import-x/order': 'off',
      'import-x/no-duplicates': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  {
    ignores: ['dist', 'node_modules', 'src/db/generated']
  }
]
