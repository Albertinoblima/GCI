// Funções auxiliares para identificar secretarias específicas
function isSaude(secretaria) {
    if (!secretaria) return false;
    // Pode ser por nome, tipo ou id (ajuste conforme sua base)
    return (secretaria.nome && secretaria.nome.toLowerCase().includes('saúde')) || (secretaria.tipo === 'saude');
}

function isEducacao(secretaria) {
    if (!secretaria) return false;
    return (secretaria.nome && secretaria.nome.toLowerCase().includes('educação')) || (secretaria.tipo === 'educacao');
}

// Fluxo detalhado para Saúde (exemplo inicial)
async function fluxoSaude(atendimento, mensagemCidadao) {
    // Aqui você pode ramificar por etapas específicas da saúde
    // Exemplo: perguntar PSF, especialidade, anexos, etc.
    // Use atendimento.chatbot_state para controlar etapas
    // Retorne resposta, opcoes e proximoEstado conforme necessário
    return {
        resposta: 'Você está falando com a Secretaria de Saúde! Por favor, informe seu PSF de referência:',
        opcoes: [
            { id: 'psf_centro', nome: 'PSF Centro', emoji: '🏢' },
            { id: 'psf_zona_rural', nome: 'PSF Zona Rural', emoji: '🌾' },
            { id: 'psf_novo_bairro', nome: 'PSF Novo Bairro', emoji: '🏘️' }
        ],
        proximoEstado: 'SAUDE_PSF'
    };
}

// Fluxo detalhado para Educação (exemplo inicial)
async function fluxoEducacao(atendimento, mensagemCidadao) {
    return {
        resposta: 'Você está falando com a Secretaria de Educação! Qual serviço deseja?',
        opcoes: [
            { id: 'matricula', nome: 'Solicitar Matrícula Escolar', emoji: '📝' },
            { id: 'historico', nome: 'Emitir Histórico Escolar', emoji: '📄' },
            { id: 'info_escola', nome: 'Informações sobre Escolas', emoji: '🏫' }
        ],
        proximoEstado: 'EDUCACAO_SERVICO'
    };
}
// gci-backend/src/services/chatbotRouterService.js

import atendimentoService from './atendimentoService.js';
import secretariaService from './secretariaService.js';
import servicoService from './servicoService.js';
import logger from '../utils/logger.js';

/**
 * Roteador de fluxo conversacional do chatbot.
 * Decide a próxima mensagem e etapa com base no estado atual do atendimento.
 */
const ESTADOS = {
    INICIAL: 'BOT_INICIAL',
    AGUARDANDO_SECRETARIA: 'AGUARDANDO_SECRETARIA',
    AGUARDANDO_SERVICO: 'AGUARDANDO_SERVICO',
    AGUARDANDO_DESCRICAO: 'AGUARDANDO_DESCRICAO',
    FINALIZADO: 'FINALIZADO',
    // Adicione outros estados conforme necessário
};

