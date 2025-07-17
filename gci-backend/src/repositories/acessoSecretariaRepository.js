// gci-backend/src/repositories/acessoSecretariaRepository.js
import db from '../config/db.js';

const acessoSecretariaRepository = {
    async findByUsuarioId(usuarioId, client = db) {
        const query = 'SELECT secretaria_id FROM usuario_secretaria_acesso WHERE usuario_id = $1';
        const result = await client.query(query, [usuarioId]);
        return result.rows.map(row => row.secretaria_id);
    },

    async deleteByUsuarioId(usuarioId, client = db) {
        const query = 'DELETE FROM usuario_secretaria_acesso WHERE usuario_id = $1';
        await client.query(query, [usuarioId]);
    },

    async bulkInsert(usuarioId, secretariaIds, client = db) {
        if (!secretariaIds || secretariaIds.length === 0) {
            return 0;
        }
        const query = `
      INSERT INTO usuario_secretaria_acesso (usuario_id, secretaria_id)
      SELECT $1, unnest($2::integer[])
    `;
        const result = await client.query(query, [usuarioId, secretariaIds]);
        return result.rowCount;
    }
};

export default acessoSecretariaRepository;