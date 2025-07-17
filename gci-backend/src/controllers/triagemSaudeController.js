// gci-backend/src/controllers/triagemSaudeController.js

import triagemSaudeService from '../services/triagemSaudeService.js';

export const create = async (req, res, next) => {
    try {
        // A triagem pode ser iniciada pelo próprio cidadão ou por um agente
        const dadosTriagem = { ...req.body, cidadao_id: req.user.id }; // Assume que o cidadão está logado
        const novaTriagem = await triagemSaudeService.create(dadosTriagem);
        res.status(201).json(novaTriagem);
    } catch (error) {
        next(error);
    }
};

export const listAll = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const getOne = (req, res) => res.status(501).json({ message: 'Não implementado' });
export const update = (req, res) => {
    res.status(501).json({ message: 'Não implementado' });
};