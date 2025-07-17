// gci-backend/src/routes/escolaRoutes.js
import { Router } from 'express';
import { create, getAllByMunicipio, update, remove } from '../controllers/escolaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createEscolaSchema from '../schemas/createEscolaSchema.json' with { type: 'json' };
import updateEscolaSchema from '../schemas/updateEscolaSchema.json' with { type: 'json' };
import express from 'express';

const router = Router();
const jsonParser = express.json();
const ROLES = ['admin_sistema', 'admin_municipio', 'agente_educacao'];
router.use(authMiddleware(ROLES));

router.route('/')
    .get(getAllByMunicipio)
    .post(jsonParser, validationMiddleware(createEscolaSchema), create);

router.route('/:id')
    .put(jsonParser, validationMiddleware(updateEscolaSchema), update)
    .delete(remove);

export default router;