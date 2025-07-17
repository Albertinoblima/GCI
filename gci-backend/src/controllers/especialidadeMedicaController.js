// gci-backend/src/controllers/especialidadeMedicaController.js
import especialidadeMedicaService from '../services/especialidadeMedicaService.js';

export const create = async (req, res, next) => {
    try {
        const novaEspecialidade = await especialidadeMedicaService.create(req.body);
        res.status(201).json({ status: 'success', data: { especialidade: novaEspecialidade } });
    } catch (error) { next(error); }
};

export const listAll = async (req, res, next) => {
    try {
        const especialidades = await especialidadeMedicaService.findAll();
        res.status(200).json({ status: 'success', data: { especialidades } });
    } catch (error) { next(error); }
};

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const especialidade = await especialidadeMedicaService.findById(parseInt(id, 10));
        res.status(200).json({ status: 'success', data: { especialidade } });
    } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const especialidade = await especialidadeMedicaService.update(parseInt(id, 10), req.body);
        res.status(200).json({ status: 'success', data: { especialidade } });
    } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await especialidadeMedicaService.remove(parseInt(id, 10));
        res.status(204).send();
    } catch (error) { next(error); }
};
