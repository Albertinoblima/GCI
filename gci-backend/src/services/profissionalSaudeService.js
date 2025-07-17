// gci-backend/src/services/profissionalSaudeService.js
import saudeRepository from '../repositories/saudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import db from '../config/db.js';

const profissionalSaudeService = {
    async create(dados, user) {
        try {
            // Verificar permissões de acesso por município se necessário
            if (user.role !== 'admin_sistema' && dados.municipio_id !== user.municipio_id) {
                throw new AppError('Não autorizado a criar profissional neste município.', 403);
            }

            const novo = await saudeRepository.createProfissional(dados);
            logger.info(`Profissional de Saúde criado: "${novo.nome_completo}"`);
            return novo;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError('Registro de conselho já cadastrado.', 409);
            if (err.code === '23503') throw new AppError('Município inválido.', 400);
            throw new AppError('Erro ao criar profissional de saúde.', 500);
        }
    },

    async findByMunicipio(user) {
        try {
            // Determinar o município baseado no usuário
            let municipioId;
            if (user.role === 'admin_sistema') {
                // Admin sistema pode ver todos os profissionais
                // Se não há municipio_id específico, retorna todos
                municipioId = user.municipio_id || null;
            } else {
                // Admin municipal e gestor só veem do seu município
                municipioId = user.municipio_id;
                if (!municipioId) {
                    throw new AppError('Município não informado.', 400);
                }
            }

            const profissionais = await saudeRepository.findProfissionaisByMunicipio(municipioId);

            return profissionais;
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Erro ao buscar profissionais de saúde:', err);
            throw new AppError('Erro ao buscar profissionais de saúde.', 500);
        }
    },

    async findByMunicipioComFiltro(user, municipioIdFiltro = null) {
        try {
            let municipioId;

            if (user.role === 'admin_sistema') {
                // Admin sistema pode filtrar por município específico ou ver todos
                municipioId = municipioIdFiltro;
            } else {
                // Admin municipal e gestor só veem do seu município
                municipioId = user.municipio_id;
                if (!municipioId) {
                    throw new AppError('Município não informado.', 400);
                }
            }

            const profissionais = await saudeRepository.findProfissionaisByMunicipio(municipioId);

            return profissionais;
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Erro ao buscar profissionais de saúde:', err);
            throw new AppError('Erro ao buscar profissionais de saúde.', 500);
        }
    },

    async update(id, dados, user) {
        try {
            // Buscar o profissional atual para verificar permissões
            const profissionalAtual = await saudeRepository.findProfissionalById(id);
            if (!profissionalAtual) {
                throw new AppError('Profissional não encontrado.', 404);
            }

            if (user.role !== 'admin_sistema' && profissionalAtual.municipio_id !== user.municipio_id) {
                throw new AppError('Não autorizado a editar este profissional.', 403);
            }

            const atualizado = await saudeRepository.updateProfissional(id, dados);
            logger.info(`Profissional de Saúde atualizado: ID ${id}`);
            return atualizado;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError('Registro de conselho já cadastrado.', 409);
            throw new AppError('Erro ao atualizar profissional de saúde.', 500);
        }
    },

    async remove(id, user) {
        try {
            const profissionalAtual = await saudeRepository.findProfissionalById(id);
            if (!profissionalAtual) {
                throw new AppError('Profissional não encontrado.', 404);
            }

            if (user.role !== 'admin_sistema' && profissionalAtual.municipio_id !== user.municipio_id) {
                throw new AppError('Não autorizado a remover este profissional.', 403);
            }

            await saudeRepository.removeProfissional(id);
            logger.info(`Profissional de Saúde removido: ID ${id}`);
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError('Erro ao remover profissional de saúde.', 500);
        }
    },

    async createLink(dados, user) {
        try {
            // Verificar se o profissional pertence ao município do usuário
            const profissional = await saudeRepository.findProfissionalById(dados.profissional_id);
            if (!profissional) {
                throw new AppError('Profissional não encontrado.', 404);
            }

            if (user.role !== 'admin_sistema' && profissional.municipio_id !== user.municipio_id) {
                throw new AppError('Não autorizado a criar vínculo para este profissional.', 403);
            }

            const novo = await saudeRepository.createProfissionalLink(dados);
            logger.info(`Vínculo criado para profissional ID ${novo.profissional_id}`);
            return novo;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError('Este vínculo já existe.', 409);
            if (err.code === '23503') throw new AppError('IDs de profissional, especialidade ou unidade inválidos.', 400);
            throw new AppError('Erro ao criar vínculo.', 500);
        }
    },

    async findLinksByProfissional(profissionalId, user) {
        try {
            // Verificar se o profissional pertence ao município do usuário
            const profissional = await saudeRepository.findProfissionalById(profissionalId);
            if (!profissional) {
                throw new AppError('Profissional não encontrado.', 404);
            }

            if (user.role !== 'admin_sistema' && profissional.municipio_id !== user.municipio_id) {
                throw new AppError('Não autorizado a ver vínculos deste profissional.', 403);
            }

            const links = await saudeRepository.findLinksByProfissional(profissionalId);
            return links;
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Erro ao buscar vínculos do profissional:', err);
            throw new AppError('Erro ao buscar vínculos do profissional.', 500);
        }
    },

    async getAllUnidadesEspecialidades(user) {
        try {
            // Buscar todas as unidades de saúde do município
            const unidadesQuery = `
                SELECT id, nome 
                FROM unidades_saude 
                WHERE municipio_id = $1 
                ORDER BY nome ASC
            `;
            const unidadesResult = await db.query(unidadesQuery, [user.municipio_id]);

            // Buscar todas as especialidades médicas
            const especialidadesQuery = `
                SELECT id, nome_especialidade 
                FROM especialidades_medicas 
                ORDER BY nome_especialidade ASC
            `;
            const especialidadesResult = await db.query(especialidadesQuery);

            return {
                unidades: unidadesResult.rows,
                especialidades: especialidadesResult.rows
            };
        } catch (err) {
            logger.error('Erro ao buscar unidades e especialidades:', err);
            throw new AppError('Erro ao buscar unidades e especialidades.', 500);
        }
    }
};

export default profissionalSaudeService;