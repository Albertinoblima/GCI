// gci-backend/src/controllers/atendimentoController.js
import atendimentoService from '../services/atendimentoService.js';
import AppError from '../utils/AppError.js';

/**
 * Lista todos os atendimentos com base nos filtros e permissões do usuário.
 */
export const listAll = async (req, res, next) => {
    try {
        const { user } = req; // Usuário logado, vindo do authMiddleware
        const filtros = req.query; // Filtros da URL (ex: ?status=aberto&page=1)

        const resultado = await atendimentoService.findAll({
            userRole: user.role,
            userMunicipioId: user.municipio_id,
        }, filtros);

        res.status(200).json({
            status: 'success',
            data: resultado, // O serviço já deve retornar um objeto com { atendimentos, total, pages, ... }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cria um novo atendimento.
 * Geralmente iniciado por um sistema (ex: webhook) ou manualmente por um agente.
 */
export const create = async (req, res, next) => {
    try {
        // Validação de dados de entrada deve ser feita por um validationMiddleware.
        // O `req.user` pode ser usado para preencher `municipio_id` se não vier no corpo.
        const dadosNovoAtendimento = {
            ...req.body,
            municipio_id: req.body.municipio_id || req.user.municipio_id,
        };

        const novoAtendimento = await atendimentoService.create(dadosNovoAtendimento);

        res.status(201).json({
            status: 'success',
            data: {
                atendimento: novoAtendimento,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Busca um único atendimento pelo seu ID ou Protocolo.
 */
export const getOne = async (req, res, next) => {
    try {
        const { idOrProtocolo } = req.params;
        const { user } = req;

        const atendimento = await atendimentoService.findByIdOrProtocolo(idOrProtocolo, user);

        res.status(200).json({
            status: 'success',
            data: {
                atendimento,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Atualiza um atendimento (ex: status, atendente responsável, etc.).
 */
export const update = async (req, res, next) => {
    try {
        const { idOrProtocolo } = req.params;
        const dadosUpdate = req.body;
        const { user } = req;

        const atendimentoAtualizado = await atendimentoService.update(idOrProtocolo, dadosUpdate, user);

        res.status(200).json({
            status: 'success',
            data: {
                atendimento: atendimentoAtualizado,
            },
        });
    } catch (error) {
        next(error);
    }
};