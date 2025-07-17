// gci-backend/src/routes/dashboardRoutes.js
import { Router } from 'express';
import { getStatsCards, getAtendimentosPorSecretaria, getAtendimentosRecentes } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
// Protege todas as rotas do dashboard
router.use(authMiddleware());

router.get('/stats', getStatsCards);
router.get('/atendimentos-por-secretaria', getAtendimentosPorSecretaria);
router.get('/atendimentos-recentes', getAtendimentosRecentes);

export default router;