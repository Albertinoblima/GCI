// gci-backend/src/repositories/mensagemRepository.js
import db from '../config/db.js';

const mensagemRepository = {
    /**
     * Insere uma nova mensagem no banco de dados.
     * @param {object} dadosMensagem - Dados da mensagem.
     * @param {object} [client=db] - Cliente de banco de dados para transações.
     * @returns {Promise<object>} A mensagem criada.
     */
    async create(dadosMensagem, client = db) {
        const { atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, id_mensagem_canal_origem, timestamp_mensagem, status_envio_canal } = dadosMensagem;
        const query = `
      INSERT INTO mensagens_atendimento (atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, id_mensagem_canal_origem, timestamp_mensagem, status_envio_canal)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const values = [atendimento_id, remetente_tipo, agente_id, cidadao_id, conteudo_texto, id_mensagem_canal_origem, timestamp_mensagem, status_envio_canal];
        const result = await client.query(query, values);
        return result.rows[0];
    },

    /**
     * Busca mensagens de um atendimento com paginação e ordenação corretas.
     * @param {number} atendimentoId - O ID do atendimento.
     * @param {{page: number, limit: number}} options - Opções de paginação.
     * @param {object} [client=db] - Cliente de banco de dados para transações.
     * @returns {Promise<object[]>} Lista de mensagens com detalhes do anexo.
     */
    async findByAtendimentoId(atendimentoId, { page, limit }, client = db) {
        const offset = (page - 1) * limit;
        const query = `
      SELECT m.*, an.id as anexo_id, an.url_arquivo, an.nome_arquivo_original, an.mimetype, an.tamanho_bytes 
      FROM mensagens_atendimento m
      LEFT JOIN anexos an ON an.referencia_id = m.id AND an.referencia_tipo = 'mensagem_atendimento'
      WHERE m.atendimento_id = $1 
      ORDER BY m.timestamp_mensagem ASC, m.id ASC
      LIMIT $2 OFFSET $3;
    `;
        const result = await client.query(query, [atendimentoId, limit, offset]);
        return result.rows;
    },

    /**
     * Conta o total de mensagens de um atendimento.
     * @param {number} atendimentoId - O ID do atendimento.
     * @param {object} [client=db] - Cliente de banco de dados para transações.
     * @returns {Promise<number>} O número total de mensagens.
     */
    async countByAtendimentoId(atendimentoId, client = db) {
        const query = `SELECT COUNT(*) FROM mensagens_atendimento WHERE atendimento_id = $1;`;
        const result = await client.query(query, [atendimentoId]);
        return parseInt(result.rows[0].count, 10);
    }
};

export default mensagemRepository;