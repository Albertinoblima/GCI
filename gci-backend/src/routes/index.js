// gci-backend/src/routes/index.js

import { Router } from 'express';

const router = Router();

// Importação de TODOS os roteadores
import authRoutes from './authRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import municipioRoutes from './municipioRoutes.js';
import secretariaRoutes from './secretariaRoutes.js'; // Importado aqui
import servicoRoutes from './servicoRoutes.js';       // Importado aqui
import atendimentoRoutes from './atendimentoRoutes.js';
import anexoRoutes from './anexoRoutes.js';
import cidadaoRoutes from './cidadaoRoutes.js';
import templateMensagemRoutes from './templateMensagemRoutes.js';

// ** 1. IMPORTAR AS ROTAS DO DASHBOARD **
import dashboardRoutes from './dashboardRoutes.js';

// Módulos de Educação e Saúde
import escolaRoutes from './escolaRoutes.js';
import matriculaRoutes from './matriculaRoutes.js';
import unidadeSaudeRoutes from './unidadeSaudeRoutes.js';
import profissionalSaudeRoutes from './profissionalSaudeRoutes.js';
import especialidadeMedicaRoutes from './especialidadeMedicaRoutes.js';
import horarioDisponivelSaudeRoutes from './horarioDisponivelSaudeRoutes.js';
import agendamentoSaudeRoutes from './agendamentoSaudeRoutes.js';
import tipoExameSaudeRoutes from './tipoExameSaudeRoutes.js';
import triagemSaudeRoutes from './triagemSaudeRoutes.js';

// Rota de teste
router.post('/test-endpoint', (req, res) => {
    console.log('✅ Endpoint de teste funcionou!');
    res.json({ status: 'success', message: 'Teste funcionou', data: req.body });
});

// Rota de Saúde da API
router.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// Montagem das rotas de nível superior
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/municipios', municipioRoutes);
router.use('/atendimentos', atendimentoRoutes);
router.use('/anexos', anexoRoutes);
router.use('/cidadaos', cidadaoRoutes);
router.use('/templates-mensagens', templateMensagemRoutes);

// Rotas de Educação
router.use('/escolas', escolaRoutes);
router.use('/solicitacoes-matricula', matriculaRoutes);

// Rotas de Saúde
router.use('/unidades-saude', unidadeSaudeRoutes);
router.use('/profissionais-saude', profissionalSaudeRoutes);
router.use('/especialidades-medicas', especialidadeMedicaRoutes);
router.use('/horarios-disponiveis-saude', horarioDisponivelSaudeRoutes);
router.use('/agendamentos-saude', agendamentoSaudeRoutes);
router.use('/tipos-exames-saude', tipoExameSaudeRoutes);
router.use('/triagens-saude', triagemSaudeRoutes);

// ** 2. USAR AS ROTAS DO DASHBOARD **
router.use('/dashboard', dashboardRoutes);

// ** MONTAGEM DAS ROTAS ANINHADAS AQUI **
// Esta é a forma mais robusta de declarar rotas aninhadas no Express.
router.use('/municipios/:municipioId/secretarias', secretariaRoutes);
router.use('/municipios/:municipioId/secretarias/:secretariaId/servicos', servicoRoutes);

export default router;