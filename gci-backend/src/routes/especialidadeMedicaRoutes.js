// gci-backend/src/routes/especialidadeMedicaRoutes.js
import { Router } from 'express';
import { create, listAll, getOne, update, remove } from '../controllers/especialidadeMedicaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createEspecialidadeSchema from '../schemas/createEspecialidadeMedicaSchema.json' with { type: 'json' };
import updateEspecialidadeSchema from '../schemas/updateEspecialidadeMedicaSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();

const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio'];
const ROLES_VISUALIZACAO = ['admin_sistema', 'admin_municipio', 'agente_atendimento', 'agente_saude'];

// Usa as funções como propriedades do objeto importado
router.route('/')
    .get(authMiddleware(ROLES_VISUALIZACAO), listAll)
    .post(authMiddleware(ROLES_GERENCIAMENTO), jsonParser, validationMiddleware(createEspecialidadeSchema), create);

router.route('/:id')
    .get(authMiddleware(ROLES_VISUALIZACAO), getOne)
    .put(authMiddleware(ROLES_GERENCIAMENTO), jsonParser, validationMiddleware(updateEspecialidadeSchema), update)
    .delete(authMiddleware(ROLES_GERENCIAMENTO), remove);

export default router;