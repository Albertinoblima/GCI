// gci-backend/src/config/appConfig.js

import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Obtenção do caminho da forma moderna (ES Modules) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
const envPath = path.resolve(__dirname, '..', '..', '.env');
dotenvConfig({ path: envPath });

// --- Validação das Variáveis de Ambiente ---
const requiredEnvVars = [
    'DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT',
    'JWT_SECRET', 'META_VERIFY_TOKEN', 'META_APP_SECRET', 'FRONTEND_URL'
];

if (process.env.NODE_ENV !== 'test') {
    for (const varName of requiredEnvVars) {
        if (!process.env[varName]) {
            console.error(`CRÍTICO: Variável de ambiente obrigatória "${varName}" não está definida.`);
            // Em um cenário real, é bom encerrar o processo se uma variável crítica faltar.
            // process.exit(1);
        }
    }
}

// --- Exportação das Configurações ---
export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = parseInt(process.env.PORT, 10) || 3001;
export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const db = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
};

export const jwt = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
};

export const meta = {
    webhookVerifyToken: process.env.META_VERIFY_TOKEN,
    appSecret: process.env.META_APP_SECRET,
    graphApiVersion: process.env.META_GRAPH_API_VERSION || 'v19.0',
};

export const upload = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxPayloadSize: '50mb'
};