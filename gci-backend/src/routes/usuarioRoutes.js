import express from 'express';
import { Router } from 'express';
import { getAll, create, getOne, update, remove } from '../controllers/usuarioController.js';
import acessoSecretariaRoutes from './acessoSecretariaRoutes.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateMunicipioAccess } from '../middlewares/municipioAccessMiddleware.js';
import { validateUserHierarchy, validateUserCreationHierarchy } from '../middlewares/hierarchyMiddleware.js';
import { securityAuditMiddleware, hierarchyBypassDetection, dataLeakageDetection } from '../middlewares/securityAuditMiddleware.js';
import { validationMiddleware } from '../middlewares/validationMiddleware.js';
import createUsuarioSchema from '../schemas/createUsuarioSchema.json' with { type: 'json' };
import updateUsuarioSchema from '../schemas/updateUsuarioSchema.json' with { type: 'json' };

const router = Router();
const jsonParser = express.json();
const ROLES_GERENCIAMENTO = ['admin_sistema', 'admin_municipio'];

// CORREÇÃO CRÍTICA: Aplicar middlewares de segurança e hierarquia
router.use(authMiddleware(ROLES_GERENCIAMENTO));
router.use(validateMunicipioAccess({ requireMunicipioId: false, allowAdminSistema: true }));
router.use(securityAuditMiddleware('usuarios'));
router.use(hierarchyBypassDetection());
router.use(dataLeakageDetection());
router.use(validateUserHierarchy());

router.route('/').get(getAll).post(
    jsonParser,
    validateUserCreationHierarchy(),
    validationMiddleware(createUsuarioSchema),
    create
);
router.route('/:id').get(getOne).put(
    jsonParser,
    validationMiddleware(updateUsuarioSchema),
    update
).delete(remove);

router.use('/:usuarioId/acessos-secretarias', acessoSecretariaRoutes);

export default router;