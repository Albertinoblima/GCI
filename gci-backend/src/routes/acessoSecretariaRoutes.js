import { Router } from 'express';
import { getAcessos, setAcessos } from '../controllers/acessoSecretariaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router({ mergeParams: true });
router.use(authMiddleware(['admin_sistema', 'admin_municipio']));
router.route('/')
    .get(getAcessos)
    .put(setAcessos);
export default router;