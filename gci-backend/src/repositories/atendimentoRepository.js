import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_ATENDIMENTO = {
    municipioId: { column: 'a.municipio_id', operator: '=' },
    secretariaId: { column: 'a.secretaria_id', operator: '=' },
    status: { column: 'a.status', operator: 'IN' },
    search: { column: 'c.nome_perfil_canal', operator: 'ILIKE', transform: (v) => `%${v}%` }
};

const atendimentoRepository = {
    async findAll(filtros = {}) {
        const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_ATENDIMENTO);
        const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'data_ultima_atualizacao' });

        const query = `
            SELECT 
                a.id, a.protocolo_str, a.status, a.data_ultima_atualizacao, a.assunto_breve,
                c.nome_perfil_canal as cidadao_nome, s.nome as secretaria_nome
            FROM atendimentos a
            LEFT JOIN cidadaos c ON a.cidadao_id = c.id
            LEFT JOIN secretarias s ON a.secretaria_id = s.id
            ${whereClause}
            ${paginationAndOrder};
        `;

        const countQuery = `SELECT COUNT(a.id) FROM atendimentos a LEFT JOIN cidadaos c ON a.cidadao_id = c.id ${whereClause};`;

        const [atendimentosResult, totalResult] = await Promise.all([
            db.query(query, params),
            db.query(countQuery, params)
        ]);

        const total = parseInt(totalResult.rows[0].count, 10);

        return {
            data: atendimentosResult.rows,
            total,
            pages: Math.ceil(total / Number(filtros.limit || 15)),
            currentPage: parseInt(filtros.page || '1', 10)
        };
    },
    // ... outras funções ...
};

export default atendimentoRepository;