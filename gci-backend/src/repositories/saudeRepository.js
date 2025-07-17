// gci-backend/src/repositories/saudeRepository.js
import db from '../config/db.js';

const saudeRepository = {
    // --- Especialidade Médica ---
    async createEspecialidade(dados, client = db) {
        const query = 'INSERT INTO especialidades_medicas (nome_especialidade) VALUES ($1) RETURNING *;';
        const result = await client.query(query, [dados.nome_especialidade]);
        return result.rows[0];
    },
    async findAllEspecialidades(client = db) {
        const query = 'SELECT * FROM especialidades_medicas ORDER BY nome_especialidade ASC';
        const result = await client.query(query);
        return result.rows;
    },
    async findEspecialidadeById(id, client = db) {
        const query = 'SELECT * FROM especialidades_medicas WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },
    async updateEspecialidade(id, dados, client = db) {
        const query = 'UPDATE especialidades_medicas SET nome_especialidade = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
        const result = await client.query(query, [dados.nome_especialidade, id]);
        return result.rows[0];
    },
    async removeEspecialidade(id, client = db) {
        const query = 'DELETE FROM especialidades_medicas WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },

    // --- Profissional de Saúde ---
    async createProfissional(dados, client = db) {
        const { municipio_id, nome_completo, registro_conselho, usuario_id, email_google_calendar, ativo } = dados;
        const query = `
            INSERT INTO profissionais_saude 
            (municipio_id, nome_completo, registro_conselho, usuario_id, email_google_calendar, ativo) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const result = await client.query(query, [
            municipio_id,
            nome_completo,
            registro_conselho,
            usuario_id || null,
            email_google_calendar || null,
            ativo !== undefined ? ativo : true
        ]);
        return result.rows[0];
    },

    async findProfissionaisByMunicipio(municipioId, client = db) {
        let query, params;

        if (municipioId === null || municipioId === undefined) {
            // Admin sistema sem município específico - retorna todos
            query = `
                SELECT p.*, m.nome as municipio_nome 
                FROM profissionais_saude p
                LEFT JOIN municipios m ON p.municipio_id = m.id
                ORDER BY m.nome ASC, p.nome_completo ASC
            `;
            params = [];
        } else {
            // Filtrar por município específico
            query = `
                SELECT p.*, m.nome as municipio_nome 
                FROM profissionais_saude p
                LEFT JOIN municipios m ON p.municipio_id = m.id
                WHERE p.municipio_id = $1 
                ORDER BY p.nome_completo ASC
            `;
            params = [municipioId];
        }

        const result = await client.query(query, params);
        return result.rows;
    },

    async findProfissionalById(id, client = db) {
        const query = `
            SELECT p.*, m.nome as municipio_nome 
            FROM profissionais_saude p
            LEFT JOIN municipios m ON p.municipio_id = m.id
            WHERE p.id = $1
        `;
        const result = await client.query(query, [id]);
        return result.rows[0];
    },

    async updateProfissional(id, dados, client = db) {
        const { nome_completo, registro_conselho, usuario_id, email_google_calendar, ativo } = dados;
        const query = `
            UPDATE profissionais_saude 
            SET nome_completo = $1, registro_conselho = $2, usuario_id = $3, 
                email_google_calendar = $4, ativo = $5, updated_at = NOW() 
            WHERE id = $6 
            RETURNING *;
        `;
        const result = await client.query(query, [
            nome_completo,
            registro_conselho,
            usuario_id || null,
            email_google_calendar || null,
            ativo,
            id
        ]);
        return result.rows[0];
    },

    async removeProfissional(id, client = db) {
        // Primeiro remover vínculos relacionados
        await client.query('DELETE FROM profissional_especialidade_unidade_link WHERE profissional_id = $1', [id]);
        // Depois remover o profissional
        const query = 'DELETE FROM profissionais_saude WHERE id = $1 RETURNING *;';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },

    async createProfissionalLink(dados, client = db) {
        const { profissional_id, especialidade_id, unidade_id } = dados;
        const query = 'INSERT INTO profissional_especialidade_unidade_link (profissional_id, especialidade_id, unidade_id) VALUES ($1, $2, $3) RETURNING *;';
        const result = await client.query(query, [profissional_id, especialidade_id, unidade_id]);
        return result.rows[0];
    },

    async findLinksByProfissional(profissionalId, client = db) {
        const query = `
            SELECT 
                pel.*,
                e.nome_especialidade,
                u.nome as unidade_nome
            FROM profissional_especialidade_unidade_link pel
            LEFT JOIN especialidades_medicas e ON pel.especialidade_id = e.id
            LEFT JOIN unidades_saude u ON pel.unidade_id = u.id
            WHERE pel.profissional_id = $1
            ORDER BY e.nome_especialidade ASC, u.nome ASC
        `;
        const result = await client.query(query, [profissionalId]);
        return result.rows;
    },

    // --- Tipo de Exame ---
    async createTipoExame(dados, client = db) {
        const { municipio_id, nome_exame } = dados;
        const query = 'INSERT INTO tipos_exames_saude (municipio_id, nome_exame) VALUES ($1, $2) RETURNING *;';
        const result = await client.query(query, [municipio_id, nome_exame]);
        return result.rows[0];
    },

    // --- Triagem ---
    async createTriagem(dados, client = db) {
        const { cidadao_id, municipio_id, dados_coletados, status_triagem } = dados;
        const query = 'INSERT INTO triagens_saude (cidadao_id, municipio_id, dados_coletados, status_triagem) VALUES ($1, $2, $3, $4) RETURNING *;';
        const result = await client.query(query, [cidadao_id, municipio_id, dados_coletados, status_triagem]);
        return result.rows[0];
    },

    // --- Unidade de Saúde ---
    async createUnidade(dados, client = db) {
        const { municipio_id, nome, endereco_completo, telefone, tipo_unidade, ativo } = dados;
        const query = `
            INSERT INTO unidades_saude (municipio_id, nome, endereco_completo, telefone, tipo_unidade, ativo) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const result = await client.query(query, [municipio_id, nome, endereco_completo, telefone, tipo_unidade, ativo]);
        return result.rows[0];
    },
    async findAllUnidades(client = db) {
        const query = `
            SELECT u.*, m.nome as municipio_nome 
            FROM unidades_saude u
            LEFT JOIN municipios m ON u.municipio_id = m.id
            ORDER BY m.nome ASC, u.nome ASC
        `;
        const result = await client.query(query);
        return result.rows;
    },
    async findUnidadesByMunicipio(municipioId, client = db) {
        const query = 'SELECT * FROM unidades_saude WHERE municipio_id = $1 ORDER BY nome ASC';
        const result = await client.query(query, [municipioId]);
        return result.rows;
    },
    async findUnidadeById(id, client = db) {
        const query = 'SELECT * FROM unidades_saude WHERE id = $1';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },
    async updateUnidade(id, dados, client = db) {
        const { nome, endereco_completo, telefone, tipo_unidade, ativo } = dados;
        const query = `
            UPDATE unidades_saude 
            SET nome = $1, endereco_completo = $2, telefone = $3, tipo_unidade = $4, ativo = $5, updated_at = NOW() 
            WHERE id = $6 
            RETURNING *;
        `;
        const result = await client.query(query, [nome, endereco_completo, telefone, tipo_unidade, ativo, id]);
        return result.rows[0];
    },
    async removeUnidade(id, client = db) {
        const query = 'DELETE FROM unidades_saude WHERE id = $1 RETURNING *;';
        const result = await client.query(query, [id]);
        return result.rows[0];
    },

    // --- Municípios ---
    async getAllMunicipios(client = db) {
        const query = 'SELECT * FROM municipios ORDER BY nome ASC';
        const result = await client.query(query);
        return result.rows;
    }
};

export default saudeRepository;