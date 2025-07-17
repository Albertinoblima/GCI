// gci-backend/src/services/servicoService.js

import servicoRepository from '../repositories/servicoRepository.js';
import secretariaRepository from '../repositories/secretariaRepository.js'; // Precisamos dele
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const servicoService = {
    /**
     * Cria um novo serviço, validando as permissões e a existência dos recursos pais.
     * @param {object} dadosServico - Os dados do serviço a ser criado.
     * @param {object} user - O usuário autenticado.
     * @returns {Promise<object>} O novo serviço criado.
     */
    async create(dadosServico, user) {
        const targetSecretariaId = dadosServico.secretaria_id;

        // 1. VERIFICA SE A SECRETARIA EXISTE E OBTÉM SEUS DADOS COMPLETOS
        const secretaria = await secretariaRepository.findById(targetSecretariaId);
        if (!secretaria) {
            throw new AppError('A secretaria especificada não foi encontrada.', 404);
        }

        // 2. VERIFICA A PERMISSÃO (Broken Access Control)
        // O authMiddleware já garante a ROLE. Agora, verificamos o ESCOPO.
        if (user.role === 'admin_municipio' && user.municipio_id !== secretaria.municipio_id) {
            throw new AppError('Acesso negado. Você só pode gerenciar serviços do seu próprio município.', 403);
        }
        // Nota: A lógica para 'gestor_secretaria' seria mais complexa, verificando
        // se o user.id tem acesso direto à targetSecretariaId. Deixaremos isso para depois.

        // 3. TENTA CRIAR O SERVIÇO
        try {
            const novoServico = await servicoRepository.create(dadosServico);
            logger.info(`Serviço '${novoServico.nome}' criado para a secretaria ID ${targetSecretariaId}.`);
            return novoServico;
        } catch (err) {
            if (err.code === '23505') { // unique_violation
                throw new AppError('Já existe um serviço com este nome nesta secretaria.', 409);
            }
            logger.error('Erro no repositório ao criar serviço.', { error: err.message });
            throw new AppError('Erro interno ao criar serviço.', 500);
        }
    },

    // É crucial que os outros métodos (update, remove, etc.) também tenham essa verificação
    // ...

    /**
     * Lista serviços ativos de uma secretaria
     * @param {number} secretariaId
     * @returns {Promise<Array>} Lista de serviços ativos
     */
    async listarAtivosPorSecretaria(secretariaId) {
        // Busca todos os serviços ativos para a secretaria
        return await servicoRepository.findBySecretariaId(secretariaId, { ativo: true });
    }
};

export default servicoService;