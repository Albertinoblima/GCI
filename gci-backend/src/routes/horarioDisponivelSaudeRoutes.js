// gci-backend/src/routes/horarioDisponivelSaudeRoutes.js
import { Router } from 'express';
import { listAll, create, getOne, update, remove, createBatch } from '../controllers/horarioDisponivelSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import requestLogger from '../middlewares/requestLogger.js';
import createHorarioSchema from '../schemas/createHorarioSchema.json' with { type: 'json' };
import updateHorarioSchema from '../schemas/updateHorarioSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();

const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'agente_saude'];
const ROLES_VISUALIZACAO = [...ROLES_GERENCIAMENTO, 'cidadao'];

router.route('/')
    .get(authMiddleware(ROLES_VISUALIZACAO), listAll)
    .post(authMiddleware(ROLES_GERENCIAMENTO), jsonParser, validationMiddleware(createHorarioSchema), create);

// Rota para criação em lote
router.post('/batch',
    authMiddleware(ROLES_GERENCIAMENTO),
    jsonParser,
    createBatch
);

router.route('/:id')
    .get(authMiddleware(ROLES_VISUALIZACAO), getOne)
    .put(authMiddleware(ROLES_GERENCIAMENTO), jsonParser, validationMiddleware(updateHorarioSchema), update)
    .delete(authMiddleware(ROLES_GERENCIAMENTO), remove);

export default router;