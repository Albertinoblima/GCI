// gci-backend/src/controllers/municipioController.js
import municipioService from '../services/municipioService.js';

export const getAllMunicipios = async (req, res, next) => {
    try {
        const municipios = await municipioService.findAll(req.user);
        res.status(200).json({ status: 'success', data: { municipios } });
    } catch (error) { next(error); }
};

export const createMunicipio = async (req, res, next) => {
    try {
        const novoMunicipio = await municipioService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { municipio: novoMunicipio } });
    } catch (error) {
        next(error);
    }
};

export const getMunicipioById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const municipio = await municipioService.findById(Number(id), req.user);
        res.status(200).json({ status: 'success', data: { municipio } });
    } catch (error) { next(error); }
};

export const updateMunicipio = async (req, res, next) => {
    try {
        const { id } = req.params;
        const municipioAtualizado = await municipioService.update(Number(id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { municipio: municipioAtualizado } });
    } catch (error) { next(error); }
};

export const deleteMunicipio = async (req, res, next) => {
    try {
        const { id } = req.params;
        await municipioService.remove(Number(id), req.user);
        res.status(204).send();
    } catch (error) { next(error); }
};