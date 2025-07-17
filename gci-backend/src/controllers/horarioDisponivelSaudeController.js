// gci-backend/src/controllers/horarioDisponivelSaudeController.js
import horarioDisponivelSaudeService from '../services/horarioDisponivelSaudeService.js';

export const create = async (req, res, next) => {
    try {
        const novoHorario = await horarioDisponivelSaudeService.create(req.body);
        res.status(201).json({ status: 'success', data: { horario: novoHorario } });
    } catch (error) {
        next(error);
    }
};

export const listAll = async (req, res, next) => {
    try {
        const horarios = await horarioDisponivelSaudeService.findAll(req.query);
        res.status(200).json({ status: 'success', data: { horarios } });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const horario = await horarioDisponivelSaudeService.findById(Number(id));
        res.status(200).json({ status: 'success', data: { horario } });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status_slot } = req.body;
        const horario = await horarioDisponivelSaudeService.updateStatus(Number(id), status_slot);
        res.status(200).json({ status: 'success', data: { horario } });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Por enquanto, vamos apenas marcar como cancelado
        await horarioDisponivelSaudeService.updateStatus(Number(id), 'cancelado');
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const createBatch = async (req, res, next) => {
    try {
        console.log('🔍 [CONTROLLER] Função createBatch iniciada');
        console.log('🔍 [CONTROLLER] Dados recebidos:', JSON.stringify(req.body, null, 2));

        // Validar se há dados no body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Dados obrigatórios não fornecidos no corpo da requisição.'
            });
        }

        // Converter valores de string para number quando necessário
        const dadosProcessados = {
            ...req.body,
            profissionalId: Number(req.body.profissionalId),
            unidade_id: Number(req.body.unidade_id),
            especialidade_id: Number(req.body.especialidade_id),
            intervalo_minutos: Number(req.body.intervalo_minutos || 30)
        };

        console.log('🔍 [CONTROLLER] Dados processados:', JSON.stringify(dadosProcessados, null, 2));

        const horarios = await horarioDisponivelSaudeService.createBatch(dadosProcessados);
        console.log('✅ [CONTROLLER] Horários criados com sucesso:', horarios.length);

        res.status(201).json({
            status: 'success',
            data: { horarios }
        });
    } catch (error) {
        console.error('❌ [CONTROLLER] Erro no controller:', error.message);
        next(error);
    }
};