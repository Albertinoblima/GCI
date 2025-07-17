// gci-backend/src/repositories/cidadaoRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_CIDADAO = {
    canal: { column: 'c.canal_comunicacao', operator: '=' },
    municipioId: { column: 'c.ultimo_municipio_id_interacao', operator: '=' }
};

const cidadaoRepository = {
    async create(dadosCidadao, client = db) {
        const {
            canal_comunicacao,
            id_canal_origem,
            nome_perfil_canal,
            telefone_principal,
            email_principal,
            ultimo_municipio_id_interacao
        } = dadosCidadao;

        const query = `
            INSERT INTO cidadaos (
                canal_comunicacao, 
                id_canal_origem, 
                nome_perfil_canal, 
                telefone_principal, 
                email_principal,
                ultimo_municipio_id_interacao,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const params = [
            canal_comunicacao,
            id_canal_origem,
            nome_perfil_canal,
            telefone_principal,
            email_principal,
            ultimo_municipio_id_interacao
        ];

        const result = await client.query(query, params);
        return result.rows[0];
    },

    async findByCanal(canal, id, client = db) {
        const query = `
            SELECT * FROM cidadaos 
            WHERE canal_comunicacao = $1 AND id_canal_origem = $2
        `;
        const result = await client.query(query, [canal, id]);
        return result.rows[0] || null;
    },

    async findById(id, client = db) {
        const query = `
            SELECT 
                c.id,
                c.canal_comunicacao,
                c.id_canal_origem,
                c.nome_perfil_canal,
                c.telefone_principal,
                c.email_principal,
                c.ultimo_municipio_id_interacao,
                c.created_at,
                c.updated_at,
                m.nome as ultimo_municipio_interacao_nome,
                m.estado as ultimo_municipio_interacao_estado,
                m.codigo_ibge as ultimo_municipio_interacao_codigo_ibge
            FROM cidadaos c
            LEFT JOIN municipios m ON c.ultimo_municipio_id_interacao = m.id
            WHERE c.id = $1
        `;
        const result = await client.query(query, [id]);
        return result.rows[0] || null;
    }, async findAll(filtros = {}) {
        try {
            const { search, ...outrosFiltros } = filtros;

            const { whereClause, params } = buildWhereClause(outrosFiltros, MAPEAMENTO_FILTROS_CIDADAO);

            let searchCondition = '';
            if (search) {
                const searchIndex = params.length + 1;
                searchCondition = whereClause
                    ? ` AND (c.nome_perfil_canal ILIKE $${searchIndex} OR c.id_canal_origem ILIKE $${searchIndex} OR c.telefone_principal ILIKE $${searchIndex} OR c.email_principal ILIKE $${searchIndex})`
                    : ` WHERE (c.nome_perfil_canal ILIKE $${searchIndex} OR c.id_canal_origem ILIKE $${searchIndex} OR c.telefone_principal ILIKE $${searchIndex} OR c.email_principal ILIKE $${searchIndex})`;
                params.push(`%${search}%`);
            }

            const query = `
                SELECT 
                    c.id,
                    c.canal_comunicacao,
                    c.id_canal_origem,
                    c.nome_perfil_canal,
                    c.telefone_principal,
                    c.email_principal,
                    c.ultimo_municipio_id_interacao,
                    c.created_at,
                    c.updated_at,
                    m.nome as ultimo_municipio_interacao_nome,
                    m.estado as ultimo_municipio_interacao_estado,
                    m.codigo_ibge as ultimo_municipio_interacao_codigo_ibge
                FROM cidadaos c
                LEFT JOIN municipios m ON c.ultimo_municipio_id_interacao = m.id
                ${whereClause}${searchCondition}
                ORDER BY c.updated_at DESC
                LIMIT ${parseInt(filtros.limit || '15', 10)} OFFSET ${(parseInt(filtros.page || '1', 10) - 1) * parseInt(filtros.limit || '15', 10)}
            `;

            const countQuery = `
                SELECT COUNT(c.id) as total
                FROM cidadaos c
                LEFT JOIN municipios m ON c.ultimo_municipio_id_interacao = m.id
                ${whereClause}${searchCondition}
            `;

            const [dataResult, countResult] = await Promise.all([
                db.query(query, params),
                db.query(countQuery, params)
            ]);

            const total = parseInt(countResult.rows[0].total, 10);
            const limit = parseInt(filtros.limit || '15', 10);
            const page = parseInt(filtros.page || '1', 10);

            return {
                data: dataResult.rows,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            };
        } catch (error) {
            // Em caso de erro (tabela não existe, etc), retornar dados vazios
            console.error('Erro ao buscar cidadãos:', error.message);
            return {
                data: [],
                total: 0,
                pages: 0,
                currentPage: 1
            };
        }
    }
};
export default cidadaoRepository;