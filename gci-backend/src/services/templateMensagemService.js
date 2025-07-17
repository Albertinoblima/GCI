// gci-backend/src/services/templateMensagemService.js

import db from '../config/db.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const templateMensagemService = {
    async create(dadosTemplate) {
        const { nome_template, evento_gatilho, conteudo_template, municipio_id, secretaria_id, servico_id } = dadosTemplate;
        const queryText = `
      INSERT INTO templates_mensagens 
        (nome_template, evento_gatilho, conteudo_template, municipio_id, secretaria_id, servico_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
        try {
            const result = await db.query(queryText, [nome_template, evento_gatilho, conteudo_template, municipio_id, secretaria_id, servico_id]);
            logger.info(`Template de mensagem criado: "${nome_template}"`);
            return result.rows[0];
        } catch (err) {
            if (err.code === '23505') { // unique_violation
                throw new AppError(`Um template com o nome "${nome_template}" já existe.`, 409);
            }
            logger.error(`Erro ao criar template de mensagem`, { error: err.message });
            throw new AppError('Erro ao criar template de mensagem.', 500);
        }
    },

    // Outros placeholders
    async findAll() { /* ... */ },
    async findById(id) { /* ... */ },
    async update(id, data) { /* ... */ },
    async remove(id) { /* ... */ },
};

export default templateMensagemService;