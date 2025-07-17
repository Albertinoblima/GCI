// gci-backend/src/services/chatbotService.js
import metaSenderService from './metaSenderService.js';
import atendimentoService from './atendimentoService.js';
import logger from '../utils/logger.js';
// Supondo que você terá serviços para buscar secretarias e serviços
// import secretariaService from './secretariaService.js';
// import servicoService from './servicoService.js';

const ESTADOS = {
    INICIAL: 'BOT_INICIAL',
    // Adicione outros estados conforme necessário
};

async function processarMensagemCidadao(atendimento, mensagemCidadao, municipio, cidadao) {
    logger.info(`Chatbot processando mensagem para atendimento ID: ${atendimento.id}`);

    // Lógica principal do chatbot vai aqui.
    // Por enquanto, vamos implementar uma resposta simples e encaminhar para um humano.
    try {
        const mensagemResposta = `Olá, ${cidadao.nome_perfil_canal}. Recebemos sua mensagem. Em breve um de nossos atendentes irá verificar sua solicitação. Seu protocolo é: ${atendimento.protocolo_str}`;

        await metaSenderService.sendWhatsAppTextMessage(
            cidadao.id_canal_origem,
            mensagemResposta,
            municipio.id
        );

        // Atualiza o status do atendimento para aguardar um agente humano
        await atendimentoService.update(atendimento.id, {
            status: 'aguardando_atendente'
        }, { id: null, role: 'bot' }); // Passa um "usuário" simbólico para o bot

        logger.info(`Chatbot respondeu e encaminhou o atendimento ${atendimento.id} para um atendente.`);

    } catch (error) {
        logger.error(`Erro no chatbot ao processar atendimento ${atendimento.id}`, { error: error.message });
    }
}

// Exportando como um objeto default para ser consistente com os outros serviços
const chatbotService = {
    processarMensagemCidadao,
    ESTADOS,
};

export default chatbotService;