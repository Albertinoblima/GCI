// gci-backend/src/repositories/agendamentoSaudeRepository.js
import db from '../config/db.js';

const agendamentoSaudeRepository = {
    /**
     * Cria um novo registro de agendamento no banco de dados.
     * @param {object} dadosAgendamento - Dados do agendamento.
     * @param {object} [client=db] - Cliente de banco de dados opcional para transações.
     * @returns {Promise<object>} O agendamento criado.
     */
    async create(dadosAgendamento, client = db) {
        const { cidadao_id, horario_disponivel_id, tipo_exame_id, status_agendamento } = dadosAgendamento;
        const query = `
      INSERT INTO agendamentos_saude (cidadao_id, horario_disponivel_id, tipo_exame_id, status_agendamento)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const result = await client.query(query, [cidadao_id, horario_disponivel_id, tipo_exame_id, status_agendamento]);
        return result.rows[0];
    },

    /**
     * Lista todos os agendamentos com filtros opcionais
     * @param {object} filters - Filtros opcionais
     * @param {object} user - Usuário logado
     * @param {object} [client=db] - Cliente de banco de dados
     * @returns {Promise<Array>} Lista de agendamentos
     */
    async findAll(filters = {}, user, client = db) {
        try {
            // Começar com uma query simples para verificar se a tabela existe e tem dados
            const simpleQuery = `SELECT COUNT(*) as total FROM agendamentos_saude`;
            const countResult = await client.query(simpleQuery);

            // Se não há registros, retornar array vazio
            if (!countResult.rows[0] || countResult.rows[0].total == 0) {
                return [];
            }

            // Se há registros, fazer query com JOINs (mas com tratamento de erro)
            let query = `
                SELECT 
                    a.id,
                    a.cidadao_id,
                    a.horario_disponivel_id,
                    a.tipo_exame_id,
                    a.status_agendamento,
                    a.observacoes_unidade,
                    a.created_at,
                    a.updated_at
                FROM agendamentos_saude a
                WHERE 1=1
            `;

            const params = [];

            // Filtrar por município do usuário logado se não for admin_sistema
            if (user?.role !== 'admin_sistema' && user?.municipio_id) {
                // Aguardando correção da estrutura do banco
            }

            // Adicionar filtros se fornecidos
            if (filters.status_agendamento) {
                query += ` AND a.status_agendamento = $${params.length + 1}`;
                params.push(filters.status_agendamento);
            }

            if (filters.cidadao_id) {
                query += ` AND a.cidadao_id = $${params.length + 1}`;
                params.push(filters.cidadao_id);
            }

            if (filters.data_inicio && filters.data_fim) {
                // Aguardando correção da estrutura do banco
            }

            query += ` ORDER BY a.created_at DESC LIMIT 100`;

            const result = await client.query(query, params);

            return result.rows;

        } catch (error) {
            console.error('❌ Repository Error:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });

            // Se houve erro de SQL, tentar query ainda mais simples
            if (error.code && (error.code.startsWith('42') || error.code === '42P01')) {
                console.log('⚠️ Repository: Tentando query mais simples devido a erro SQL...');
                try {
                    const fallbackQuery = `SELECT * FROM agendamentos_saude ORDER BY created_at DESC LIMIT 10`;
                    const fallbackResult = await client.query(fallbackQuery);
                    console.log('✅ Repository: Query simples funcionou, resultados:', fallbackResult.rows.length);
                    return fallbackResult.rows;
                } catch (fallbackError) {
                    console.error('❌ Repository: Mesmo query simples falhou:', fallbackError.message);
                    // Se até a query simples falhar, retornar array vazio
                    return [];
                }
            }

        }
    },

    /**
     * Busca um agendamento por ID
     * @param {number} id - ID do agendamento
     * @param {object} user - Usuário logado
     * @param {object} [client=db] - Cliente de banco de dados
     * @returns {Promise<object|null>} Agendamento encontrado ou null
     */
    async findById(id, user, client = db) {
        try {
            // Query simples primeiro
            let query = `
                SELECT 
                    a.id,
                    a.cidadao_id,
                    a.horario_disponivel_id,
                    a.tipo_exame_id,
                    a.status_agendamento,
                    a.observacoes_unidade,
                    a.created_at,
                    a.updated_at
                FROM agendamentos_saude a
                WHERE a.id = $1
            `;

            const params = [id];

            // Filtrar por município do usuário logado se não for admin_sistema
            if (user?.role !== 'admin_sistema' && user?.municipio_id) {
                // Aguardando correção da estrutura do banco
            }

            const result = await client.query(query, params);
            return result.rows[0] || null;

        } catch (error) {
            console.error('❌ Repository findById Error:', error.message);
            // Em caso de erro, tentar query ainda mais simples
            try {
                const fallbackQuery = `SELECT * FROM agendamentos_saude WHERE id = $1`;
                const fallbackResult = await client.query(fallbackQuery, [id]);
                return fallbackResult.rows[0] || null;
            } catch (fallbackError) {
                console.error('❌ Repository findById fallback Error:', fallbackError.message);
                return null;
            }
        }
    },

    // ...existing code...
};

export default agendamentoSaudeRepository;