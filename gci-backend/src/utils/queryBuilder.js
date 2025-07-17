// gci-backend/src/utils/queryBuilder.js

/**
 * Constrói uma cláusula WHERE dinâmica e segura para queries SQL.
 * @param {object} filtros - O objeto de filtros vindo da req.query.
 * @param {object} mapeamento - Um objeto que mapeia as chaves do filtro para as colunas do banco e seus operadores.
 *   Ex: { status: { column: 'a.status', operator: '=' }, search: { column: 'c.nome', operator: 'ILIKE' } }
 * @param {number} [startIndex=1] - O índice inicial para os placeholders ($1, $2, ...).
 * @returns {{ whereClause: string, params: any[] }} - A string da cláusula WHERE e o array de parâmetros.
 */
export function buildWhereClause(filtros, mapeamento, startIndex = 1) {
    const params = [];
    let paramIndex = startIndex;
    const conditions = [];

    for (const key in filtros) {
        if (filtros[key] && mapeamento[key]) {
            const { column, operator, transform } = mapeamento[key];
            let value = filtros[key];

            // Permite transformar o valor antes de usar (ex: para ILIKE)
            if (transform) {
                value = transform(value);
            }

            if (operator.toUpperCase() === 'IN' || operator.toUpperCase() === 'ANY') {
                // Suporta múltiplos valores separados por vírgula para IN/ANY
                const list = Array.isArray(value) ? value : String(value).split(',');
                conditions.push(`${column} = ANY($${paramIndex++}::text[])`);
                params.push(list);
            } else {
                conditions.push(`${column} ${operator} $${paramIndex++}`);
                params.push(value);
            }
        }
    }

    // CORREÇÃO CRÍTICA: Suporte para exclusão de roles
    if (filtros.excludeRoles && Array.isArray(filtros.excludeRoles)) {
        const roleColumn = mapeamento.role?.column || 'role';
        conditions.push(`${roleColumn} != ALL($${paramIndex++}::text[])`);
        params.push(filtros.excludeRoles);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return { whereClause, params };
}

/**
 * Constrói a parte de ordenação e paginação da query.
 * @param {object} filtros - O objeto de filtros vindo da req.query.
 * @param {object} options - Opções como { defaultSortBy, defaultOrder }.
 * @returns {string} - A string com ORDER BY, LIMIT e OFFSET.
 */
export function buildPaginationAndOrder(filtros, options = {}) {
    const { defaultSortBy, defaultOrder = 'DESC' } = options;
    const { page = 1, limit = 15, sortBy = defaultSortBy, order = defaultOrder } = filtros;

    const offset = (page - 1) * limit;
    const orderClause = sortBy ? `ORDER BY "${sortBy}" ${order.toUpperCase()}` : '';

    return `${orderClause} LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
}