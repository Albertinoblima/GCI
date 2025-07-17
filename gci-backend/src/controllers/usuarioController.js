// gci-backend/src/controllers/usuarioController.js
import usuarioService from '../services/usuarioService.js';

export const getAll = async (req, res, next) => {
    try {
        const { user } = req;
        // 1. Passa req.query (que contém os filtros como page, limit, search, etc.) para o serviço
        const resultado = await usuarioService.findAll(user, req.query);
        res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
        next(error);
    }
};

export const create = async (req, res, next) => {
    try {
        const novoUsuario = await usuarioService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { usuario: novoUsuario } });
    } catch (error) { next(error); }
};

export const getOne = async (req, res, next) => {
    try {
        const usuario = await usuarioService.findById(Number(req.params.id), req.user);
        res.status(200).json({ status: 'success', data: { usuario } });
    } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
    try {
        const usuarioAtualizado = await usuarioService.update(Number(req.params.id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { usuario: usuarioAtualizado } });
    } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
    try {
        await usuarioService.remove(Number(req.params.id), req.user);
        res.status(204).send();
    } catch (error) { next(error); }
};