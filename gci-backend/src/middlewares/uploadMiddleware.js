// gci-backend/src/middlewares/uploadMiddleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.js';

// Configuração de upload sem dependência de appConfig
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Tipo de arquivo não suportado.', 400), false);
    }
};

/**
 * Middleware Multer configurado para uploads.
 */
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

/**
 * Handler de erros específico para o Multer.
 */
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError(`Arquivo muito grande. O limite é de ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 400));
        }
        return next(new AppError(`Erro de upload: ${err.message}`, 400));
    }
    if (err) {
        return next(err);
    }
    next();
};