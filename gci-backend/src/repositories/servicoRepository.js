// gci-backend/src/repositories/servicoRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_SERVICO = {
    secretariaId: { column: 'secretaria_id', operator: '=' },
    ativo: { column: 'ativo', operator: '=' },
    tipo: { column: 'tipo_servico', operator: '=' },
    search: { column: 'nome', operator: 'ILIKE', transform: (v) => `%${v}%` }
};

const servicoRepository = {
    async create(secretariaId, dados) { /* ... já implementado ... */ },

    async findAll(filtros = {}) {
        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_SERVICO);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'nome', defaultOrder: 'ASC' });

        const query = `SELECT * FROM servicos ${whereClause} ${paginationAndOrder};`;
        const result = await db.query(query, params);
        return result.rows;
    },

    // findBySecretariaId pode ser mantido ou unificado com findAll
    async findBySecretariaId(secretariaId) {
        return this.findAll({ secretariaId, limit: 1000 });
    },

    async findById(id) { /* ... já implementado ... */ },
    async update(id, dados) { /* ... já implementado ... */ },
    async remove(id) { /* ... já implementado ... */ }
};
export default servicoRepository;