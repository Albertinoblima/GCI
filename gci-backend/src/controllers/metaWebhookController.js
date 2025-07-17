// gci-backend/src/controllers/metaWebhookController.js
import metaService from '../services/metaService.js'; // 1. Importar como default
import logger from '../utils/logger.js';

export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const MEU_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN; // Nome corrigido da variável de ambiente

    if (!MEU_VERIFY_TOKEN) {
        logger.error("CRÍTICO: META_VERIFY_TOKEN não está configurado no .env.");
        return res.status(500).send("Erro de configuração do servidor.");
    }
    if (mode === 'subscribe' && token === MEU_VERIFY_TOKEN) {
        logger.info('WEBHOOK_VERIFIED com sucesso!');
        res.status(200).send(challenge);
    } else {
        logger.warn('Falha na verificação do Webhook. Token inválido.');
        res.sendStatus(403);
    }
};

export const handleWebhookEvent = async (req, res, next) => {
    try {
        // 2. Chamar a função como uma propriedade do objeto importado
        await metaService.processarEventoMeta(req.body);
        // Responde imediatamente com 200 OK para a Meta não reenviar o evento.
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        // Mesmo em caso de erro, respondemos 200 para a Meta.
        // O erro já foi logado pelo serviço.
        logger.error("Erro não capturado no nível do controller do webhook:", error);
        res.status(200).send('EVENT_RECEIVED_WITH_ERROR');
    }
};