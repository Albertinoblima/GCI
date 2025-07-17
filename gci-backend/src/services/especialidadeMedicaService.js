// gci-backend/src/services/especialidadeMedicaService.js
import saudeRepository from '../repositories/saudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const especialidadeMedicaService = {
    async create(dados) {
        try {
            const nova = await saudeRepository.createEspecialidade(dados);
            logger.info(`Especialidade Médica criada: "${nova.nome_especialidade}"`);
            return nova;
        } catch (err) {
            if (err.code === '23505') throw new AppError(`A especialidade "${dados.nome_especialidade}" já existe.`, 409);
            throw new AppError('Erro ao criar especialidade médica.', 500);
        }
    },
    async findAll() {
        return saudeRepository.findAllEspecialidades();
    },

    async findById(id) {
        const especialidade = await saudeRepository.findEspecialidadeById(id);
        if (!especialidade) {
            throw new AppError('Especialidade médica não encontrada.', 404);
        }
        return especialidade;
    },

    async update(id, dados) {
        try {
            const especialidade = await saudeRepository.updateEspecialidade(id, dados);
            if (!especialidade) {
                throw new AppError('Especialidade médica não encontrada.', 404);
            }
            logger.info(`Especialidade Médica atualizada: "${especialidade.nome_especialidade}"`);
            return especialidade;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError(`A especialidade "${dados.nome_especialidade}" já existe.`, 409);
            throw new AppError('Erro ao atualizar especialidade médica.', 500);
        }
    },

    async remove(id) {
        try {
            const especialidade = await saudeRepository.removeEspecialidade(id);
            if (!especialidade) {
                throw new AppError('Especialidade médica não encontrada.', 404);
            }
            logger.info(`Especialidade Médica removida: "${especialidade.nome_especialidade}"`);
            return especialidade;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23503') throw new AppError('Não é possível remover esta especialidade pois ela está sendo utilizada.', 409);
            throw new AppError('Erro ao remover especialidade médica.', 500);
        }
    }
};
export default especialidadeMedicaService;