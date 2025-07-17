import { Router } from 'express';
import { verifyWebhook, handleWebhookEvent } from '../controllers/metaWebhookController.js';
import { verifyMetaSignature } from '../middlewares/metaVerificationMiddleware.js';

const router = Router();
router.get('/', verifyWebhook);
router.post('/', verifyMetaSignature, handleWebhookEvent);
export default router;