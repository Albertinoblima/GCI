// gci-backend/src/repositories/matriculaRepository.js
import db from '../config/db.js';
import { buildWhereClause, buildPaginationAndOrder } from '../utils/queryBuilder.js';

const MAPEAMENTO_FILTROS_MATRICULA = {
  municipioId: { column: 'e.municipio_id', operator: '=' },
  escolaId: { column: 'm.escola_id_solicitada', operator: '=' },
  status: { column: 'm.status_solicitacao', operator: '=' },
};

const matriculaRepository = {
  async create(dadosMatricula) {
    const { cidadao_id, escola_id_solicitada, nome_aluno, serie_solicitada, observacoes_responsavel } = dadosMatricula;
    const query = `
      INSERT INTO matriculas_escolares_solicitacoes 
      (cidadao_id, escola_id_solicitada, nome_aluno, serie_solicitada, observacoes_responsavel, status_solicitacao) 
      VALUES ($1, $2, $3, $4, $5, 'pendente') 
      RETURNING *;
    `;
    const result = await db.query(query, [
      cidadao_id,
      escola_id_solicitada,
      nome_aluno,
      serie_solicitada || null,
      observacoes_responsavel || null
    ]);
    return result.rows[0];
  },

  async findAll(filtros = {}) {
    const { whereClause, params } = buildWhereClause(filtros, MAPEAMENTO_FILTROS_MATRICULA);
    const paginationAndOrder = buildPaginationAndOrder(filtros, { defaultSortBy: 'created_at' });

    const query = `
            SELECT m.*, c.nome_perfil_canal as nome_cidadao, e.nome as nome_escola
            FROM matriculas_escolares_solicitacoes m
            JOIN escolas e ON m.escola_id_solicitada = e.id
            JOIN cidadaos c ON m.cidadao_id = c.id
            ${whereClause}
            ${paginationAndOrder};
        `;

    const countQuery = `
            SELECT COUNT(m.id) 
            FROM matriculas_escolares_solicitacoes m
            JOIN escolas e ON m.escola_id_solicitada = e.id
            ${whereClause};
        `;

    const [solicitacoesResult, totalResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, params)
    ]);

    const total = parseInt(totalResult.rows[0].count, 10);

    return {
      data: solicitacoesResult.rows,
      total,
      pages: Math.ceil(total / Number(filtros.limit || 15)),
      currentPage: parseInt(filtros.page || '1', 10)
    };
  },

  async findById(id) {
    const query = `
      SELECT m.*, c.nome_perfil_canal as nome_cidadao, e.nome as nome_escola
      FROM matriculas_escolares_solicitacoes m
      JOIN escolas e ON m.escola_id_solicitada = e.id
      JOIN cidadaos c ON m.cidadao_id = c.id
      WHERE m.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  async update(id, dadosUpdate) {
    const campos = [];
    const valores = [];
    let paramIndex = 1;

    // Construir dinamicamente os campos para atualizar
    if (dadosUpdate.status_solicitacao !== undefined) {
      campos.push(`status_solicitacao = $${paramIndex}`);
      valores.push(dadosUpdate.status_solicitacao);
      paramIndex++;
    }

    if (dadosUpdate.observacoes_secretaria !== undefined) {
      campos.push(`observacoes_secretaria = $${paramIndex}`);
      valores.push(dadosUpdate.observacoes_secretaria);
      paramIndex++;
    }

    if (dadosUpdate.nome_aluno !== undefined) {
      campos.push(`nome_aluno = $${paramIndex}`);
      valores.push(dadosUpdate.nome_aluno);
      paramIndex++;
    }

    if (dadosUpdate.serie_solicitada !== undefined) {
      campos.push(`serie_solicitada = $${paramIndex}`);
      valores.push(dadosUpdate.serie_solicitada);
      paramIndex++;
    }

    if (dadosUpdate.observacoes_responsavel !== undefined) {
      campos.push(`observacoes_responsavel = $${paramIndex}`);
      valores.push(dadosUpdate.observacoes_responsavel);
      paramIndex++;
    }

    // Adicionar updated_at
    campos.push(`updated_at = NOW()`);

    // Adicionar o ID no final
    valores.push(id);

    const query = `
      UPDATE matriculas_escolares_solicitacoes 
      SET ${campos.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *;
    `;

    const result = await db.query(query, valores);
    return result.rows[0];
  }
};

export default matriculaRepository;