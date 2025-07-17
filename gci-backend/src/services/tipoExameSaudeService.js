// gci-backend/src/services/tipoExameSaudeService.js
import saudeRepository from '../repositories/saudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const tipoExameSaudeService = {
    async create(dados) {
        try {
            const novo = await saudeRepository.createTipoExame(dados);
            logger.info(`Tipo de exame criado: "${novo.nome_exame}"`);
            return novo;
        } catch (err) {
            if (err.code === '23505') throw new AppError(`O tipo de exame "${dados.nome_exame}" já existe neste município.`, 409);
            throw new AppError('Erro ao criar tipo de exame.', 500);
        }
    }
};
export default tipoExameSaudeService;