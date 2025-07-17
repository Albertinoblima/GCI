// gci-backend/src/services/secretariaService.js

import secretariaRepository from '../repositories/secretariaRepository.js';
import municipioRepository from '../repositories/municipioRepository.js';
import AppError from './../utils/AppError.js';
import logger from './../utils/logger.js';

// Função helper de permissão, como discutido.
const checkPermission = (user, targetMunicipioId) => {
    // CORREÇÃO CRÍTICA: Validar se parâmetros são válidos
    if (!user || !user.role) {
        throw new AppError('Usuário inválido ou sem role definida.', 403);
    }

    if (!targetMunicipioId) {
        throw new AppError('Município de destino não especificado.', 400);
    }

    // Admin sistema tem permissão total
    if (user.role === 'admin_sistema') {
        return;
    }

    // Para admin_municipio, verificar se tem município válido e se corresponde ao alvo
    if (user.role === 'admin_municipio') {
        if (!user.municipio_id) {
            throw new AppError('Usuário admin_municipio deve ter município válido.', 403);
        }
        if (Number(user.municipio_id) === Number(targetMunicipioId)) {
            return; // Permissão para o próprio município
        }
    }

    // Se nenhuma das condições acima for atendida, lança erro.
    throw new AppError('Você não tem permissão para executar esta ação neste município.', 403);
};

const secretariaService = {
    // Assinatura CORRIGIDA para corresponder ao controller
    async create(dadosSecretaria, user) {
        const { municipio_id } = dadosSecretaria;

        // 1. Verifica permissão ANTES de qualquer outra coisa.
        checkPermission(user, municipio_id);

        // 2. Verifica se o município alvo existe.
        const municipio = await municipioRepository.findById(municipio_id);
        if (!municipio) {
            throw new AppError('Município não encontrado.', 404);
        }

        // 3. Tenta criar no repositório.
        try {
            const novaSecretaria = await secretariaRepository.create(dadosSecretaria);
            logger.info(`Secretaria '${novaSecretaria.nome}' criada para o município ID ${municipio_id} pelo usuário ID ${user.id}.`);
            return novaSecretaria;
        } catch (err) {
            if (err.code === '23505') { // unique_violation
                throw new AppError('Já existe uma secretaria com este nome neste município.', 409);
            }
            logger.error('Erro no repositório ao criar secretaria.', { error: err.message });
            throw new AppError('Erro ao criar secretaria.', 500);
        }
    },

    // Adapte os outros métodos para também usar o check de permissão
    async findByMunicipioId(municipioId, user) {
        checkPermission(user, municipioId);
        return await secretariaRepository.findByMunicipioId(municipioId);
    },

    async findById(secretariaId, user) {
        const secretaria = await secretariaRepository.findById(secretariaId);
        if (!secretaria) {
            throw new AppError('Secretaria não encontrada.', 404);
        }
        // Após encontrar, verifica se o usuário tem permissão para vê-la.
        checkPermission(user, secretaria.municipio_id);
        return secretaria;
    },

    async update(id, dados, user) {
        const secretaria = await secretariaService.findById(id, user);
        try {
            return await secretariaRepository.update(id, dados);
        } catch (err) {
            if (err.code === '23505') throw new AppError('Já existe uma secretaria com este nome no município.', 409);
            throw err;
        }
    },

    async remove(id, user) {
        const secretaria = await secretariaService.findById(id, user);
        await secretariaRepository.remove(id);
        return { message: 'Secretaria removida com sucesso.' };
    }
};

export default secretariaService;