async function proximoPasso(atendimento, mensagemCidadao) {
    // Exemplo de roteamento simples
    switch (atendimento.chatbot_state) {
        case ESTADOS.INICIAL: {
            // Retornar saudação e opções de secretarias
            const secretarias = await secretariaService.listarAtivasPorMunicipio(atendimento.municipio_id);
            return {
                resposta: '👋 Olá! Para qual secretaria você deseja atendimento?',
                opcoes: secretarias.map(s => ({ id: s.id, nome: s.nome, emoji: s.emoji })),
                proximoEstado: ESTADOS.AGUARDANDO_SECRETARIA
            };
        }
        case ESTADOS.AGUARDANDO_SECRETARIA: {
            // Buscar dados da secretaria selecionada
            const secretaria = await secretariaService.findById(mensagemCidadao.secretaria_id, { role: 'bot' });
            if (isSaude(secretaria)) {
                return await fluxoSaude(atendimento, mensagemCidadao);
            }
            if (isEducacao(secretaria)) {
                return await fluxoEducacao(atendimento, mensagemCidadao);
            }
            // Fluxo padrão para demais secretarias
            const servicos = await servicoService.listarAtivosPorSecretaria(mensagemCidadao.secretaria_id);
            return {
                resposta: `Ótimo! Qual serviço você precisa na secretaria?`,
                opcoes: servicos.map(s => ({ id: s.id, nome: s.nome, emoji: s.emoji })),
                proximoEstado: ESTADOS.AGUARDANDO_SERVICO
            };
        }
        // Aqui você pode adicionar cases específicos para etapas detalhadas de Saúde/Educação
        case 'SAUDE_PSF': {
            // Após PSF, perguntar especialidade
            return {
                resposta: 'Qual especialidade médica você precisa?',
                opcoes: [
                    { id: 'clinico', nome: 'Clínico Geral', emoji: '👩‍⚕️' },
                    { id: 'gineco', nome: 'Ginecologista', emoji: '🤰' },
                    { id: 'pediatra', nome: 'Pediatra', emoji: '👶' },
                    { id: 'dermato', nome: 'Dermatologista', emoji: '🩺' }
                ],
                proximoEstado: 'SAUDE_ESPECIALIDADE'
            };
        }
        case 'SAUDE_ESPECIALIDADE': {
            // Perguntar dia/horário preferido
            return {
                resposta: 'Qual o melhor dia e horário para seu atendimento?',
                proximoEstado: 'SAUDE_HORARIO'
            };
        }
        case 'SAUDE_HORARIO': {
            // Perguntar sobre anexo
            return {
                resposta: 'Deseja anexar um pedido médico ou documento? (Envie agora ou digite "não")',
                proximoEstado: 'SAUDE_ANEXO'
            };
        }
        case 'SAUDE_ANEXO': {
            // Após anexo, pedir e-mail
            return {
                resposta: 'Para finalizar, informe seu e-mail para receber o protocolo:',
                proximoEstado: 'SAUDE_EMAIL'
            };
        }
        case 'SAUDE_EMAIL': {
            // Finalizar atendimento saúde
            return {
                resposta: 'Atendimento de saúde registrado! Em breve você receberá a confirmação por e-mail. ✅',
                proximoEstado: ESTADOS.FINALIZADO
            };
        }
        case 'EDUCACAO_SERVICO': {
            // Após escolher serviço, perguntar escola desejada
            return {
                resposta: 'Para qual escola deseja atendimento? (Informe o nome ou escolha uma opção)',
                opcoes: [
                    { id: 'escola_central', nome: 'Escola Central', emoji: '🏫' },
                    { id: 'escola_bairro', nome: 'Escola do Bairro', emoji: '🏫' },
                    { id: 'escola_rural', nome: 'Escola Rural', emoji: '🏫' }
                ],
                proximoEstado: 'EDUCACAO_ESCOLA'
            };
        }
        case 'EDUCACAO_ESCOLA': {
            // Perguntar série/ano
            return {
                resposta: 'Qual a série/ano do aluno?',
                proximoEstado: 'EDUCACAO_SERIE'
            };
        }
        case 'EDUCACAO_SERIE': {
            // Pedir nome do aluno/responsável
            return {
                resposta: 'Por favor, informe o nome completo do aluno ou responsável:',
                proximoEstado: 'EDUCACAO_DADOS'
            };
        }
        case 'EDUCACAO_DADOS': {
            // Pedir e-mail para envio do protocolo
            return {
                resposta: 'Para finalizar, informe seu e-mail para receber o protocolo:',
                proximoEstado: 'EDUCACAO_EMAIL'
            };
        }
        case 'EDUCACAO_EMAIL': {
            // Finalizar atendimento educação
            return {
                resposta: 'Atendimento de educação registrado! Em breve entraremos em contato por e-mail. ✅',
                proximoEstado: ESTADOS.FINALIZADO
            };
        }
        case ESTADOS.AGUARDANDO_SERVICO: {
            // Após escolher o serviço, pedir descrição detalhada
            return {
                resposta: 'Por favor, descreva sua solicitação ou dúvida com o máximo de detalhes:',
                proximoEstado: 'OUTRAS_DESCRICAO'
            };
        }
        case 'OUTRAS_DESCRICAO': {
            // Perguntar se deseja anexar documento
            return {
                resposta: 'Deseja anexar algum documento ou foto para complementar sua solicitação? (Envie agora ou digite "não")',
                proximoEstado: 'OUTRAS_ANEXO'
            };
        }
        case 'OUTRAS_ANEXO': {
            // Pedir e-mail para envio do protocolo
            return {
                resposta: 'Para finalizar, informe seu e-mail para receber o protocolo:',
                proximoEstado: 'OUTRAS_EMAIL'
            };
        }
        case 'OUTRAS_EMAIL': {
            // Finalizar atendimento das demais secretarias
            return {
                resposta: 'Atendimento registrado! Em breve entraremos em contato por e-mail. ✅',
                proximoEstado: ESTADOS.FINALIZADO
            };
        }
        default:
            return {
                resposta: 'Atendimento finalizado ou em estado desconhecido.',
                proximoEstado: ESTADOS.FINALIZADO
            };
    }
}

export default {
    ESTADOS,
    proximoPasso
};
