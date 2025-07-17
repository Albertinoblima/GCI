import mensagemService from '../services/mensagemService.js';
import atendimentoService from '../services/atendimentoService.js';
import AppError from '../utils/AppError.js';

export const create = async (req, res, next) => {
    try {
        const { atendimentoId } = req.params;
        const { id: agenteId, municipio_id: agenteMunicipioId } = req.user;
        const { conteudo_texto } = req.body;
        const file = req.file;
        if (!conteudo_texto && !file) throw new AppError('A mensagem deve conter texto ou um anexo.', 400);

        await atendimentoService.verificarAcessoAgente(atendimentoId, agenteId, agenteMunicipioId);
        const novaMensagem = await mensagemService.create({
            atendimento_id: parseInt(atendimentoId, 10),
            remetente_tipo: 'agente',
            agente_id: agenteId,
            conteudo_texto,
            fileInfo: file,
        });
        res.status(201).json(novaMensagem);
    } catch (error) {
        next(error);
    }
};

export const findByAtendimento = async (req, res, next) => {
    try {
        const { atendimentoId } = req.params;
        const { id: agenteId, municipio_id: agenteMunicipioId } = req.user;
        const { page, limit } = req.query;
        await atendimentoService.verificarAcessoAgente(atendimentoId, agenteId, agenteMunicipioId);
        const resultado = await mensagemService.findByAtendimentoId(parseInt(atendimentoId, 10), { page: parseInt(page || '1', 10), limit: parseInt(limit || '50', 10) });
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};