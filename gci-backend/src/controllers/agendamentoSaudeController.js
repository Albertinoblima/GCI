// gci-backend/src/controllers/agendamentoSaudeController.js
import agendamentoSaudeService from '../services/agendamentoSaudeService.js';

export const create = async (req, res, next) => {
    try {
        // Se o agendamento for feito por um agente, o cidadao_id virá no corpo.
        // Se fosse feito pelo próprio cidadão, pegaríamos do req.user.id.
        const novoAgendamento = await agendamentoSaudeService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { agendamento: novoAgendamento } });
    } catch (error) { next(error); }
};

export const listAll = async (req, res, next) => {
    try {
        // Verificar se o service está disponível
        if (!agendamentoSaudeService || !agendamentoSaudeService.findAll) {
            return res.status(500).json({
                status: 'error',
                message: 'Serviço de agendamentos não disponível',
                code: 'SERVICE_UNAVAILABLE',
                timestamp: new Date().toISOString()
            });
        }

        // Buscar agendamentos com tratamento de erro específico
        const result = await agendamentoSaudeService.findAll(req.query, req.user);

        // Verificar se result tem a estrutura esperada
        const agendamentos = result?.agendamentos || result?.data || result || [];

        console.log(`✅ Busca executada com sucesso. Registros encontrados: ${agendamentos.length}`);

        // TRATAMENTO ESPECÍFICO PARA RESULTADO VAZIO
        if (!agendamentos || agendamentos.length === 0) {
            console.log('📭 Nenhum agendamento encontrado - retornando resposta apropriada');
            return res.status(200).json({
                status: 'success',
                message: 'Nenhum agendamento encontrado.',
                data: { agendamentos: [] },
                count: 0,
                isEmpty: true,
                timestamp: new Date().toISOString()
            });
        }

        // Retornar dados quando existirem
        console.log('🎉 Agendamentos encontrados, enviando resposta...');
        return res.status(200).json({
            status: 'success',
            message: `${agendamentos.length} agendamento(s) encontrado(s)`,
            data: { agendamentos },
            count: agendamentos.length,
            isEmpty: false,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ ERRO DETALHADO no listAll:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Tratamento específico para diferentes tipos de erro
        if (error.message?.includes('tabela') || error.message?.includes('table')) {
            return res.status(404).json({
                status: 'error',
                message: 'Tabela de agendamentos não encontrada',
                code: 'TABLE_NOT_FOUND',
                timestamp: new Date().toISOString()
            });
        }

        if (error.message?.includes('conexão') || error.message?.includes('connection')) {
            return res.status(503).json({
                status: 'error',
                message: 'Erro de conexão com o banco de dados',
                code: 'DB_CONNECTION_ERROR',
                timestamp: new Date().toISOString()
            });
        }

        // Erro genérico - evitar vazamento de informações
        res.status(500).json({
            status: 'error',
            message: 'Erro interno ao buscar agendamentos',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        });
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const agendamento = await agendamentoSaudeService.findById(Number(id), req.user);
        res.status(200).json({ status: 'success', data: { agendamento } });
    } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const agendamento = await agendamentoSaudeService.updateStatus(Number(id), status, req.user);
        res.status(200).json({ status: 'success', data: { agendamento } });
    } catch (error) { next(error); }
};