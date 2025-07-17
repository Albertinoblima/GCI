// gci-backend/src/controllers/cidadaoController.js

import cidadaoService from '../services/cidadaoService.js';
import AppError from '../utils/AppError.js';

export const getAllCidadaos = async (req, res, next) => {
    try {
        const { role, municipio_id } = req.user;
        let filtros = { ...req.query };

        // Para usuários não admin_sistema, aplicar filtro automático por município
        if (role !== 'admin_sistema' && municipio_id) {
            filtros.municipioId = municipio_id;
        }

        const resultado = await cidadaoService.findAll(filtros);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const getCidadaoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, municipio_id } = req.user;

        const cidadao = await cidadaoService.findById(id);

        // CORREÇÃO CRÍTICA: Validar se cidadão pertence ao município do usuário
        if (role !== 'admin_sistema' && cidadao.municipio_id !== municipio_id) {
            throw new AppError('Acesso negado. Cidadão pertence a outro município.', 403);
        }

        res.status(200).json(cidadao);
    } catch (error) {
        next(error);
    }
};

export const updateCidadao = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cidadao = await cidadaoService.update(id, req.body);
        res.status(200).json(cidadao);
    } catch (error) {
        next(error);
    }
};