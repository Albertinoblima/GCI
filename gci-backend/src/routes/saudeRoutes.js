// gci-backend/src/routes/saudeRoutes.js
import { Router } from 'express';
import { getOpcoesAgendamento, getHorariosDisponiveis } from '../controllers/saudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const ROLES_SAUDE = ['admin_sistema', 'admin_municipio', 'agente_saude'];

router.use(authMiddleware(ROLES_SAUDE));

// Rota para popular os selects do formulário de agendamento
router.get('/opcoes-agendamento', getOpcoesAgendamento);

// Rota para buscar horários com base nos filtros
router.get('/horarios-disponiveis', getHorariosDisponiveis);

export default router;