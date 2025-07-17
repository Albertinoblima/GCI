// gci-backend/src/controllers/profissionalSaudeController.js
import profissionalSaudeService from '../services/profissionalSaudeService.js';

export const create = async (req, res, next) => {
    try {
        const novoProfissional = await profissionalSaudeService.create(req.body, req.user);
        res.status(201).json({ status: 'success', data: { profissional: novoProfissional } });
    } catch (error) { next(error); }
};

export const listByMunicipio = async (req, res, next) => {
    try {
        const { municipio_id } = req.query;
        let filtroMunicipio;

        // CORREÇÃO CRÍTICA: Admin sistema deve especificar município obrigatoriamente
        if (req.user.role === 'admin_sistema') {
            if (!municipio_id) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Admin sistema deve especificar o município através do parâmetro municipio_id'
                });
            }
            filtroMunicipio = parseInt(municipio_id);
        } else {
            // Outros usuários sempre veem apenas do seu município
            if (!req.user.municipio_id) {
                return res.status(403).json({
                    status: 'fail',
                    message: 'Usuário deve estar associado a um município válido'
                });
            }
            filtroMunicipio = req.user.municipio_id;
        }

        const profissionais = await profissionalSaudeService.findByMunicipioComFiltro(req.user, filtroMunicipio);

        res.status(200).json({ status: 'success', data: { profissionais } });
    } catch (error) {
        console.error('❌ Erro no controller listByMunicipio:', error);
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const profissional = await profissionalSaudeService.update(Number(id), req.body, req.user);
        res.status(200).json({ status: 'success', data: { profissional } });
    } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        await profissionalSaudeService.remove(Number(id), req.user);
        res.status(204).send();
    } catch (error) { next(error); }
};

export const createLink = async (req, res, next) => {
    try {
        const { profissionalId } = req.params;
        const dadosLink = { ...req.body, profissional_id: parseInt(profissionalId, 10) };
        const novoLink = await profissionalSaudeService.createLink(dadosLink, req.user);
        res.status(201).json({ status: 'success', data: { link: novoLink } });
    } catch (error) { next(error); }
};

export const getLinks = async (req, res, next) => {
    try {
        const { profissionalId } = req.params;
        const links = await profissionalSaudeService.findLinksByProfissional(parseInt(profissionalId, 10), req.user);

        // Se não há vínculos específicos, buscar todas as unidades e especialidades do município
        let unidades = [];
        let especialidades = [];

        if (links && links.length > 0) {
            // Transformar os dados para o formato esperado pelo frontend, filtrando valores válidos
            unidades = [...new Map(
                links
                    .filter(link => link.unidade_id && link.unidade_nome)
                    .map(link => [link.unidade_id, {
                        id: link.unidade_id,
                        nome: link.unidade_nome
                    }])
            ).values()];

            especialidades = [...new Map(
                links
                    .filter(link => link.especialidade_id && link.nome_especialidade)
                    .map(link => [link.especialidade_id, {
                        id: link.especialidade_id,
                        nome_especialidade: link.nome_especialidade
                    }])
            ).values()];
        } else {
            // Fallback: buscar todas as unidades e especialidades disponíveis
            const fallbackData = await profissionalSaudeService.getAllUnidadesEspecialidades(req.user);
            unidades = fallbackData.unidades || [];
            especialidades = fallbackData.especialidades || [];
        }

        res.status(200).json({
            status: 'success',
            data: {
                links,
                unidades,
                especialidades
            }
        });
    } catch (error) { next(error); }
};