// gci-backend/src/services/metaService.js
import axios from 'axios';
import logger from '../utils/logger.js';

// Importando os serviços da maneira correta (como default)
import atendimentoService from './atendimentoService.js';
import mensagemService from './mensagemService.js';
import cidadaoService from './cidadaoService.js';
import municipioService from './municipioService.js';
import chatbotService from './chatbotService.js'; // Assumindo que o chatbotService existe

/**
 * Lida com as atualizações de status de mensagens enviadas (sent, delivered, read).
 * @param {string} wam_id - O WhatsApp Message ID da mensagem que você enviou.
 * @param {string} status - O novo status ('sent', 'delivered', 'read', 'failed').
 */
async function atualizarStatusEnvioMeta(wam_id, status) {
    try {
        // Esta é uma função que precisaria ser implementada no mensagemRepository/Service
        // Por agora, vamos apenas logar a informação.
        logger.info(`Status da mensagem ${wam_id} atualizado para: ${status}`);
        // Exemplo de como seria a chamada real:
        // await mensagemService.updateStatusPorWamId(wam_id, status);
    } catch (error) {
        logger.error(`Falha ao atualizar status para a mensagem WAM ID ${wam_id}`, { error: error.message });
    }
}


/**
 * Manipula uma nova mensagem recebida de qualquer plataforma Meta.
 */
async function handleNovaMensagemRecebida(metaMessageObject, idCanalCidadao, idNossaPaginaOuNumero, canalComunicacao, nomePerfilCidadao) {
    logger.info(`Recebida nova mensagem de ${idCanalCidadao} no canal ${canalComunicacao}`);
    let conteudoTexto = null;
    let tipoMidia = 'texto';

    // Extrai o conteúdo da mensagem (lógica simplificada)
    if (metaMessageObject.type === 'text') {
        conteudoTexto = metaMessageObject.text.body;
    } else {
        conteudoTexto = `[Mídia do tipo: ${metaMessageObject.type}]`;
        tipoMidia = metaMessageObject.type;
    }

    if (!conteudoTexto) {
        logger.warn(`Mensagem ignorada por falta de conteúdo principal. ID Meta: ${metaMessageObject.id}`);
        return;
    }

    try {
        // 1. Encontrar Município pela configuração da Meta
        const municipio = await municipioService.findByMetaIdentifier(idNossaPaginaOuNumero, canalComunicacao);
        if (!municipio || !municipio.ativo) {
            logger.error(`Município não encontrado ou inativo para o identificador Meta: ${idNossaPaginaOuNumero}`);
            return;
        }

        // 2. Encontrar/Criar Cidadão
        const cidadao = await cidadaoService.findOrCreate({
            canal_comunicacao: canalComunicacao,
            id_canal_origem: idCanalCidadao,
            nome_perfil_canal: nomePerfilCidadao,
            telefone_principal: canalComunicacao === 'whatsapp' ? idCanalCidadao : null
        });

        // 3. Encontrar/Criar Atendimento
        const atendimento = await atendimentoService.findOrCreateAtivoPorCidadao({
            cidadao_id: cidadao.id,
            municipio_id: municipio.id,
            canal_origem: canalComunicacao,
            assunto_breve: conteudoTexto.substring(0, 100),
        });

        // 4. Salvar a Mensagem do Cidadão no DB
        const mensagemCidadao = await mensagemService.create({
            atendimento_id: atendimento.id,
            remetente_tipo: 'cidadao',
            cidadao_id: cidadao.id,
            conteudo_texto: conteudoTexto,
            id_mensagem_canal_origem: metaMessageObject.id,
            timestamp_mensagem: new Date(parseInt(metaMessageObject.timestamp, 10) * 1000),
        });

        // 5. Acionar o Chatbot para processar a mensagem
        await chatbotService.processarMensagemCidadao(atendimento, mensagemCidadao, municipio, cidadao);

    } catch (error) {
        logger.error(`Erro crítico em handleNovaMensagemRecebida para ${idCanalCidadao}`, { stack: error.stack });
    }
}

/**
 * Processa o payload do webhook recebido da Meta.
 */
async function processarEventoMeta(payload) {
    if (payload.object !== 'whatsapp_business_account') {
        logger.warn(`Webhook recebido com objeto não suportado: ${payload.object}`);
        return;
    }

    for (const entry of payload.entry) {
        for (const change of entry.changes) {
            if (change.field !== 'messages') continue;

            const value = change.value;

            // Processa novas mensagens recebidas
            if (value.messages) {
                for (const message of value.messages) {
                    const from = message.from;
                    const businessPhoneId = value.metadata.phone_number_id;
                    const profileName = value.contacts?.[0]?.profile?.name;
                    await handleNovaMensagemRecebida(message, from, businessPhoneId, 'whatsapp', profileName);
                }
            }

            // Processa atualizações de status de mensagens enviadas
            if (value.statuses) {
                for (const status of value.statuses) {
                    await atualizarStatusEnvioMeta(status.id, status.status);
                }
            }
        }
    }
}

export default {
    processarEventoMeta
};