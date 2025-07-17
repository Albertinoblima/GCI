// gci-backend/src/services/municipioService.js
import municipioRepository from '../repositories/municipioRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const municipioService = {
    async create(dadosMunicipio, user) {
        // Apenas admin_sistema pode criar municípios
        if (user.role !== 'admin_sistema') {
            throw new AppError('Apenas administradores do sistema podem criar municípios.', 403);
        }

        try {
            const novoMunicipio = await municipioRepository.create(dadosMunicipio);
            return novoMunicipio;
        } catch (err) {
            // Captura o erro de constraint do repositório
            if (err.code === '23505') { // unique_violation
                throw new AppError('Já existe um município com este nome ou sigla de protocolo.', 409);
            }
            logger.error('Erro no serviço ao criar município.', { error: err.message });
            throw new AppError('Erro ao criar município.', 500);
        }
    },

    async findAll(user) {
        // admin_sistema vê todos os municípios
        if (user.role === 'admin_sistema') {
            return await municipioRepository.findAll();
        }

        // admin_municipio e outros só veem o próprio município
        if (user.municipio_id) {
            const municipio = await municipioRepository.findById(user.municipio_id);
            return municipio ? [municipio] : [];
        }

        throw new AppError('Usuário não possui município associado.', 400);
    },

    async findById(id, user) {
        // CORREÇÃO CRÍTICA: Validação rigorosa de permissões
        if (user.role !== 'admin_sistema') {
            // Verificar se usuário tem município válido
            if (!user.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            // Comparação rigorosa usando números
            if (Number(user.municipio_id) !== Number(id)) {
                throw new AppError('Acesso negado ao município.', 403);
            }
        }

        const municipio = await municipioRepository.findById(id);
        if (!municipio) {
            throw new AppError('Município não encontrado.', 404);
        }
        return municipio;
    },

    async update(id, dadosUpdate, user) {
        // Verifica permissão primeiro
        await this.findById(id, user); // Garante que existe e tem permissão

        try {
            const municipioAtualizado = await municipioRepository.update(id, dadosUpdate);
            logger.debug(`Município atualizado: ${municipioAtualizado.nome} (ID: ${id})`);
            return municipioAtualizado;
        } catch (err) {
            if (err.code === '23505') {
                throw new AppError('Conflito: Nome ou sigla já em uso por outro município.', 409);
            }
            throw new AppError('Erro ao atualizar município.', 500);
        }
    },

    async remove(id, user) {
        // Apenas admin_sistema pode remover municípios
        if (user.role !== 'admin_sistema') {
            throw new AppError('Apenas administradores do sistema podem remover municípios.', 403);
        }

        await this.findById(id, user); // Garante que existe
        try {
            await municipioRepository.remove(id);
        } catch (error) {
            if (error.code === '23503') {
                throw new AppError('Não é possível deletar este município, pois ele possui registros associados.', 409);
            }
            throw error;
        }
    }
};

export default municipioService;