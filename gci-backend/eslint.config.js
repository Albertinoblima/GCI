import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: { NodeJS: true },
        },
        plugins: {
            import: importPlugin,
        },
        rules: {
            ...js.configs.recommended.rules,
            'import/no-named-default': 'error',
            'import/prefer-default-export': 'warn',
        },
    },
];
