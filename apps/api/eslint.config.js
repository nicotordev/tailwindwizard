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
  },
  {
    ignores: ['dist', 'node_modules', 'src/db/generated']
  }
]
