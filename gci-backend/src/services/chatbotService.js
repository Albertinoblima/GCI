// gci-backend/src/services/chatbotService.js
import metaSenderService from './metaSenderService.js';
import atendimentoService from './atendimentoService.js';
import logger from '../utils/logger.js';
import chatbotRouterService from './chatbotRouterService.js';

/**
 * Processa a mensagem do cidadão, roteando conforme o estado do atendimento.
 */
async function processarMensagemCidadao(atendimento, mensagemCidadao, municipio, cidadao) {
    logger.info(`Chatbot processando mensagem para atendimento ID: ${atendimento.id}`);
    try {
        // Chama o roteador para decidir a resposta e próxima etapa
        const resultado = await chatbotRouterService.proximoPasso(atendimento, mensagemCidadao);

        // Envia a resposta ao cidadão
        await metaSenderService.sendWhatsAppTextMessage(
            cidadao.id_canal_origem,
            resultado.resposta,
            municipio.id
        );

        // Atualiza o estado do atendimento
        await atendimentoService.update(atendimento.id, {
            chatbot_state: resultado.proximoEstado
        }, { id: null, role: 'bot' });

        logger.info(`Chatbot respondeu e atualizou o estado do atendimento ${atendimento.id} para ${resultado.proximoEstado}`);
    } catch (error) {
        logger.error(`Erro no chatbot ao processar atendimento ${atendimento.id}`, { error: error.message });
    }
}

const chatbotService = {
    processarMensagemCidadao
};

export default chatbotService;