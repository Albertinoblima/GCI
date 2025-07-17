// Teste do servidor com rotas mínimas para diagnóstico
import { Router } from 'express';

// Importar apenas as rotas essenciais primeiro
import authRoutes from './authRoutes.js';
import agendamentoSaudeRoutes from './agendamentoSaudeRoutes.js';

const router = Router();

// Rota de health check
router.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// Apenas rotas essenciais para teste
router.use('/auth', authRoutes);
router.use('/agendamentos-saude', agendamentoSaudeRoutes);

export default router;
