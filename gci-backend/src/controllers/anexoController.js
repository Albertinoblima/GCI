// gci-backend/src/controllers/anexoController.js

import anexoService from '../services/anexoService.js';
import path from 'path';
import AppError from '../utils/AppError.js';

// O diretório de uploads precisa ser consistente com o do uploadMiddleware.
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

/**
 * Lida com o download de um anexo específico.
 * Encontra o anexo no banco de dados e envia o arquivo físico para o cliente.
 */
export const downloadAnexo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const anexo = await anexoService.findById(parseInt(id, 10));

        // TODO: Implementar uma verificação de permissão robusta aqui.
        // O usuário logado (req.user) tem permissão para ver a 'referencia'
        // à qual este anexo pertence? (ex: o atendimento, a demanda, etc.)

        const filePath = path.join(UPLOADS_DIR, anexo.nome_arquivo_armazenado);

        // O método res.download() do Express é ideal para isso.
        // Ele define os headers corretos para forçar o download no navegador
        // e usa o nome original do arquivo.
        res.download(filePath, anexo.nome_arquivo_original, (err) => {
            if (err) {
                // Este erro geralmente acontece se o arquivo não existe no disco,
                // mas ainda existe no banco de dados (estado inconsistente).
                if (err.code === 'ENOENT') {
                    return next(new AppError('Arquivo não encontrado no servidor.', 404));
                }
                // Outros erros de stream/leitura.
                return next(err);
            }
        });
    } catch (error) {
        // Erros do anexoService.findById (ex: anexo não encontrado no DB)
        // serão capturados aqui.
        next(error);
    }
};

/**
 * Lida com a exclusão de um anexo.
 * Invoca o serviço que remove tanto o registro do DB quanto o arquivo físico.
 */
export const deleteAnexo = async (req, res, next) => {
    try {
        const { id } = req.params;

        // TODO: Implementar verificação de permissão.
        // Apenas o usuário que enviou o anexo, ou um administrador, deveria poder deletar.

        await anexoService.remove(parseInt(id, 10));

        // Responde com 204 No Content, que é o padrão para DELETE bem-sucedido.
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

/**
 * Função placeholder. O upload é tratado por outros controllers
 * que recebem o anexo junto com a entidade principal (ex: uma mensagem).
 */
export const uploadAnexo = (req, res, next) => {
    return next(new AppError('Rota de upload direto não utilizada. Envie o anexo junto com a entidade principal (ex: /mensagens).', 405));
};

/**
 * Função placeholder. A listagem de anexos deve ser feita
 * no contexto de sua entidade de referência.
 */
export const getAnexosByReferencia = (req, res, next) => {
    return next(new AppError('Rota de listagem genérica não implementada. Liste os anexos através da entidade de referência (ex: GET /atendimentos/:id/mensagens).', 405));
};