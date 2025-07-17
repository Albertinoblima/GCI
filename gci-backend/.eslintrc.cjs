module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        // Garante que arquivos com export default sejam importados sem chaves
        'import/no-named-default': 'error',
        // Sugere preferir export default para classes principais
        'import/prefer-default-export': 'warn',
    },
    plugins: ['import'],
};
