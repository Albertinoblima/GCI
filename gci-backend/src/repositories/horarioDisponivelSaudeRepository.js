// gci-backend/src/repositories/horarioDisponivelSaudeRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_HORARIO = {
    unidadeId: { column: 'unidade_id', operator: '=' },
    profissionalId: { column: 'profissional_id', operator: '=' },
    especialidadeId: { column: 'especialidade_id', operator: '=' },
    tipoExameId: { column: 'tipo_exame_id', operator: '=' },
    status: { column: 'status_slot', operator: '=' },
    dataInicio: { column: 'data_horario_inicio', operator: '>=' },
    dataFim: { column: 'data_horario_fim', operator: '<=' },
};

const horarioDisponivelSaudeRepository = {
    async create(dados) { /* ... já implementado ... */ },
    async setStatusAgendado(id, client) { /* ... já implementado ... */ },

    async findAll(filtros = {}) {
        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_HORARIO);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'data_horario_inicio', defaultOrder: 'ASC' });

        const query = `SELECT * FROM horarios_disponiveis_saude ${whereClause} ${paginationAndOrder};`;
        const result = await db.query(query, params);
        return result.rows;
    }
};
export default horarioDisponivelSaudeRepository;