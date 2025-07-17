// gci-backend/src/repositories/usuarioRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const FILTRO_MAPEAMENTO = {
    municipioId: { column: 'u.municipio_id', operator: '=' },
    role: { column: 'u.role', operator: '=' },
    ativo: { column: 'u.ativo', operator: '=' },
    search: { column: 'u.nome_completo', operator: 'ILIKE', transform: (value) => `%${value}%` }
};

const usuarioRepository = {
    async findAll(filtros = {}) {
        let { whereClause, params } = buildWhereClause(filtros, FILTRO_MAPEAMENTO);

        // CORREÇÃO CRÍTICA: Filtros adicionais de segurança
        let paramIndex = params.length + 1;


        // Isolamento por município: só admin_sistema pode ver todos
        if (filtros.forceMunicipioId && filtros.forceMunicipioId !== 'ALL') {
            whereClause = whereClause
                ? `${whereClause} AND u.municipio_id = $${paramIndex++}`
                : `WHERE u.municipio_id = $${paramIndex++}`;
            params.push(filtros.forceMunicipioId);
        }

        // Excluir admin_sistema para usuários não-admin
        if (filtros.excludeRoles && Array.isArray(filtros.excludeRoles)) {
            const exclusion = filtros.excludeRoles.map(() => `$${paramIndex++}`).join(', ');
            whereClause = whereClause
                ? `${whereClause} AND u.role NOT IN (${exclusion})`
                : `WHERE u.role NOT IN (${exclusion})`;
            params.push(...filtros.excludeRoles);
        }

        // Excluir outros admin_municipio (apenas para admin_municipio)
        if (filtros.excludeOtherAdminMunicipio && filtros.currentUserId) {
            whereClause = whereClause
                ? `${whereClause} AND NOT (u.role = 'admin_municipio' AND u.id != $${paramIndex++})`
                : `WHERE NOT (u.role = 'admin_municipio' AND u.id != $${paramIndex++})`;
            params.push(filtros.currentUserId);
        }

        const baseQuery = `FROM usuarios u LEFT JOIN municipios m ON u.municipio_id = m.id ${whereClause}`;

        const countQuery = `SELECT COUNT(u.id) ${baseQuery}`;
        const countResult = await db.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count, 10);

        const paginationClause = buildPaginationAndOrder(filtros, { defaultSortBy: 'nome_completo', defaultOrder: 'ASC' });

        // CORREÇÃO: Incluir informações completas do município para admin_sistema
        const dataQuery = `SELECT 
            u.id, 
            u.nome_completo, 
            u.email, 
            u.role, 
            u.ativo, 
            u.municipio_id,
            m.nome as municipio_nome,
            m.estado as municipio_estado,
            m.codigo_ibge as municipio_codigo_ibge
        ${baseQuery} ${paginationClause}`;
        const dataResult = await db.query(dataQuery, params);

        return {
            usuarios: dataResult.rows,
            paginacao: {
                totalItems,
                currentPage: Number(filtros.page) || 1,
                pageSize: Number(filtros.limit) || 15,
                totalPages: Math.ceil(totalItems / (Number(filtros.limit) || 15)),
            }
        };
    },

    /**
     * CORREÇÃO: Implementação da função findById com informações completas do município.
     * Garante que o ID seja tratado como um número para corresponder ao schema do DB.
     */
    async findById(id) {
        const query = `
            SELECT 
                u.*, 
                m.nome as municipio_nome,
                m.estado as municipio_estado,
                m.codigo_ibge as municipio_codigo_ibge
            FROM usuarios u 
            LEFT JOIN municipios m ON u.municipio_id = m.id 
            WHERE u.id = $1
        `;
        // Converte o ID para um número antes de executar a query.
        const result = await db.query(query, [Number(id)]);
        return result.rows[0];
    },

    /**
     * CORREÇÃO: Implementação da função findByEmail com normalização.
     */
    async findByEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)';
        const result = await db.query(query, [email]);
        return result.rows[0];
    },

    /**
     * CORREÇÃO: Implementação da função create.
     */
    async create(dadosUsuario) {
        const { nome_completo, email, senha_hash, role, municipio_id, ativo } = dadosUsuario;
        const query = `
            INSERT INTO usuarios (nome_completo, email, senha_hash, role, municipio_id, ativo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome_completo, email, role, municipio_id, ativo;
        `;
        const result = await db.query(query, [nome_completo, email.toLowerCase(), senha_hash, role, municipio_id, ativo]);
        return result.rows[0];
    },

    /**
     * CORREÇÃO: Implementação da função update.
     */
    async update(id, dadosUpdate) {
        // Lógica de construir a query de update dinamicamente seria aqui,
        // mas para simplificar, vamos assumir que os campos principais são atualizados.
        const { nome_completo, email, role, ativo, senha_hash } = dadosUpdate;

        let query = 'UPDATE usuarios SET nome_completo = $1, email = $2, role = $3, ativo = $4';
        const params = [nome_completo, email, role, ativo];

        if (senha_hash) {
            query += `, senha_hash = $${params.length + 1}`;
            params.push(senha_hash);
        }

        query += `, updated_at = NOW() WHERE id = $${params.length + 1} RETURNING *`;
        params.push(id);

        const result = await db.query(query, params);
        return result.rows[0];
    },

    /**
     * CORREÇÃO: Implementação da função remove.
     */
    async remove(id) {
        await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    },
};

export default usuarioRepository;