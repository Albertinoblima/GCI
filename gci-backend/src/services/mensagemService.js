// gci-backend/src/services/mensagemService.js
import db from '../config/db.js';
import AppError from '../utils/AppError.js';
import { io } from '../server.js'; // Importa a instância global do Socket.IO
import anexoService from './anexoService.js';
import logger from '../utils/logger.js';

const mensagemService = {
    async create(dadosMensagem) {
        const { atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, fileInfo } = dadosMensagem;
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Atualiza o timestamp e, se for o caso, o responsável do atendimento
            if (remetente_tipo === 'agente') {
                await client.query(
                    `UPDATE atendimentos SET status = 'em_andamento', atendente_responsavel_id = COALESCE(atendente_responsavel_id, $1), data_ultima_atualizacao = NOW() WHERE id = $2`,
                    [agente_id, atendimento_id]
                );
            } else {
                await client.query(`UPDATE atendimentos SET data_ultima_atualizacao = NOW() WHERE id = $1`, [atendimento_id]);
            }

            // Insere a nova mensagem
            const msgQuery = `
            INSERT INTO mensagens_atendimento (atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, id_mensagem_canal_origem, timestamp_mensagem)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `;
            const msgResult = await client.query(msgQuery, [atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, dadosMensagem.id_mensagem_canal_origem, dadosMensagem.timestamp_mensagem || new Date()]);
            let novaMensagem = msgResult.rows[0];

            // Se houver anexo, cria o registro
            if (fileInfo) {
                const anexo = await anexoService.create(fileInfo, 'mensagem_atendimento', novaMensagem.id, client);
                novaMensagem.anexo = anexo;
            }

            await client.query('COMMIT');

            // ** IMPLEMENTAÇÃO DA EMISSÃO DO SOCKET **
            const roomName = `atendimento:${atendimento_id}`;
            logger.info(`Emitindo evento 'nova_mensagem' para a sala: ${roomName}`);
            io.to(roomName).emit('nova_mensagem', novaMensagem);

            return novaMensagem;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Erro ao criar mensagem no serviço.', { error: error.message });
            throw new AppError('Erro ao processar mensagem.', 500);
        } finally {
            client.release();
        }
    },

    async findByAtendimentoId(atendimentoId, { page = 1, limit = 50 } = {}) {
        // A lógica de busca existente está correta e pode permanecer.
        const offset = (page - 1) * limit;
        const [dataResult, countResult] = await Promise.all([
            db.query(`SELECT m.*, an.id as anexo_id, an.nome_arquivo_original FROM mensagens_atendimento m LEFT JOIN anexos an ON an.referencia_tipo = 'mensagem_atendimento' AND an.referencia_id = m.id WHERE m.atendimento_id = $1 ORDER BY m.timestamp_mensagem ASC, m.id ASC LIMIT $2 OFFSET $3`, [atendimentoId, limit, offset]),
            db.query('SELECT COUNT(*) FROM mensagens_atendimento WHERE atendimento_id = $1', [atendimentoId])
        ]);
        const total = parseInt(countResult.rows[0].count, 10);
        return { mensagens: dataResult.rows, total, pages: Math.ceil(total / limit), currentPage: page };
    }
};

export default mensagemService;