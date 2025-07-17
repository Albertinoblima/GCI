// gci-backend/src/controllers/templateMensagemController.js

import templateMensagemService from '../services/templateMensagemService.js';

export const create = async (req, res, next) => {
    try {
        const novoTemplate = await templateMensagemService.create(req.body);
        res.status(201).json(novoTemplate);
    } catch (error) {
        next(error);
    }
};

export const getAll = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const getOne = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const update = (req, res) => {
    res.status(501).json({ message: 'Não implementado' });
};
export const remove = (req, res) => res.status(501).json({ message: 'Não implementado' });