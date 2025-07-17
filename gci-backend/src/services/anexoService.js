// gci-backend/src/services/anexoService.js
import fs from 'fs/promises';
import path from 'path';
import anexoRepository from '../repositories/anexoRepository.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const anexoService = {
    /**
     * Orquestra a criação de um anexo, incluindo o registro no banco.
     * @param {object} fileInfo - Objeto de arquivo do multer.
     * @param {string} referencia_tipo - Tipo da entidade de referência.
     * @param {number} referencia_id - ID da entidade de referência.
     * @param {object} [dbClient] - Cliente de banco de dados opcional para transações.
     * @returns {Promise<object>} O registro do anexo criado.
     */
    async create(fileInfo, referencia_tipo, referencia_id, dbClient) {
        const { originalname, filename, mimetype, size } = fileInfo;
        const anexoData = {
            referencia_tipo,
            referencia_id,
            nome_arquivo_original: originalname,
            nome_arquivo_armazenado: filename,
            mimetype,
            tamanho_bytes: size,
        };
        try {
            const novoAnexo = await anexoRepository.create(anexoData, dbClient);
            logger.info(`Anexo registrado no DB: ${filename} para ${referencia_tipo}:${referencia_id}`);
            return novoAnexo;
        } catch (err) {
            logger.error(`Falha ao registrar anexo no DB: ${filename}`, { error: err.message });
            throw new AppError('Erro ao salvar informações do anexo.', 500);
        }
    },

    /**
     * Busca um anexo e lança um erro se não for encontrado.
     * @param {number} id - O ID do anexo.
     * @returns {Promise<object>} O registro do anexo.
     */
    async findById(id) {
        const anexo = await anexoRepository.findById(id);
        if (!anexo) {
            throw new AppError('Anexo não encontrado.', 404);
        }
        return anexo;
    },

    /**
     * Deleta um anexo do banco de dados e do sistema de arquivos.
     * @param {number} id - O ID do anexo a ser deletado.
     * @returns {Promise<{message: string}>} Mensagem de sucesso.
     */
    async remove(id) {
        // A lógica de negócio é garantir que o anexo exista antes de tentar deletar.
        const anexo = await this.findById(id);

        // Deleta o registro do banco de dados
        await anexoRepository.remove(id);

        // Deleta o arquivo físico
        const filePath = path.join(UPLOADS_DIR, anexo.nome_arquivo_armazenado);
        try {
            await fs.unlink(filePath);
            logger.info(`Arquivo físico deletado: ${filePath}`);
        } catch (err) {
            logger.error(`Falha ao deletar arquivo físico, mas registro do DB foi removido: ${filePath}`, { error: err.message });
        }

        return { message: 'Anexo deletado com sucesso.' };
    },
};

export default anexoService;