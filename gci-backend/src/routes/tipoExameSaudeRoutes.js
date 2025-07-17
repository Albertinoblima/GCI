import { Router } from 'express';
import { listAll, create, getOne, update, remove } from '../controllers/tipoExameSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createTipoExameSchema from '../schemas/createTipoExameSaudeSchema.json' with { type: 'json' };
import updateTipoExameSchema from '../schemas/updateTipoExameSaudeSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'agente_saude'];
router.use(authMiddleware(ROLES_GERENCIAMENTO));
router.route('/')
    .get(listAll)
    .post(jsonParser, validationMiddleware(createTipoExameSchema), create);
router.route('/:id')
    .get(getOne)
    .put(jsonParser, validationMiddleware(updateTipoExameSchema), update)
    .delete(remove);
export default router;