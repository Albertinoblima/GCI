// gci-backend/src/repositories/municipioRepository.js
import db from '../config/db.js';

const municipioRepository = {
    async create(dadosMunicipio, client = db) {
        try {
            // Extrair com valores padrão para evitar undefined

            const nome = dadosMunicipio.nome;
            const sigla_protocolo = dadosMunicipio.sigla_protocolo || null;
            const config_meta_api = dadosMunicipio.config_meta_api || null;
            const ativo = dadosMunicipio.ativo !== undefined ? dadosMunicipio.ativo : true;
            const estado = dadosMunicipio.estado || null;
            const codigo_ibge = dadosMunicipio.codigo_ibge || null;

            if (!nome) {
                throw new Error('Campo nome é obrigatório');
            }
            if (!estado) {
                throw new Error('Campo estado é obrigatório');
            }
            if (!codigo_ibge) {
                throw new Error('Campo codigo_ibge é obrigatório');
            }

            const query = `
                INSERT INTO municipios (nome, sigla_protocolo, config_meta_api, ativo, estado, codigo_ibge)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
            `;

            const result = await client.query(query, [nome, sigla_protocolo, config_meta_api, ativo, estado, codigo_ibge]);
            return result.rows[0];

        } catch (error) {
            throw error;
        }
    },

    async findAll(client = db) {
        const query = 'SELECT id, nome, sigla_protocolo, ativo FROM municipios ORDER BY nome ASC';
        const result = await client.query(query);
        return result.rows;
    },

    async findById(id, client = db) {
        const query = 'SELECT * FROM municipios WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },

    async findByMetaIdentifier(identifier, canal, client = db) {
        let field;
        // Determina qual campo JSONB procurar com base no canal
        switch (canal) {
            case 'whatsapp':
                field = 'whatsapp_phone_number_id';
                break;
            case 'messenger':
                field = 'messenger_page_id';
                break;
            case 'instagram':
                field = 'instagram_page_id';
                break;
            default:
                return null;
        }
        const query = `SELECT * FROM municipios WHERE config_meta_api->>$1 = $2 AND ativo = true;`;
        const result = await client.query(query, [field, identifier]);
        return result.rows[0];
    },

    async update(id, dadosUpdate, client = db) {
        const { nome, sigla_protocolo, config_meta_api, ativo, estado, codigo_ibge } = dadosUpdate;
        const query = `
            UPDATE municipios
            SET nome = $1, sigla_protocolo = $2, config_meta_api = $3, ativo = $4, estado = $5, codigo_ibge = $6, updated_at = NOW()
            WHERE id = $7 RETURNING *;
        `;
        const result = await client.query(query, [nome, sigla_protocolo, config_meta_api, ativo, estado, codigo_ibge, id]);
        return result.rows[0];
    },

    async remove(id, client = db) {
        const result = await client.query('DELETE FROM municipios WHERE id = $1 RETURNING *;', [id]);
        return result.rowCount;
    }
};

export default municipioRepository;