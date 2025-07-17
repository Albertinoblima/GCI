// gci-backend/src/controllers/matriculaController.js
import matriculaService from '../services/matriculaService.js';

export const create = async (req, res, next) => {
    try {
        const dadosMatricula = { ...req.body, cidadao_id: req.user.id };
        const novaSolicitacao = await matriculaService.create(dadosMatricula);
        res.status(201).json({ status: 'success', data: { solicitacao: novaSolicitacao } });
    } catch (error) { next(error); }
};

export const list = async (req, res, next) => {
    try {
        // O serviço usará o req.user para filtrar por município
        const resultado = await matriculaService.findAll(req.query, req.user);
        res.status(200).json({ status: 'success', data: resultado });
    } catch (error) { next(error); }
};

export const getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const solicitacao = await matriculaService.findById(Number(id), req.user);
        res.status(200).json({ status: 'success', data: { solicitacao } });
    } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        // O corpo da requisição pode conter apenas o status ou outras informações
        const solicitacao = await matriculaService.update(Number(id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { solicitacao } });
    } catch (error) { next(error); }
};