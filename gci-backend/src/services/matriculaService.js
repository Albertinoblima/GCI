// gci-backend/src/services/matriculaService.js
import matriculaRepository from '../repositories/matriculaRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const matriculaService = {
    /**
     * Cria uma nova solicitação de matrícula.
     */
    async create(dadosMatricula, user) {
        const { nome_aluno } = dadosMatricula;
        try {
            // CORREÇÃO CRÍTICA: Validação de município
            if (user.role !== 'admin_sistema') {
                if (!user.municipio_id) {
                    throw new AppError('Usuário deve estar associado a um município válido.', 403);
                }
                // Forçar município do usuário
                dadosMatricula.municipio_id = user.municipio_id;
            } else if (!dadosMatricula.municipio_id) {
                throw new AppError('Para criar matrícula como admin do sistema, o município é obrigatório.', 400);
            }

            const novaSolicitacao = await matriculaRepository.create(dadosMatricula);
            logger.info(`[EDUCAÇÃO] Solicitação de matrícula criada para "${nome_aluno}" por ${user.email} no município ${novaSolicitacao.municipio_id}`);
            return novaSolicitacao;
        } catch (err) {
            logger.error(`Erro ao criar solicitação de matrícula`, { error: err.message });
            if (err.code === '23503') {
                throw new AppError('Escola ou cidadão inválido.', 400);
            }
            throw new AppError('Erro ao criar solicitação de matrícula.', 500);
        }
    },

    /**
     * Busca todas as solicitações de matrícula com filtros por município.
     */
    async findAll(filtros, user) {
        // CORREÇÃO CRÍTICA: Aplicar filtro de município baseado na role
        if (user.role !== 'admin_sistema') {
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            filtros.municipioId = user.municipio_id;
        }

        logger.info(`[EDUCAÇÃO] Listando matrículas com filtros: ${JSON.stringify(filtros)} por ${user.email}`);
        const resultado = await matriculaRepository.findAll(filtros);
        return {
            solicitacoes: resultado.data,
            total: resultado.total,
            pages: resultado.pages,
            currentPage: resultado.currentPage
        };
    },

    /**
     * Busca uma única solicitação por ID com validação de município.
     */
    async findById(id, user) {
        const solicitacao = await matriculaRepository.findById(id);
        if (!solicitacao) {
            throw new AppError('Solicitação de matrícula não encontrada.', 404);
        }

        // CORREÇÃO CRÍTICA: Validar acesso por município
        if (user.role !== 'admin_sistema') {
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }

            if (solicitacao.municipio_id !== user.municipio_id) {
                logger.warn(`🚨 TENTATIVA DE ACESSO CROSS-MUNICÍPIO: ${user.email} tentou acessar matrícula de outro município`);
                throw new AppError('Acesso negado para visualizar esta solicitação.', 403);
            }
        }


        return solicitacao;
    },

    /**
     * Atualiza o status de uma solicitação de matrícula.
     * @param {number} id - O ID da solicitação.
     * @param {string} status - O novo status (ex: 'aprovada', 'reprovada').
     * @param {string} [observacoes] - Observações opcionais da secretaria.
     * @param {object} usuario - O usuário que está realizando a ação.
     * @returns {Promise<object>} A solicitação atualizada.
     */

    async updateStatus(id, status, observacoes, usuario) {
        // Validação de segurança: buscar a solicitação para garantir que o usuário tem permissão
        const solicitacaoExistente = await this.findById(id, usuario);

        if (usuario.role !== 'admin_sistema' && solicitacaoExistente.municipio_id !== usuario.municipio_id) {
            throw new AppError('Você não tem permissão para alterar esta solicitação.', 403);
        }

        // TODO: Notificar o cidadão sobre a mudança de status (via WhatsApp, etc.)

        logger.info(`Status da solicitação de matrícula ID ${id} alterado para "${status}" pelo usuário ID ${usuario.id}.`);
        return await matriculaRepository.update(id, { status_solicitacao: status, observacoes_secretaria: observacoes });
    },

    /**
     * Atualiza uma solicitação de matrícula.
     * @param {number} id - O ID da solicitação.
     * @param {object} dados - Os dados para atualizar.
     * @param {object} usuario - O usuário que está realizando a ação.
     * @returns {Promise<object>} A solicitação atualizada.
     */
    async update(id, dados, usuario) {
        // Validação de segurança: buscar a solicitação para garantir que o usuário tem permissão
        const solicitacaoExistente = await this.findById(id, usuario);

        if (usuario.role !== 'admin_sistema' && solicitacaoExistente.municipio_id !== usuario.municipio_id) {
            throw new AppError('Você não tem permissão para alterar esta solicitação.', 403);
        }

        logger.info(`Solicitação de matrícula ID ${id} atualizada pelo usuário ID ${usuario.id}.`);
        return await matriculaRepository.update(id, dados);
    }
};

export default matriculaService;