// gci-backend/src/routes/educacaoRoutes.js
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import matriculaRoutes from './matriculaRoutes.js';
import escolaRoutes from './escolaRoutes.js';

const router = Router();
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'agente_educacao'];

// Protege todas as rotas de educação
router.use(authMiddleware(ROLES_GERENCIAMENTO));

// Aninha as rotas específicas de educação
router.use('/matriculas', matriculaRoutes);
router.use('/escolas', escolaRoutes);

export default router;