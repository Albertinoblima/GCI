// gci-backend/src/routes/matriculaRoutes.js
import { Router } from 'express';
import { list, create, getOne, update } from '../controllers/matriculaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createMatriculaSchema from '../schemas/createSolicitacaoMatriculaSchema.json' with { type: 'json' };
import updateMatriculaStatusSchema from '../schemas/updateSolicitacaoMatriculaSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
router.use(authMiddleware());
const ROLES_CRIACAO = ['cidadao']; // Futuramente
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'agente_educacao'];

router.route('/')
    .get(authMiddleware(ROLES_GERENCIAMENTO), list)
    .post(authMiddleware(ROLES_CRIACAO), jsonParser, validationMiddleware(createMatriculaSchema), create); // Por enquanto, a criação via API pode ser limitada

router.route('/:id')
    .get(authMiddleware(ROLES_GERENCIAMENTO), getOne);

// Rota específica para mudar o status
router.route('/:id/status')
    .patch(authMiddleware(ROLES_GERENCIAMENTO), jsonParser, validationMiddleware(updateMatriculaStatusSchema), update);

export default router;