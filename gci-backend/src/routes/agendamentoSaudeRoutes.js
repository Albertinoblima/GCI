import { Router } from 'express';
import { create, listAll, getOne, updateStatus } from '../controllers/agendamentoSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createAgendamentoSchema from '../schemas/createAgendamentoSchema.json' with { type: 'json' };
import updateStatusSchema from '../schemas/updateAgendamentoStatusSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();

const ROLES_AGENTE = ['admin_sistema', 'admin_municipio', 'agente_saude'];
const ROLES_CIDADAO = ['cidadao'];
const ALL_ROLES = [...ROLES_AGENTE, ...ROLES_CIDADAO];

router.route('/').get(authMiddleware(ALL_ROLES), listAll).post(authMiddleware(ROLES_CIDADAO), jsonParser, validationMiddleware(createAgendamentoSchema), create);
router.route('/:id').get(authMiddleware(ALL_ROLES), getOne);
router.route('/:id/status').put(authMiddleware(ROLES_AGENTE), jsonParser, validationMiddleware(updateStatusSchema), updateStatus);

export default router;