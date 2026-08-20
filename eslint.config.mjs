import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/**
 * Configuração plana do ESLint 10.
 *
 * `eslint-config-next` 16 exporta configs planas diretamente; o `FlatCompat` do eslintrc não é
 * mais necessário e quebra com esta combinação de versões.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      // Protótipo estático de referência na raiz — preservado, fora do lint do app.
      'script.js',
      '.chrome-logo-render/**',
      '.chrome-simple-render/**',
      '.qa-banner/**',
      '.qa-shots/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
];

export default config;
