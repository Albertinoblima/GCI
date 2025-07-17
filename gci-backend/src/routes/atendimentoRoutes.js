// gci-backend/src/routes/atendimentoRoutes.js
import { Router } from 'express';
import { listAll, create, getOne, update } from '../controllers/atendimentoController.js';
import mensagemRoutes from './mensagemRoutes.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import express from 'express';

const router = Router();
const jsonParser = express.json();
const ROLES_ALL = ['admin_sistema', 'admin_municipio', 'gestor_secretaria', 'agente_atendimento'];

router.use(authMiddleware(ROLES_ALL));

router.route('/')
    .get(listAll)
    .post(jsonParser, create);

router.route('/:idOrProtocolo')
    .get(getOne)
    .put(jsonParser, update);

router.use('/:atendimentoId/mensagens', mensagemRoutes);

export default router;