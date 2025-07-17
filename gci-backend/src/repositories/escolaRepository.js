// gci-backend/src/repositories/escolaRepository.js
import db from '../config/db.js';
import logger from '../utils/logger.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_ESCOLA = {
    municipioId: { column: 'municipio_id', operator: '=' },
    tipo: { column: 'tipo_escola', operator: '=' },
    ativo: { column: 'ativo', operator: '=' },
    search: { column: 'nome', operator: 'ILIKE', transform: (v) => `%${v}%` }
};

const escolaRepository = {
    async create(dados) {
        const { municipio_id, nome, tipo_escola, endereco_completo, vagas_disponiveis_simulacao, ativo } = dados;
        const query = `
            INSERT INTO escolas (municipio_id, nome, tipo_escola, endereco_completo, vagas_disponiveis_simulacao, ativo) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        const result = await db.query(query, [
            municipio_id,
            nome,
            tipo_escola || null,
            endereco_completo || null,
            vagas_disponiveis_simulacao || 0,
            ativo !== undefined ? ativo : true
        ]);
        return result.rows[0];
    },

    async findAll(filtros = {}) {
        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_ESCOLA);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'nome', defaultOrder: 'ASC' });

        // CORREÇÃO: Incluir informações do município
        const query = `
            SELECT 
                e.*,
                m.nome as municipio_nome,
                m.estado as municipio_estado,
                m.codigo_ibge as municipio_codigo_ibge
            FROM escolas e
            LEFT JOIN municipios m ON e.municipio_id = m.id
            ${whereClause} ${paginationAndOrder};
        `;
        const result = await db.query(query, params);
        return result.rows;
    },

    async findAllByMunicipio(municipioId) {
        try {
            // CORREÇÃO: Incluir informações do município
            const query = `
                SELECT 
                    e.*,
                    m.nome as municipio_nome,
                    m.estado as municipio_estado,
                    m.codigo_ibge as municipio_codigo_ibge
                FROM escolas e
                LEFT JOIN municipios m ON e.municipio_id = m.id
                WHERE e.municipio_id = $1 AND e.ativo = true 
                ORDER BY e.nome ASC;
            `;
            const result = await db.query(query, [municipioId]);
            return result.rows;
        } catch (error) {
            logger.error('Erro no repositório de escolas:', error);
            throw error;
        }
    },

    async findById(id) {
        // CORREÇÃO: Incluir informações do município
        const query = `
            SELECT 
                e.*,
                m.nome as municipio_nome,
                m.estado as municipio_estado,
                m.codigo_ibge as municipio_codigo_ibge
            FROM escolas e
            LEFT JOIN municipios m ON e.municipio_id = m.id
            WHERE e.id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    async update(id, dados) {
        const { nome, tipo_escola, endereco_completo, vagas_disponiveis_simulacao, ativo } = dados;
        const query = `
            UPDATE escolas 
            SET nome = $1, tipo_escola = $2, endereco_completo = $3, 
                vagas_disponiveis_simulacao = $4, ativo = $5, updated_at = NOW() 
            WHERE id = $6 
            RETURNING *;
        `;
        const result = await db.query(query, [
            nome,
            tipo_escola || null,
            endereco_completo || null,
            vagas_disponiveis_simulacao || 0,
            ativo !== undefined ? ativo : true,
            id
        ]);
        return result.rows[0];
    },

    async remove(id) {
        const query = `DELETE FROM escolas WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
};
export default escolaRepository;