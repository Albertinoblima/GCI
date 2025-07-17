// gci-backend/src/controllers/tipoExameSaudeController.js

import tipoExameSaudeService from '../services/tipoExameSaudeService.js';

export const create = async (req, res, next) => {
    try {
        const novoTipoExame = await tipoExameSaudeService.create(req.body);
        res.status(201).json(novoTipoExame);
    } catch (error) {
        next(error);
    }
};

export const listAll = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const getOne = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const update = (req, res) => {
    res.status(501).json({ message: 'Não implementado' });
};
export const remove = (req, res) => res.status(501).json({ message: 'Não implementado' });