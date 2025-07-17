// gci-backend/src/services/dashboardService.js
import db from '../config/db.js';
import AppError from '../utils/AppError.js';

const dashboardService = {
    /**
     * Busca estatísticas para os cards principais.
     */
    async getStatsCards(user) {
        const { role, municipio_id } = user;
        let queryParams = [];
        let whereClause = '';
        let cidadaoWhereClause = '';

        // CORREÇÃO CRÍTICA: Sempre aplicar filtro de município para não-admin
        if (role !== 'admin_sistema') {
            // Verificar se usuário tem município válido
            if (!municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            whereClause = 'WHERE municipio_id = $1';
            cidadaoWhereClause = 'WHERE municipio_id = $1';
            queryParams.push(municipio_id);
        }

        const statsQuery = `
            SELECT
                COUNT(*) AS total_atendimentos,
                COUNT(*) FILTER (WHERE status = 'aberto' OR status = 'aguardando_atendente') AS atendimentos_abertos,
                COUNT(*) FILTER (WHERE status = 'resolvido' OR status = 'fechado') AS atendimentos_resolvidos
            FROM atendimentos
            ${whereClause};
        `;

        const cidadaoQuery = `
            SELECT COUNT(*) AS total_cidadaos
            FROM cidadaos
            ${cidadaoWhereClause};
        `;

        // CORREÇÃO: Buscar informações do município para context
        let municipioQuery = null;
        if (municipio_id) {
            municipioQuery = `
                SELECT 
                    m.nome as municipio_nome,
                    m.estado as municipio_estado,
                    m.codigo_ibge as municipio_codigo_ibge
                FROM municipios m 
                WHERE m.id = $${queryParams.length + 1}
            `;
            queryParams.push(municipio_id);
        }

        try {
            const queries = [
                db.query(statsQuery, queryParams.slice(0, municipio_id ? 1 : 0)),
                db.query(cidadaoQuery, queryParams.slice(0, municipio_id ? 1 : 0))
            ];

            if (municipioQuery) {
                queries.push(db.query(municipioQuery, [municipio_id]));
            }

            const results = await Promise.all(queries);
            const [statsResult, cidadaoResult, municipioResult] = results;

            const response = {
                ...statsResult.rows[0],
                total_cidadaos: cidadaoResult.rows[0].total_cidadaos
            };

            // CORREÇÃO: Incluir informações do município no contexto
            if (municipioResult && municipioResult.rows[0]) {
                response.municipio_context = municipioResult.rows[0];
            }

            return response;
        } catch (error) {
            console.error('Erro na query de estatísticas do dashboard:', error);
            throw new AppError('Erro ao buscar estatísticas do dashboard', 500);
        }
    },

    /**
     * Busca dados para o gráfico de atendimentos por secretaria.
     */
    async getAtendimentosPorSecretaria(user) {
        const { role, municipio_id } = user;
        let queryParams = [];
        let whereClause = 'WHERE a.secretaria_id IS NOT NULL';

        // CORREÇÃO CRÍTICA: Sempre aplicar filtro de município para não-admin
        if (role !== 'admin_sistema') {
            // Verificar se usuário tem município válido
            if (!municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            whereClause += ' AND a.municipio_id = $1';
            queryParams.push(municipio_id);
        }

        // CORREÇÃO: Incluir informações do município no resultado
        const query = `
            SELECT 
                s.nome AS secretaria, 
                COUNT(a.id) AS total,
                m.nome as municipio_nome,
                m.estado as municipio_estado
            FROM atendimentos a
            JOIN secretarias s ON a.secretaria_id = s.id
            LEFT JOIN municipios m ON a.municipio_id = m.id
            ${whereClause}
            GROUP BY s.nome, m.nome, m.estado
            ORDER BY total DESC
            LIMIT 7;
        `;

        const result = await db.query(query, queryParams);
        return result.rows;
    },

    /**
     * Busca os últimos 5 atendimentos que precisam de atenção.
     */
    async getAtendimentosRecentes(user) {
        const { role, municipio_id } = user;
        let queryParams = [5];
        let whereClause = `WHERE a.status IN ('aberto', 'aguardando_atendente')`;

        // CORREÇÃO CRÍTICA: Sempre aplicar filtro de município para não-admin
        if (role !== 'admin_sistema') {
            // Verificar se usuário tem município válido
            if (!municipio_id) {
                throw new AppError('Usuário deve estar associado a um município válido.', 403);
            }
            whereClause += ` AND a.municipio_id = $2`;
            queryParams.push(municipio_id);
        }

        // CORREÇÃO: Incluir informações do município nos atendimentos recentes
        const query = `
            SELECT 
                a.id, 
                a.protocolo_str, 
                a.status, 
                a.data_ultima_atualizacao, 
                c.nome_perfil_canal as cidadao_nome, 
                a.assunto_breve,
                m.nome as municipio_nome,
                m.estado as municipio_estado
            FROM atendimentos a
            JOIN cidadaos c ON a.cidadao_id = c.id
            LEFT JOIN municipios m ON a.municipio_id = m.id
            ${whereClause}
            ORDER BY a.data_ultima_atualizacao DESC
            LIMIT $1;
        `;

        const result = await db.query(query, queryParams);
        return result.rows;
    }
};

export default dashboardService;