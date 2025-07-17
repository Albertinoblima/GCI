// gci-backend/src/routes/servicoRoutes.js
import { Router } from 'express';
import { getAllBySecretaria, create, update, remove } from '../controllers/servicoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import servicoSchema from '../schemas/servicoSchema.json' with { type: 'json' };
import express from 'express';

const router = Router({ mergeParams: true });
const jsonParser = express.json();
router.use(authMiddleware(['admin_sistema', 'admin_municipio', 'gestor_secretaria']));

router.route('/')
    .get(getAllBySecretaria)
    .post(jsonParser, validationMiddleware(servicoSchema), create);

router.route('/:servicoId')
    .put(jsonParser, validationMiddleware(servicoSchema), update)
    .delete(remove);

export default router;