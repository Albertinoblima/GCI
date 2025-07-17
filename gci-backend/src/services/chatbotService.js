// gci-backend/src/services/chatbotService.js

import chatbotRouterService from './chatbotRouterService.js';
import atendimentoService from './atendimentoService.js';
import mensagemService from './mensagemService.js';
import logger from '../utils/logger.js';

/**
 * Processa a mensagem do cidadão, atualiza o estado do atendimento e retorna a próxima resposta do chatbot.
 * @param {object} atendimento - O atendimento atual.
 * @param {object} mensagemCidadao - A mensagem recebida do cidadão.
 * @param {object} municipio - Dados do município (opcional, para contexto).
 * @param {object} cidadao - Dados do cidadão (opcional, para contexto).
 * @returns {Promise<object>} Objeto com resposta, opções e novo estado.
 */
async function processarMensagemCidadao(atendimento, mensagemCidadao, municipio = null, cidadao = null) {
    try {
        // 1. Roteia para o próximo passo do fluxo, passando contexto completo
        const resultado = await chatbotRouterService.proximoPasso(atendimento, mensagemCidadao, municipio, cidadao);

        // 2. Atualiza o estado do atendimento apenas se mudou
        let novoEstado = resultado.proximoEstado || atendimento.chatbot_state;
        if (novoEstado !== atendimento.chatbot_state) {
            await atendimentoService.atualizarEstadoChatbot(atendimento.id, novoEstado);
        }

        // 3. Registra a resposta do bot no histórico, incluindo contexto relevante
        if (resultado.resposta && resultado.resposta.trim()) {
            await mensagemService.create({
                atendimento_id: atendimento.id,
                remetente_tipo: 'bot',
                conteudo_texto: resultado.resposta,
                contexto: {
                    municipio_id: municipio?.id || atendimento.municipio_id,
                    cidadao_id: cidadao?.id || atendimento.cidadao_id,
                    estado_chatbot: novoEstado
                }
            });
        }

        // 4. Retorna resposta, opções e estado atualizado
        return {
            ...resultado,
            proximoEstado: novoEstado,
            contexto: {
                municipio_id: municipio?.id || atendimento.municipio_id,
                cidadao_id: cidadao?.id || atendimento.cidadao_id,
                estado_chatbot: novoEstado
            }
        };
    } catch (error) {
        logger.error('Erro ao processar mensagem do cidadão no chatbotService', { error: error.message, stack: error.stack });
        throw error;
    }
}

export default {
    processarMensagemCidadao
};
