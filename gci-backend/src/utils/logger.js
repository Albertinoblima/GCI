// gci-backend/src/utils/logger.js
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { nodeEnv } from '../config/appConfig.js'; // Supondo que você exporte nodeEnv daqui

const { combine, timestamp, printf, colorize, align, json, splat } = winston.format;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');

fs.mkdirSync(LOGS_DIR, { recursive: true });

const logLevel = nodeEnv === 'production' ? 'info' : 'debug';

// Formato para o console: legível, colorido e com timestamp claro.
const consoleFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    splat(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message} ${info.metadata ? JSON.stringify(info.metadata) : ''}`)
);

// Formato para os arquivos: JSON estruturado.
const fileFormat = combine(
    timestamp(),
    splat(),
    json()
);

const transportsList = [
    new winston.transports.Console({
        level: logLevel,
        format: consoleFormat,
        handleExceptions: true,
        handleRejections: true,
    }),
];

if (nodeEnv !== 'test') {
    transportsList.push(
        new winston.transports.File({
            level: 'info',
            filename: path.join(LOGS_DIR, 'app-info.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    );
    transportsList.push(
        new winston.transports.File({
            level: 'error',
            filename: path.join(LOGS_DIR, 'app-error.log'),
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    );
}

const logger = winston.createLogger({
    level: logLevel,
    levels: winston.config.npm.levels,
    transports: transportsList,
    exitOnError: false,
});

export default logger;