// gci-backend/src/repositories/anexoRepository.js
import db from '../config/db.js';

const anexoRepository = {
    /**
     * Cria um registro de anexo no banco de dados.
     * @param {object} anexoData - Dados do anexo.
     * @param {object} [client=db] - Cliente de banco de dados opcional para transações.
     * @returns {Promise<object>} O registro do anexo criado.
     */
    async create(anexoData, client = db) {
        const { referencia_tipo, referencia_id, nome_arquivo_original, nome_arquivo_armazenado, mimetype, tamanho_bytes } = anexoData;
        const query = `
      INSERT INTO anexos (referencia_tipo, referencia_id, nome_arquivo_original, nome_arquivo_armazenado, mimetype, tamanho_bytes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
        const result = await client.query(query, [referencia_tipo, referencia_id, nome_arquivo_original, nome_arquivo_armazenado, mimetype, tamanho_bytes]);
        return result.rows[0];
    },

    /**
     * Busca um anexo pelo seu ID.
     * @param {number} id - O ID do anexo.
     * @param {object} [client=db] - Cliente de banco de dados opcional para transações.
     * @returns {Promise<object|undefined>} O registro do anexo.
     */
    async findById(id, client = db) {
        const result = await client.query('SELECT * FROM anexos WHERE id = $1', [id]);
        return result.rows[0];
    },

    /**
     * Deleta um anexo do banco de dados.
     * @param {number} id - O ID do anexo a ser deletado.
     * @param {object} [client=db] - Cliente de banco de dados opcional para transações.
     */
    async remove(id, client = db) {
        await client.query('DELETE FROM anexos WHERE id = $1', [id]);
    }
};

export default anexoRepository;