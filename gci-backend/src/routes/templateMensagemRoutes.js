import { Router } from 'express';
import { getAll, create, getOne, update, remove } from '../controllers/templateMensagemController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createTemplateSchema from '../schemas/createTemplateMensagemSchema.json' with { type: 'json' };
import updateTemplateSchema from '../schemas/updateTemplateMensagemSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio'];
router.use(authMiddleware(ROLES_GERENCIAMENTO));
router.route('/').get(getAll).post(jsonParser, validationMiddleware(createTemplateSchema), create);
router.route('/:id').get(getOne).put(jsonParser, validationMiddleware(updateTemplateSchema), update).delete(remove);
export default router;