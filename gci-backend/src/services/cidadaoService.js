// gci-backend/src/services/cidadaoService.js
import cidadaoRepository from '../repositories/cidadaoRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const cidadaoService = {
    /**
     * Encontra um cidadão pelo seu canal de comunicação e ID, ou cria um novo se não existir.
     * @param {object} dadosCidadao - Dados para encontrar ou criar.
     * @returns {Promise<object>} O cidadão encontrado ou criado.
     */
    async findOrCreate(dadosCidadao) {
        const { canal_comunicacao, id_canal_origem } = dadosCidadao;

        let cidadao = await cidadaoRepository.findByCanal(canal_comunicacao, id_canal_origem);

        if (cidadao) {
            return cidadao;
        }

        try {
            cidadao = await cidadaoRepository.create(dadosCidadao);
            logger.info(`Novo cidadão criado a partir do canal ${canal_comunicacao}: ${id_canal_origem}`);
            return cidadao;
        } catch (err) {
            logger.error(`Erro no serviço ao criar cidadão.`, { error: err.message });
            throw new AppError('Erro ao registrar novo cidadão.', 500);
        }
    },

    async findById(id) {
        const cidadao = await cidadaoRepository.findById(id);
        if (!cidadao) {
            throw new AppError('Cidadão não encontrado.', 404);
        }
        return cidadao;
    },

    /**
     * Lista todos os cidadãos com filtros (função administrativa).
     * @param {object} filtros - Filtros de busca
     * @returns {Promise<object>} Lista de cidadãos com metadados
     */
    async findAll(filtros = {}) {
        return await cidadaoRepository.findAll(filtros);
    },

    // Outros placeholders
    async update(id, data) { /* ... */ },
};

export default cidadaoService;