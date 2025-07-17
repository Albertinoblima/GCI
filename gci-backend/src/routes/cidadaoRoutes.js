import { Router } from 'express';
import { getAllCidadaos, getCidadaoById, updateCidadao } from '../controllers/cidadaoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMunicipioAccess } from '../middlewares/municipioAccessMiddleware.js';

const router = Router();
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio', 'gestor_secretaria'];

// CORREÇÃO CRÍTICA: Aplicar middleware de validação de município
router.use(authMiddleware(ROLES_GERENCIAMENTO));
router.use(validateMunicipioAccess({ requireMunicipioId: true, allowAdminSistema: true }));

router.get('/', getAllCidadaos);
router.route('/:id').get(getCidadaoById).put(authMiddleware(['admin_sistema']), updateCidadao);

export default router;