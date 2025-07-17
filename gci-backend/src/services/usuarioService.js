// gci-backend/src/services/usuarioService.js
import bcrypt from 'bcryptjs';
import usuarioRepository from '../repositories/usuarioRepository.js';
import { validateHierarchy } from '../middlewares/hierarchyMiddleware.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const SALT_ROUNDS = 10;

const usuarioService = {
    async findAll(usuarioLogado, filtros = {}) {
        // CORREÇÃO CRÍTICA: Controle rigoroso de hierarquia
        logger.info(`[SECURITY] Buscando usuários - Usuário: ${usuarioLogado.email} (${usuarioLogado.role})`);


        if (usuarioLogado.role !== 'admin_sistema') {
            // Verificar se usuário tem município válido
            if (!usuarioLogado.municipio_id) {
                logger.error(`[SECURITY] Usuário ${usuarioLogado.email} sem município válido tentou listar usuários`);
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }

            // ISOLAMENTO ABSOLUTO: Forçar filtro por município
            filtros.forceMunicipioId = usuarioLogado.municipio_id;

            // Excluir admin_sistema da listagem para outros roles
            filtros.excludeRoles = ['admin_sistema'];

            // Admin município não pode ver outros admin_municipio
            if (usuarioLogado.role === 'admin_municipio') {
                filtros.excludeOtherAdminMunicipio = true;
                filtros.currentUserId = usuarioLogado.id;
            }
        }

        logger.info(`[SECURITY] Filtros aplicados: ${JSON.stringify(filtros)}`);
        return await usuarioRepository.findAll(filtros);
    }, async findById(id, usuarioLogado) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // CORREÇÃO CRÍTICA: Validação rigorosa de hierarquia
        if (usuarioLogado.role !== 'admin_sistema') {
            // CRÍTICO: Admin município NUNCA pode ver admin_sistema
            if (usuario.role === 'admin_sistema') {
                logger.warn(`🚨 TENTATIVA DE BYPASS: ${usuarioLogado.email} (${usuarioLogado.role}) tentou acessar admin_sistema ${usuario.email}`);
                throw new AppError('Acesso negado. Você não tem permissão para visualizar este usuário.', 403);
            }

            // Verificar se usuário logado tem município válido
            if (!usuarioLogado.municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }

            // Verificar se o usuário alvo pertence ao mesmo município
            if (!usuario.municipio_id || usuario.municipio_id !== usuarioLogado.municipio_id) {
                logger.warn(`🚨 TENTATIVA DE ACESSO CROSS-MUNICÍPIO: ${usuarioLogado.email} tentou acessar usuário de outro município`);
                throw new AppError('Acesso negado para visualizar este usuário.', 403);
            }
        }

        delete usuario.senha_hash;
        return usuario;
    },

    async create(dadosUsuario, usuarioLogado) {
        // CORREÇÃO CRÍTICA: Validar hierarquia antes de criar
        if (!validateHierarchy.canManageRole(usuarioLogado.role, dadosUsuario.role)) {
            throw new AppError(`Acesso negado. Sua role (${usuarioLogado.role}) não pode criar usuários com role (${dadosUsuario.role}).`, 403);
        }

        // Regra: Apenas admin_sistema pode criar usuários em qualquer município.
        // Admin_municipio só pode criar usuários para seu próprio município.
        if (usuarioLogado.role !== 'admin_sistema') {
            dadosUsuario.municipio_id = usuarioLogado.municipio_id;
        } else if (!dadosUsuario.municipio_id) {
            throw new AppError('Para criar um usuário como admin do sistema, o município é obrigatório.', 400);
        }

        const usuarioExistente = await usuarioRepository.findByEmail(dadosUsuario.email);
        if (usuarioExistente) {
            throw new AppError('O e-mail fornecido já está em uso.', 409);
        }

        const senha_hash = await bcrypt.hash(dadosUsuario.senha, SALT_ROUNDS);
        const novoUsuario = await usuarioRepository.create({ ...dadosUsuario, senha_hash });
        logger.info(`Usuário criado: ${novoUsuario.email} por ${usuarioLogado.email}`);
        return novoUsuario;
    },

    async update(id, dadosUpdate, usuarioLogado) {
        // CORREÇÃO CRÍTICA: Validar hierarquia antes de qualquer operação
        const usuarioAlvo = await usuarioRepository.findById(id);
        if (!usuarioAlvo) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // CRÍTICO: Admin município NUNCA pode editar admin_sistema
        if (usuarioLogado.role !== 'admin_sistema' && usuarioAlvo.role === 'admin_sistema') {
            throw new AppError('Acesso negado. Você não tem permissão para editar este usuário.', 403);
        }

        await this.findById(id, usuarioLogado); // Garante permissão de acesso

        if (dadosUpdate.senha) {
            dadosUpdate.senha_hash = await bcrypt.hash(dadosUpdate.senha, SALT_ROUNDS);
            delete dadosUpdate.senha;
        }

        if (usuarioLogado.role !== 'admin_sistema') {
            delete dadosUpdate.municipio_id;
            delete dadosUpdate.role; // Impedir que admin de município altere roles
        }

        return await usuarioRepository.update(id, dadosUpdate);
    },

    async remove(id, usuarioLogado) {
        if (id === usuarioLogado.id) {
            throw new AppError('Você não pode remover seu próprio usuário.', 400);
        }

        // CORREÇÃO CRÍTICA: Validar hierarquia antes de deletar
        const usuarioAlvo = await usuarioRepository.findById(id);
        if (!usuarioAlvo) {
            throw new AppError('Usuário não encontrado.', 404);
        }

        // CRÍTICO: Admin município NUNCA pode deletar admin_sistema
        if (usuarioLogado.role !== 'admin_sistema' && usuarioAlvo.role === 'admin_sistema') {
            logger.error(`🚨 TENTATIVA CRÍTICA DE BYPASS: ${usuarioLogado.email} (${usuarioLogado.role}) tentou DELETAR admin_sistema ${usuarioAlvo.email}`);
            throw new AppError('Acesso negado. Você não tem permissão para remover este usuário.', 403);
        }

        // CRÍTICO: Admin município não pode deletar outros admin_municipio
        if (usuarioLogado.role === 'admin_municipio' && usuarioAlvo.role === 'admin_municipio' && usuarioAlvo.id !== usuarioLogado.id) {
            logger.warn(`🚨 TENTATIVA DE BYPASS: ${usuarioLogado.email} tentou deletar outro admin_municipio ${usuarioAlvo.email}`);
            throw new AppError('Acesso negado. Você não pode remover outros administradores municipais.', 403);
        }

        await this.findById(id, usuarioLogado);
        await usuarioRepository.remove(id);
        logger.info(`Usuário ID ${id} removido por ${usuarioLogado.email}.`);
        return { message: 'Usuário removido com sucesso.' };
    }
};

export default usuarioService;