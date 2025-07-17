// gci-backend/src/repositories/templateMensagemRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_TEMPLATE = {
    municipioId: { column: 'municipio_id', operator: '=' },
    secretariaId: { column: 'secretaria_id', operator: '=' },
    servicoId: { column: 'servico_id', operator: '=' },
    evento: { column: 'evento_gatilho', operator: '=' },
    search: { column: 'nome_template', operator: 'ILIKE', transform: v => `%${v}%` }
};

const templateMensagemRepository = {
    async create(dados) { /* ... já implementado ... */ },

    async findAll(filtros = {}) {
        // Trata caso especial de buscar templates globais
        if (filtros.municipioId === null) {
            filtros.municipioId = { value: null, operator: 'IS' };
        }

        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_TEMPLATE);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'nome_template', defaultOrder: 'ASC' });

        const query = `SELECT * FROM templates_mensagens ${whereClause} ${paginationAndOrder};`;
        const result = await db.query(query, params);
        return result.rows;
    }
};
export default templateMensagemRepository;