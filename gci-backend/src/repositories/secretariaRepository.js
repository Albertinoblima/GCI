// gci-backend/src/repositories/secretariaRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_SECRETARIA = {
    municipioId: { column: 'municipio_id', operator: '=' },
    ativo: { column: 'ativo', operator: '=' },
    search: { column: 'nome', operator: 'ILIKE', transform: (v) => `%${v}%` }
};

const secretariaRepository = {
    async create(municipioId, dados) { /* ... já implementado ... */ },

    async findAll(filtros = {}) {
        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_SECRETARIA);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'nome', defaultOrder: 'ASC' });

        // CORREÇÃO: Incluir informações do município
        const query = `
            SELECT 
                s.*,
                m.nome as municipio_nome,
                m.estado as municipio_estado,
                m.codigo_ibge as municipio_codigo_ibge
            FROM secretarias s
            LEFT JOIN municipios m ON s.municipio_id = m.id
            ${whereClause} ${paginationAndOrder};
        `;
        const result = await db.query(query, params);
        return result.rows;
    },

    // findByMunicipioId pode ser mantido ou unificado com findAll
    async findByMunicipioId(municipioId) {
        return this.findAll({ municipioId, limit: 1000 }); // Limite alto para simular "todos"
    },

    async findById(id) { /* ... já implementado ... */ },
    async update(id, dados) { /* ... já implementado ... */ },
    async remove(id) { /* ... já implementado ... */ }
};
export default secretariaRepository;