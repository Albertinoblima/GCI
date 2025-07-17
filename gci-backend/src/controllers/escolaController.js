// gci-backend/src/controllers/escolaController.js
import escolaService from '../services/escolaService.js';

export const create = async (req, res, next) => {
    try {
        const novaEscola = await escolaService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { escola: novaEscola } });
    } catch (error) { next(error); }
};

export const getAll = async (req, res, next) => {
    try {
        const escolas = await escolaService.findAll(req.query, req.user);
        res.status(200).json({ status: 'success', data: { escolas } });
    } catch (error) { next(error); }
};

export const getAllByMunicipio = async (req, res, next) => {
    try {
        console.log('[EDUCAÇÃO] Controller escolas - usuario:', req.user.email, req.user.role);
        const escolas = await escolaService.findByMunicipio(req.user);
        res.status(200).json({ status: 'success', data: { escolas } });
    } catch (error) {
        console.error('Erro no controller escolas:', error);
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const escola = await escolaService.findById(Number(id), req.user);
        res.status(200).json({ status: 'success', data: { escola } });
    } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const escola = await escolaService.update(Number(id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { escola } });
    } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await escolaService.remove(Number(id), req.user);
        res.status(204).send();
    } catch (error) { next(error); }
};