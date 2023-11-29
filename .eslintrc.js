module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    mocha: true,
    node: true
  },
  globals: {
    artifacts: false,
    assert: false,
    contract: false,
    web3: false
  },
  extends: ['standard-with-typescript'],
  // This is needed to add configuration to rules with type information
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json']
  },
  ignorePatterns: [
    '.eslintrc.js',
    '**/types/truffle-contracts',
    'coverage',
    'dist/'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-expressions': 'off',
    'quotes': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off'
  },
  overrides: [
    {
      files: ['**/test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-expressions': 'off'
      }
    },
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/prefer-ts-expect-error': 'off',
        '@typescript-eslint/restrict-template-expressions': [
          'error',
          {
            allowNumber: true,
            allowBoolean: true,
            allowNullish: true,
            allowNullable: true
          }
        ]
      }
    }
  ]
}
0x39765da500000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000002091f0
0x39765da5000000000000000000000000355a5967018ca610ba78f0028167711ee7a3d58a0000000000000000000000000000000000000000000000000000000006a11e3d0000000000000000000000000000000000000000000000000000000006a11e3d000000000000000000000000000000000000000000000000000000004190ab00
0x39765da5000000000000000000000000696ef1e656ee55cd8bba2a1b693a33a617c6c583000000000000000000000000000000000000000000000000000000006556ebc40000000000000000000000000000000000000000000000000000000065583d440000000000000000000000000000000000000000000000000de0b6b3a7640000
0x39765da5000000000000000000000000c1b04b6dc839c9c9e7f6118e8665b37cb3ee65c6000000000000000000000000000000000000000000000000000000006556fa450000000000000000000000000000000000000000000000000000000065584bc50000000000000000000000000000000000000000000000000de0b6b3a7640000
0x39765da500000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a67292ca600000000000000000000000000000000000000000000000000000000002091f0
0x663f3ad617193148711d28f5334ee4ed070166025fbfb9cf000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000003e8