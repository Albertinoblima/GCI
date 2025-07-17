// gci-backend/src/routes/secretariaRoutes.js
import { Router } from 'express';
import { create, getAllByMunicipio, getOne, update, remove } from '../controllers/secretariaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import secretariaSchema from '../schemas/secretariaSchema.json' with { type: 'json' };

// 1. IMPORTE O ROTEADOR FILHO
import servicoRoutes from './servicoRoutes.js';

// mergeParams: true é essencial para que esta rota acesse :municipioId da rota pai
const router = Router({ mergeParams: true });

// Protege todas as rotas de secretaria
router.use(authMiddleware(['admin_sistema', 'admin_municipio']));

// ===================================================================
// ROTAS DE SERVIÇOS (ANINHADAS)
// Defina esta rota PRIMEIRO, para que ela tenha precedência.
// ===================================================================
router.use('/:secretariaId/servicos', servicoRoutes);

// ===================================================================
// ROTAS DE SECRETARIAS (recurso atual)
// ===================================================================
router.route('/')
    .get(getAllByMunicipio)
    .post(validationMiddleware(secretariaSchema), create);

router.route('/:secretariaId')
    .get(getOne)
    .put(validationMiddleware(secretariaSchema), update)
    .delete(remove);

export default router;