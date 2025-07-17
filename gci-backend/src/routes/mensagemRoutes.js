import { Router } from 'express';
import { create, findByAtendimento } from '../controllers/mensagemController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = Router({ mergeParams: true });
router.post('/', upload.single('anexo'), handleMulterError, create);
router.get('/', findByAtendimento);
export default router;