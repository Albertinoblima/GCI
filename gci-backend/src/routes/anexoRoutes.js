import { Router } from 'express';
import { uploadAnexo, getAnexosByReferencia, downloadAnexo, deleteAnexo } from '../controllers/anexoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = Router();
const ROLES = ['admin_sistema', 'admin_municipio', 'gestor_secretaria', 'agente_atendimento'];
router.use(authMiddleware(ROLES));

router.post('/', upload.single('anexo'), handleMulterError, uploadAnexo);
router.get('/', getAnexosByReferencia);
router.get('/:id/download', downloadAnexo);
router.delete('/:id', deleteAnexo);
export default router;