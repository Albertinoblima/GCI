import acessoSecretariaService from '../services/acessoSecretariaService.js';

export const getAcessos = async (req, res, next) => {
    try {
        const { usuarioId } = req.params;
        const secretariaIds = await acessoSecretariaService.findByUsuarioId(Number(usuarioId));
        res.status(200).json({ status: 'success', data: { usuarioId: Number(usuarioId), secretariaIds } });
    } catch (error) {
        next(error);
    }
};

export const setAcessos = async (req, res, next) => {
    try {
        const { usuarioId } = req.params;
        const { secretariaIds } = req.body;
        if (!Array.isArray(secretariaIds)) {
            return res.status(400).json({ status: 'fail', message: 'O campo "secretariaIds" é obrigatório e deve ser um array.' });
        }

        // CORREÇÃO CRÍTICA: Passar usuário logado para validação de permissões
        const result = await acessoSecretariaService.setAcessos(Number(usuarioId), secretariaIds, req.user);
        res.status(200).json({ status: 'success', message: result.message, data: { usuarioId: Number(usuarioId), count: result.count } });
    } catch (error) {
        next(error);
    }
};