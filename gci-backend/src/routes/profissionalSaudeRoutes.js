import { Router } from 'express';
import { listByMunicipio, create, getLinks, createLink, update, remove } from '../controllers/profissionalSaudeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createProfissionalSchema from '../schemas/createProfissionalSaudeSchema.json' with { type: 'json' };
import updateProfissionalSchema from '../schemas/updateProfissionalSaudeSchema.json' with { type: 'json' };
import linkSchema from '../schemas/linkProfissionalEspecialidadeUnidadeSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();

const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'gestor_secretaria'];

router.use(authMiddleware(ROLES_GERENCIAMENTO));
router.route('/').get(listByMunicipio).post(jsonParser, validationMiddleware(createProfissionalSchema), create);
router.route('/:profissionalId/vinculos').get(getLinks).post(jsonParser, validationMiddleware(linkSchema), createLink);
router.route('/:id').put(jsonParser, validationMiddleware(updateProfissionalSchema), update).delete(remove);

export default router;