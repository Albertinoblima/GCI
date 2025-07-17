// gci-backend/src/services/triagemSaudeService.js
import saudeRepository from '../repositories/saudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const triagemSaudeService = {
    async create(dados) {
        const dadosParaSalvar = {
            ...dados,
            dados_coletados: JSON.stringify(dados.dados_coletados || {}),
            status_triagem: dados.status_triagem || 'aguardando_analise'
        };
        try {
            const nova = await saudeRepository.createTriagem(dadosParaSalvar);
            logger.info(`Triagem de saúde criada para o cidadão ID ${nova.cidadao_id}`);
            return nova;
        } catch (err) {
            if (err.code === '23503') throw new AppError('IDs de cidadão, município ou outros inválidos.', 400);
            throw new AppError('Erro ao criar triagem de saúde.', 500);
        }
    }
};
export default triagemSaudeService;