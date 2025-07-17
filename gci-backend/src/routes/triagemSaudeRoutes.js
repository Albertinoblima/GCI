import { Router } from 'express';
import { create, listAll, getOne, update } from '../controllers/triagemSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createTriagemSchema from '../schemas/createTriagemSchema.json' with { type: 'json' };
import updateTriagemSchema from '../schemas/updateTriagemSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
router.use(authMiddleware());
const ROLES_AGENTE = ['admin_sistema', 'admin_municipio', 'agente_saude'];
const ROLES_CIDADAO = ['cidadao'];
const ALL_ROLES = [...ROLES_AGENTE, ...ROLES_CIDADAO];

router.route('/').get(authMiddleware(ROLES_AGENTE), listAll).post(authMiddleware(ALL_ROLES), jsonParser, validationMiddleware(createTriagemSchema), create);
router.route('/:id').get(authMiddleware(ROLES_AGENTE), getOne).put(authMiddleware(ROLES_AGENTE), jsonParser, validationMiddleware(updateTriagemSchema), update);
export default router;