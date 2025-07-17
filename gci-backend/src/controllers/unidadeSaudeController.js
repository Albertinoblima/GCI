// gci-backend/src/controllers/unidadeSaudeController.js
import unidadeSaudeService from '../services/unidadeSaudeService.js';

export const create = async (req, res, next) => {
    try {
        // O municipio_id será pego do usuário logado (se for admin_municipio) ou do corpo (se for admin_sistema)
        const novaUnidade = await unidadeSaudeService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { unidade: novaUnidade } });
    } catch (error) { next(error); }
};

// Buscar unidade específica por ID
export const getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const unidade = await unidadeSaudeService.findById(Number(id), req.user);
        res.status(200).json({ status: 'success', data: { unidade } });
    } catch (error) { next(error); }
};

// Lista unidades do município do usuário logado ou todas se for admin_sistema
export const listAll = async (req, res, next) => {
    try {
        // Para admin_sistema, permitir filtro por municipio_id via query string ou retornar todas
        const { municipio_id } = req.query;

        let filtroMunicipio;
        if (req.user.role === 'admin_sistema') {
            // Admin sistema pode filtrar por município específico ou ver todas
            filtroMunicipio = municipio_id ? parseInt(municipio_id) : null;
        } else {
            // Outros usuários sempre veem apenas do seu município
            filtroMunicipio = req.user.municipio_id;
        }

        const unidades = await unidadeSaudeService.findByMunicipio(filtroMunicipio, req.user);
        res.status(200).json({ status: 'success', data: { unidades } });
    } catch (error) { next(error); }
};

export const listByMunicipio = async (req, res, next) => {
    try {
        const { municipioId } = req.params;
        const unidades = await unidadeSaudeService.findByMunicipio(Number(municipioId), req.user);
        res.status(200).json({ status: 'success', data: { unidades } });
    } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const unidade = await unidadeSaudeService.update(Number(id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { unidade } });
    } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await unidadeSaudeService.remove(Number(id), req.user);
        res.status(204).send();
    } catch (error) { next(error); }
};