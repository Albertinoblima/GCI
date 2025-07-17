// gci-backend/src/services/horarioDisponivelSaudeService.js

import db from '../config/db.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const horarioDisponivelSaudeService = {
    /**
     * Cria um novo slot de horário disponível para um profissional.
     * @param {object} dadosHorario - Dados do horário.
     * @returns {Promise<object>} O horário criado.
     */
    async create(dadosHorario) {
        const { profissional_id, unidade_id, especialidade_id, data_horario_inicio, data_horario_fim, tipo_exame_id, status_slot = 'disponivel' } = dadosHorario;

        // Se data_horario_fim não for fornecida, calcular baseado em 30 minutos padrão
        let horarioFim = data_horario_fim;
        if (!horarioFim) {
            const inicio = new Date(data_horario_inicio);
            horarioFim = new Date(inicio.getTime() + (30 * 60 * 1000)); // 30 minutos padrão
        }

        const queryText = `
      INSERT INTO horarios_disponiveis_saude 
        (profissional_id, unidade_id, especialidade_id, data_horario_inicio, data_horario_fim, tipo_exame_id, status_slot)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        try {
            const result = await db.query(queryText, [profissional_id, unidade_id, especialidade_id, data_horario_inicio, horarioFim, tipo_exame_id, status_slot]);
            logger.info(`Horário disponível criado para o profissional ID ${profissional_id} em ${data_horario_inicio}`);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') { // unique_violation
                throw new AppError('Este slot de horário para este profissional já existe.', 409);
            }
            logger.error(`Erro ao criar horário disponível`, { error: err.message });
            throw new AppError('Erro ao criar horário disponível.', 500);
        }
    },

    /**
     * Cria múltiplos slots de horário em lote para um profissional.
     * @param {object} dadosBatch - Dados para criação em lote.
     * @returns {Promise<Array>} Os horários criados.
     */
    async createBatch(dadosBatch) {
        console.log('Iniciando createBatch');
        console.log('Dados recebidos:', JSON.stringify(dadosBatch, null, 2));

        try {
            const { profissionalId, data_inicio, data_fim, unidade_id, especialidade_id, tipo_servico, intervalo_minutos = 30 } = dadosBatch;

            // Validação dos dados obrigatórios
            if (!profissionalId) {
                throw new AppError('profissionalId é obrigatório para criação em lote.', 400);
            }
            if (!data_inicio) {
                throw new AppError('data_inicio é obrigatório para criação em lote.', 400);
            }
            if (!data_fim) {
                throw new AppError('data_fim é obrigatório para criação em lote.', 400);
            }
            if (!unidade_id) {
                throw new AppError('unidade_id é obrigatório para criação em lote.', 400);
            }
            if (!especialidade_id) {
                throw new AppError('especialidade_id é obrigatório para criação em lote.', 400);
            }

            const client = await db.connect();
            try {
                await client.query('BEGIN');

                const horariosParaCriar = [];
                const dataInicio = new Date(data_inicio);
                const dataFim = new Date(data_fim);

                // Validar se as datas são válidas
                if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
                    throw new AppError('Datas inválidas fornecidas.', 400);
                }

                if (dataInicio >= dataFim) {
                    throw new AppError('Data de início deve ser anterior à data de fim.', 400);
                }

                // Gerar slots de horário baseado no intervalo
                let currentTime = new Date(dataInicio);
                while (currentTime < dataFim) {
                    const horarioInicio = new Date(currentTime);
                    const horarioFim = new Date(currentTime.getTime() + (intervalo_minutos * 60 * 1000));

                    // Validação para garantir que horarioFim nunca seja null ou inválido
                    if (!horarioFim || isNaN(horarioFim.getTime())) {
                        throw new AppError('Erro no cálculo do horário de fim.', 500);
                    }

                    // Garantir que o horário de fim não ultrapasse o fim do período
                    if (horarioFim > dataFim) {
                        break;
                    }

                    const horarioObj = {
                        profissional_id: profissionalId,
                        unidade_id,
                        especialidade_id,
                        data_horario_inicio: horarioInicio,
                        data_horario_fim: horarioFim,
                        tipo_exame_id: null,
                        tipo_servico_saude: tipo_servico || 'consulta',
                        status_slot: 'disponivel'
                    };

                    horariosParaCriar.push(horarioObj);
                    currentTime = new Date(currentTime.getTime() + (intervalo_minutos * 60 * 1000));
                }

                console.log(`${horariosParaCriar.length} horários para criar`);

                if (horariosParaCriar.length === 0) {
                    throw new AppError('Nenhum horário válido pôde ser gerado com os parâmetros fornecidos.', 400);
                }

                const horariosInseridos = [];
                for (const horario of horariosParaCriar) {
                    const queryText = `
                        INSERT INTO horarios_disponiveis_saude 
                        (profissional_id, unidade_id, especialidade_id, data_horario_inicio, data_horario_fim, tipo_exame_id, tipo_servico_saude, status_slot)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        RETURNING *;
                    `;

                    const params = [
                        horario.profissional_id,
                        horario.unidade_id,
                        horario.especialidade_id,
                        horario.data_horario_inicio.toISOString(),
                        horario.data_horario_fim.toISOString(),
                        horario.tipo_exame_id,
                        horario.tipo_servico_saude,
                        horario.status_slot
                    ];

                    const result = await client.query(queryText, params);
                    horariosInseridos.push(result.rows[0]);
                }

                await client.query('COMMIT');
                console.log(`${horariosInseridos.length} horários criados com sucesso`);
                logger.info(`${horariosInseridos.length} horários criados em lote para o profissional ID ${profissionalId}`);
                return horariosInseridos;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        } catch (err) {
            console.error('Erro no createBatch:', err.message);
            logger.error(`Erro ao criar horários em lote`, { error: err.message, stack: err.stack });

            // Re-throw como AppError se não for uma AppError
            if (!(err instanceof AppError)) {
                throw new AppError(`Erro interno ao criar horários em lote: ${err.message}`, 500);
            }
            throw err;
        }
    },

    /**
     * Busca todos os horários disponíveis com filtros opcionais.
     * @param {object} filtros - Filtros para busca (profissionalId, unidadeId, etc).
     * @returns {Promise<Array>} Lista de horários disponíveis.
     */
    async findAll(filtros = {}) {
        const { profissionalId, unidadeId, especialidadeId, data_inicio, data_fim } = filtros;

        let queryText = `
                SELECT 
                    hds.*,
                    ps.nome_completo as profissional_nome,
                    us.nome as unidade_nome,
                    em.nome_especialidade,
                    hds.data_horario_inicio,
                    hds.data_horario_fim
                FROM horarios_disponiveis_saude hds
                LEFT JOIN profissionais_saude ps ON hds.profissional_id = ps.id
                LEFT JOIN unidades_saude us ON hds.unidade_id = us.id
                LEFT JOIN especialidades_medicas em ON hds.especialidade_id = em.id
                WHERE 1=1
            `;

        const params = [];
        let paramIndex = 1;

        if (profissionalId) {
            queryText += ` AND hds.profissional_id = $${paramIndex}`;
            params.push(profissionalId);
            paramIndex++;
        }

        if (unidadeId) {
            queryText += ` AND hds.unidade_id = $${paramIndex}`;
            params.push(unidadeId);
            paramIndex++;
        }

        if (especialidadeId) {
            queryText += ` AND hds.especialidade_id = $${paramIndex}`;
            params.push(especialidadeId);
            paramIndex++;
        }

        if (data_inicio) {
            queryText += ` AND hds.data_horario_inicio >= $${paramIndex}`;
            params.push(data_inicio);
            paramIndex++;
        }

        if (data_fim) {
            queryText += ` AND hds.data_horario_inicio <= $${paramIndex}`;
            params.push(data_fim);
            paramIndex++;
        }

        queryText += ` ORDER BY hds.data_horario_inicio ASC`;

        try {
            const result = await db.query(queryText, params);
            return result.rows;
        } catch (err) {
            logger.error('Erro ao buscar horários disponíveis:', err);
            throw new AppError('Erro ao buscar horários disponíveis.', 500);
        }
    },

    /**
     * Busca um horário disponível por ID.
     * @param {number} id - ID do horário.
     * @returns {Promise<object>} Horário encontrado.
     */
    async findById(id) {
        const queryText = `
            SELECT 
                hds.*,
                ps.nome_completo as profissional_nome,
                us.nome as unidade_nome,
                em.nome_especialidade,
                hds.data_horario_inicio,
                hds.data_horario_fim
            FROM horarios_disponiveis_saude hds
            LEFT JOIN profissionais_saude ps ON hds.profissional_id = ps.id
            LEFT JOIN unidades_saude us ON hds.unidade_id = us.id
            LEFT JOIN especialidades_medicas em ON hds.especialidade_id = em.id
            WHERE hds.id = $1
        `;

        try {
            const result = await db.query(queryText, [id]);
            if (result.rows.length === 0) {
                throw new AppError('Horário não encontrado.', 404);
            }
            return result.rows[0];
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Erro ao buscar horário por ID:', err);
            throw new AppError('Erro ao buscar horário.', 500);
        }
    },

    /**
     * Atualiza o status de um horário disponível.
     * @param {number} id - ID do horário.
     * @param {string} novoStatus - Novo status (disponivel, ocupado, cancelado).
     * @returns {Promise<object>} Horário atualizado.
     */
    async updateStatus(id, novoStatus) {
        const queryText = `
            UPDATE horarios_disponiveis_saude 
            SET status_slot = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        try {
            const result = await db.query(queryText, [novoStatus, id]);
            if (result.rows.length === 0) {
                throw new AppError('Horário não encontrado.', 404);
            }
            logger.info(`Status do horário ID ${id} atualizado para ${novoStatus}`);
            return result.rows[0];
        } catch (err) {
            if (err instanceof AppError) throw err;
            logger.error('Erro ao atualizar status do horário:', err);
            throw new AppError('Erro ao atualizar status do horário.', 500);
        }
    }
};

export default horarioDisponivelSaudeService;
