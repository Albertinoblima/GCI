// gci-backend/src/controllers/dashboardController.js
import dashboardService from '../services/dashboardService.js';

export const getStatsCards = async (req, res, next) => {
    try {
        // O serviço usará o req.user para filtrar os dados por município se necessário
        const stats = await dashboardService.getStatsCards(req.user);
        res.status(200).json({ status: 'success', data: { stats } });
    } catch (error) {
        next(error);
    }
};

export const getAtendimentosPorSecretaria = async (req, res, next) => {
    try {
        const data = await dashboardService.getAtendimentosPorSecretaria(req.user);
        res.status(200).json({ status: 'success', data: { chartData: data } });
    } catch (error) {
        next(error);
    }
};

export const getAtendimentosRecentes = async (req, res, next) => {
    try {
        const atendimentos = await dashboardService.getAtendimentosRecentes(req.user);
        res.status(200).json({ status: 'success', data: { atendimentos } });
    } catch (error) {
        next(error);
    }
};