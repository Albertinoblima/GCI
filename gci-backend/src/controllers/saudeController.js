// gci-backend/src/controllers/saudeController.js
import saudeService from '../services/saudeService.js'; // Um novo serviço agregador

export const getOpcoesAgendamento = async (req, res, next) => {
    try {
        const { municipio_id } = req.user;
        const opcoes = await saudeService.getOpcoesAgendamento(municipio_id);
        res.status(200).json({ status: 'success', data: opcoes });
    } catch (error) {
        next(error);
    }
};

export const getHorariosDisponiveis = async (req, res, next) => {
    try {
        const { municipio_id } = req.user;
        const filtros = { ...req.query, municipio_id }; // Adiciona o município do usuário aos filtros
        const horarios = await saudeService.getHorariosDisponiveis(filtros);
        res.status(200).json({ status: 'success', data: { horarios } });
    } catch (error) {
        next(error);
    }
};