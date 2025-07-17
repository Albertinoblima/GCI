// gci-backend/src/services/escolaService.js
import escolaRepository from '../repositories/escolaRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const escolaService = {
    async create(dadosEscola, user) {
        try {
            // CORREÇÃO CRÍTICA: Validação rigorosa de município
            if (user.role !== 'admin_sistema') {
                // Verificar se usuário tem município válido
                if (!user.municipio_id) {
                    throw new AppError('Usuário deve estar associado a um município válido.', 403);
                }

                // Forçar município do usuário se não for admin_sistema
                dadosEscola.municipio_id = user.municipio_id;
            } else if (!dadosEscola.municipio_id) {
                throw new AppError('Para criar escola como admin do sistema, o município é obrigatório.', 400);
            }

            // Verificar se não é tentativa de bypass
            if (user.role !== 'admin_sistema' && dadosEscola.municipio_id !== user.municipio_id) {
                logger.warn(`🚨 TENTATIVA DE BYPASS: ${user.email} tentou criar escola em município diferente`);
                throw new AppError('Não autorizado a criar escola neste município.', 403);
            }

            const novaEscola = await escolaRepository.create(dadosEscola);
            logger.info(`[EDUCAÇÃO] Escola criada: "${novaEscola.nome}" por ${user.email} no município ${novaEscola.municipio_id}`);
            return novaEscola;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError('Já existe uma escola com este nome no município.', 409);
            if (err.code === '23503') throw new AppError('Município inválido.', 400);
            throw new AppError('Erro ao criar escola.', 500);
        }
    },

    async findByMunicipio(user) {
        try {
            // CORREÇÃO CRÍTICA: Validação de acesso por município
            if (user.role === 'admin_sistema') {
                // Admin sistema pode ver todas as escolas com filtro opcional
                return await escolaRepository.findAll();
            }

            // Outros usuários só veem escolas do próprio município
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }

            logger.info(`[EDUCAÇÃO] Buscando escolas do município ${user.municipio_id} para usuário ${user.email}`);
            return await escolaRepository.findAllByMunicipio(user.municipio_id);
        } catch (error) {
            logger.error('Erro ao buscar escolas por município:', error);
            throw error;
        }
    },

    async findAll(filtros = {}, user) {
        // CORREÇÃO CRÍTICA: Aplicar filtro de município baseado na role
        if (user.role !== 'admin_sistema') {
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            filtros.municipioId = user.municipio_id;
        }

        logger.info(`[EDUCAÇÃO] Listando escolas com filtros: ${JSON.stringify(filtros)} por ${user.email}`);
        return await escolaRepository.findAll(filtros);
    },
    async findById(id, user) {
        const escola = await escolaRepository.findById(id);
        if (!escola) {
            throw new AppError('Escola não encontrada.', 404);
        }

        // CORREÇÃO CRÍTICA: Validar acesso por município
        if (user.role !== 'admin_sistema') {
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }

            if (escola.municipio_id !== user.municipio_id) {
                logger.warn(`🚨 TENTATIVA DE ACESSO CROSS-MUNICÍPIO: ${user.email} tentou acessar escola de outro município`);
                throw new AppError('Acesso negado para visualizar esta escola.', 403);
            }
        }

        return escola;
    },

    async update(id, dados, user) {
        try {
            // CORREÇÃO CRÍTICA: Buscar e validar permissões antes
            const escolaAtual = await this.findById(id, user);

            // Impedir alteração do município (somente admin_sistema pode fazer isso)
            if (user.role !== 'admin_sistema' && dados.municipio_id && dados.municipio_id !== escolaAtual.municipio_id) {
                throw new AppError('Não autorizado a alterar o município da escola.', 403);
            }

            const escolaAtualizada = await escolaRepository.update(id, dados);
            logger.info(`[EDUCAÇÃO] Escola atualizada: ID ${id} por ${user.email}`);
            return escolaAtualizada;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError('Já existe uma escola com este nome no município.', 409);
            throw new AppError('Erro ao atualizar escola.', 500);
        }
    },

    async remove(id, user) {
        try {
            // CORREÇÃO CRÍTICA: Validar permissões antes de deletar
            const escolaAtual = await this.findById(id, user);

            await escolaRepository.remove(id);
            logger.info(`[EDUCAÇÃO] Escola removida: ID ${id} (${escolaAtual.nome}) por ${user.email}`);
            return { message: 'Escola removida com sucesso.' };
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError('Erro ao remover escola.', 500);
        }
    }
};
export default escolaService;