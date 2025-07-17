// gci-backend/src/controllers/servicoController.js
import servicoService from '../services/servicoService.js';

export const create = async (req, res, next) => {
    try {
        const { secretariaId } = req.params;
        const dadosServico = { ...req.body, secretaria_id: Number(secretariaId) };
        const novoServico = await servicoService.create(dadosServico, req.user);
        res.status(201).json({ status: 'success', data: { servico: novoServico } });
    } catch (error) {
        next(error);
    }
};

export const getAllBySecretaria = async (req, res, next) => {
    try {
        const { secretariaId } = req.params;
        const servicos = await servicoService.findBySecretariaId(Number(secretariaId), req.user);
        res.status(200).json({ status: 'success', data: { servicos } });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { servicoId } = req.params;
        const servicoAtualizado = await servicoService.update(Number(servicoId), req.body, req.user);
        res.status(200).json({ status: 'success', data: { servico: servicoAtualizado } });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const { servicoId } = req.params;
        await servicoService.remove(Number(servicoId), req.user);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};