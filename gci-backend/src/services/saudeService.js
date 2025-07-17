// gci-backend/src/services/saudeService.js
import db from '../config/db.js'; // Vamos usar queries diretas para agregar dados complexos

// Funções para buscar opções para os formulários
async function getOpcoesAgendamento(municipioId) {
    const queryUnidades = `SELECT id, nome FROM unidades_saude WHERE municipio_id = $1 AND ativo = true ORDER BY nome;`;
    const queryEspecialidades = `SELECT id, nome_especialidade FROM especialidades_medicas ORDER BY nome_especialidade;`; // Geralmente são globais
    const queryProfissionais = `SELECT id, nome_completo FROM profissionais_saude WHERE municipio_id = $1 AND ativo = true ORDER BY nome_completo;`;
    const queryTiposExame = `SELECT id, nome_exame FROM tipos_exames_saude WHERE municipio_id = $1 AND ativo = true ORDER BY nome_exame;`;

    const [
        unidadesResult,
        especialidadesResult,
        profissionaisResult,
        tiposExameResult
    ] = await Promise.all([
        db.query(queryUnidades, [municipioId]),
        db.query(queryEspecialidades),
        db.query(queryProfissionais, [municipioId]),
        db.query(queryTiposExame, [municipioId]),
    ]);

    return {
        unidades: unidadesResult.rows,
        especialidades: especialidadesResult.rows,
        profissionais: profissionaisResult.rows,
        tiposExame: tiposExameResult.rows,
    };
}

// Lógica para buscar horários disponíveis com filtros
async function getHorariosDisponiveis(filtros) {
    // Implementar a query de busca de horários aqui
    // SELECT * FROM horarios_disponiveis_saude WHERE ...
    return []; // Placeholder
}

export default {
    getOpcoesAgendamento,
    getHorariosDisponiveis,
};