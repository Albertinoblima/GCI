// gci-backend/src/services/metaSenderService.js
import axios from 'axios';
import municipioRepository from '../repositories/municipioRepository.js'; // Alterado para usar o repositório
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const META_API_VERSION = 'v19.0';

const metaSenderService = {
    async sendWhatsAppTextMessage(recipientPhoneNumber, messageText, municipioId) {
        // 1. Buscar credenciais da API para o município.
        const municipio = await municipioRepository.findById(municipioId);
        if (!municipio || !municipio.config_meta_api) {
            throw new AppError(`Configuração da API da Meta não encontrada para o município ID ${municipioId}`, 500);
        }

        const { whatsapp_phone_number_id, page_access_token } = municipio.config_meta_api;
        if (!whatsapp_phone_number_id || !page_access_token) {
            throw new AppError(`Credenciais do WhatsApp incompletas para o município ID ${municipioId}`, 500);
        }

        const apiUrl = `https://graph.facebook.com/${META_API_VERSION}/${whatsapp_phone_number_id}/messages`;
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipientPhoneNumber,
            type: 'text',
            text: { preview_url: true, body: messageText },
        };

        try {
            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${page_access_token}`,
                    'Content-Type': 'application/json',
                },
            });
            logger.info(`Mensagem enviada para ${recipientPhoneNumber}. Message ID: ${response.data.messages[0].id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || error.message;
            logger.error(`Falha ao enviar mensagem via Meta API para ${recipientPhoneNumber}.`, { error: errorMessage });
            throw new AppError(`Erro na API da Meta: ${errorMessage}`, 502);
        }
    },
};

export default metaSenderService;