// gci-backend/src/services/unidadeSaudeService.js
import saudeRepository from '../repositories/saudeRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const unidadeSaudeService = {
    async create(dados, user) {
        try {
            // Validar permissões e definir municipio_id
            if (user.role === 'admin_municipio') {
                // Admin município só pode criar unidades no seu próprio município
                dados.municipio_id = user.municipio_id;
            } else if (user.role === 'admin_sistema') {
                // Admin sistema pode especificar o municipio_id ou não
                // Se não especificar, usar um município padrão (o primeiro disponível)
                if (!dados.municipio_id) {
                    // Buscar o primeiro município disponível
                    const municipios = await saudeRepository.getAllMunicipios();
                    if (municipios.length > 0) {
                        dados.municipio_id = municipios[0].id;
                        logger.info(`Admin sistema criando unidade sem município especificado, usando município padrão: ${municipios[0].nome}`);
                    } else {
                        throw new AppError('Nenhum município disponível para criar a unidade.', 400);
                    }
                }
            } else {
                throw new AppError('Permissão insuficiente para criar unidade de saúde.', 403);
            }

            const nova = await saudeRepository.createUnidade(dados);
            logger.info(`Unidade de Saúde criada: "${nova.nome}" no município ${dados.municipio_id}`);
            return nova;
        } catch (err) {
            if (err instanceof AppError) throw err;
            if (err.code === '23505') throw new AppError(`A unidade de saúde "${dados.nome}" já existe neste município.`, 409);
            throw new AppError('Erro ao criar unidade de saúde.', 500);
        }
    },
    async findByMunicipio(municipioId, user) {
        // Se é admin_sistema e municipioId é null, retorna todas as unidades
        if (user.role === 'admin_sistema' && municipioId === null) {
            return await saudeRepository.findAllUnidades();
        }

        // Permissão: admin_sistema pode tudo, admin_municipio só do seu município
        if (user.role === 'admin_municipio' && user.municipio_id !== municipioId) {
            throw new AppError('Acesso negado ao município.', 403);
        }
        return await saudeRepository.findUnidadesByMunicipio(municipioId);
    },
    async findById(id, user) {
        try {
            const unidade = await saudeRepository.findUnidadeById(id);
            if (!unidade) {
                throw new AppError('Unidade de saúde não encontrada.', 404);
            }

            // Verificar permissões
            if (user.role === 'admin_municipio' && user.municipio_id !== unidade.municipio_id) {
                throw new AppError('Acesso negado a esta unidade.', 403);
            }

            return unidade;
        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError('Erro ao buscar unidade de saúde.', 500);
        }
    },
    async update(id, dados, user) {
        // Busca unidade para checar município
        const unidade = await saudeRepository.findUnidadeById(id);
        if (!unidade) throw new AppError('Unidade não encontrada.', 404);
        if (user.role === 'admin_municipio' && user.municipio_id !== unidade.municipio_id) {
            throw new AppError('Acesso negado ao município.', 403);
        }
        if (user.role === 'gestor_secretaria' && user.secretaria_id !== unidade.secretaria_id) {
            throw new AppError('Acesso negado à secretaria.', 403);
        }
        try {
            const atualizada = await saudeRepository.updateUnidade(id, dados);
            logger.info(`Unidade de Saúde atualizada: "${atualizada.nome}" (ID: ${id})`);
            return atualizada;
        } catch (err) {
            if (err.code === '23505') throw new AppError('Nome já existe.', 409);
            throw new AppError('Erro ao atualizar unidade de saúde.', 500);
        }
    },
    async remove(id, user) {
        const unidade = await saudeRepository.findUnidadeById(id);
        if (!unidade) throw new AppError('Unidade não encontrada.', 404);
        if (user.role === 'admin_municipio' && user.municipio_id !== unidade.municipio_id) {
            throw new AppError('Acesso negado ao município.', 403);
        }
        if (user.role === 'gestor_secretaria' && user.secretaria_id !== unidade.secretaria_id) {
            throw new AppError('Acesso negado à secretaria.', 403);
        }
        await saudeRepository.removeUnidade(id);
        logger.info(`Unidade de Saúde removida: "${unidade.nome}" (ID: ${id})`);
        return { message: 'Unidade removida com sucesso.' };
    }
};
export default unidadeSaudeService;