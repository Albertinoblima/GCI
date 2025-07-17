// gci-backend/src/controllers/secretariaController.js
import secretariaService from '../services/secretariaService.js';

export const create = async (req, res, next) => {
    try {
        const { municipioId } = req.params;
        const dadosSecretaria = { ...req.body, municipio_id: Number(municipioId) };
        const novaSecretaria = await secretariaService.create(dadosSecretaria, req.user);
        res.status(201).json({ status: 'success', data: { secretaria: novaSecretaria } });
    } catch (error) {
        next(error);
    }
};

export const getAllByMunicipio = async (req, res, next) => {
    try {
        const { municipioId } = req.params;
        const secretarias = await secretariaService.findByMunicipioId(Number(municipioId), req.user);
        res.status(200).json({ status: 'success', data: { secretarias } });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const { secretariaId } = req.params;
        const secretaria = await secretariaService.findById(Number(secretariaId), req.user);
        res.status(200).json({ status: 'success', data: { secretaria } });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { secretariaId } = req.params;
        const secretariaAtualizada = await secretariaService.update(Number(secretariaId), req.body, req.user);
        res.status(200).json({ status: 'success', data: { secretaria: secretariaAtualizada } });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { secretariaId } = req.params;
        await secretariaService.remove(Number(secretariaId), req.user);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};