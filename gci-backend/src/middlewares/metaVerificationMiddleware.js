// gci-backend/src/middlewares/metaVerificationMiddleware.js
import crypto from 'crypto';
import logger from '../utils/logger.js';

// Usando 'export const' para consistência
export const verifyMetaSignature = (req, res, next) => {
    // É crucial usar o parser de texto puro ANTES deste middleware.
    // Isso deve ser feito na configuração do Express, especificamente para esta rota.
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        logger.warn('Requisição para webhook da Meta sem assinatura.');
        return res.status(400).send('Assinatura não encontrada.');
    }

    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
        logger.error('CRÍTICO: META_APP_SECRET não está configurado no .env.');
        return res.status(500).send('Erro de configuração do servidor.');
    }

    const elements = signature.split('=');
    const signatureHash = elements[1];

    const expectedHash = crypto
        .createHmac('sha256', appSecret)
        .update(req.rawBody) // req.rawBody é populado pelo bodyParser de texto
        .digest('hex');

    if (signatureHash !== expectedHash) {
        logger.error('Assinatura do webhook da Meta inválida.');
        return res.status(403).send('Assinatura inválida.');
    }

    next();
};